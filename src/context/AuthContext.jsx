'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiPost } from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const router = useRouter()
  const [session, setSession]   = useState(null)   // Supabase session
  const [merchant, setMerchant] = useState(null)   // merchant profile from FastAPI
  const [loading, setLoading]   = useState(true)   // true while restoring session

  // ── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        // Clear cached merchant profile on sign-out
        if (!session) setMerchant(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── Fetch merchant profile from FastAPI ──────────────────────────────────
  const fetchMerchant = useCallback(async (token) => {
    try {
      const data = await apiGet('/v1/merchants/me', token)
      setMerchant(data)
      return data
    } catch {
      return null
    }
  }, [])

  // Fetch whenever session appears/refreshes
  useEffect(() => {
    if (session?.access_token) {
      fetchMerchant(session.access_token)
    }
  }, [session, fetchMerchant])

  // ── Sign in ──────────────────────────────────────────────────────────────
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  // ── Sign up — creates Supabase user + Lumx customer via FastAPI ──────────
  const signUp = async (payload) => {
    // payload: { email, password, full_name, business_name, account_type, ... }
    const data = await apiPost('/v1/auth/signup', payload)
    // After signup the user still needs to sign in to get a session
    return data
  }

  // ── Sign out ─────────────────────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut()
    setMerchant(null)
    router.push('/signin')
  }

  // ── Token accessor (always fresh via Supabase auto-refresh) ─────────────
  const getToken = () => session?.access_token ?? null

  const value = {
    session,
    merchant,
    loading,
    signIn,
    signUp,
    signOut,
    getToken,
    fetchMerchant,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

// ── Small helper — import apiGet inside this file avoids circular dep ────────
async function apiGet(path, token) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `${res.status}`)
  }
  return res.json()
}
