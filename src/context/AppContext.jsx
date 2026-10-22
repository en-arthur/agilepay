'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { session, merchant: authMerchant } = useAuth()

  // ── UI state (non-server) ─────────────────────────────────────────────────
  const [isSandbox, setIsSandbox]           = useState(false)
  const [toastMessage, setToastMessage]     = useState(null)

  // ── Server-fetched state ──────────────────────────────────────────────────
  const [links, setLinks]               = useState([])
  const [transactions, setTransactions] = useState([])
  const [apiKeys, setApiKeys]           = useState([])
  const [destinations, setDestinations] = useState([])
  const [loadingLinks, setLoadingLinks]               = useState(false)
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [loadingApiKeys, setLoadingApiKeys]           = useState(false)
  const [loadingDestinations, setLoadingDestinations] = useState(false)

  // ── Derive account type from the authenticated merchant profile ───────────
  // Backend returns "DEVELOPER" | "MERCHANT" | "INDIVIDUAL" (uppercase).
  // Normalise to lowercase so nav/UI comparisons ("developer", "merchant", "individual") work.
  const rawType = authMerchant?.account_type ?? 'DEVELOPER'
  const accountType = rawType.toLowerCase() // "developer" | "merchant" | "individual"

  const token = session?.access_token ?? null

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() })
    setTimeout(() => setToastMessage(null), 3800)
  }

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const loadTransactions = useCallback(async () => {
    if (!token) return
    setLoadingTransactions(true)
    try {
      const data = await apiGet('/v1/transactions?limit=50', token)
      setTransactions(normaliseTransactions(data))
    } catch (e) {
      console.error('loadTransactions:', e)
    } finally {
      setLoadingTransactions(false)
    }
  }, [token])

  const loadLinks = useCallback(async () => {
    if (!token) return
    setLoadingLinks(true)
    try {
      const data = await apiGet('/v1/links', token)
      setLinks(normaliseLinks(data))
    } catch (e) {
      console.error('loadLinks:', e)
    } finally {
      setLoadingLinks(false)
    }
  }, [token])

  const loadApiKeys = useCallback(async () => {
    if (!token) return
    setLoadingApiKeys(true)
    try {
      const data = await apiGet('/v1/api-keys', token)
      setApiKeys(normaliseApiKeys(data))
    } catch (e) {
      console.error('loadApiKeys:', e)
    } finally {
      setLoadingApiKeys(false)
    }
  }, [token])

  const loadDestinations = useCallback(async () => {
    if (!token) return
    setLoadingDestinations(true)
    try {
      const data = await apiGet('/v1/destinations/dashboard', token)
      setDestinations(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('loadDestinations:', e)
    } finally {
      setLoadingDestinations(false)
    }
  }, [token])

  // ── Bootstrap on session ready ────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setLinks([])
      setTransactions([])
      setApiKeys([])
      setDestinations([])
      return
    }
    loadTransactions()
    loadLinks()
    loadDestinations()
    if (accountType === 'developer') loadApiKeys()
  }, [token, accountType]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mutations ─────────────────────────────────────────────────────────────

  /** Create a payment link — calls POST /v1/links then refreshes the list */
  const createPaymentLink = async (newLinkData) => {
    if (!token) throw new Error('Not authenticated')
    try {
      const created = await apiPost('/v1/links', {
        title:                  newLinkData.title || 'Payment Order',
        description:            newLinkData.note || '',
        amount_cents:           newLinkData.amount ? Math.round(Number(newLinkData.amount) * 100) : null,
        currency:               newLinkData.currency || 'USD',
        is_fixed_amount:        !!newLinkData.amount,
        default_destination_id: newLinkData.destination_id || undefined,
      }, token)

      await loadLinks()
      showToast(`Payment link created: /pay/${created.link_id}`)
      return created
    } catch (e) {
      showToast(e.message || 'Failed to create link', 'error')
      throw e
    }
  }

  /** Create an API key — DEVELOPER only */
  const createApiKey = async (keyName) => {
    if (!token) throw new Error('Not authenticated')
    try {
      const created = await apiPost('/v1/api-keys', {
        name:        keyName,
        environment: isSandbox ? 'TEST' : 'LIVE',
        scopes:      ['charges:create', 'links:create', 'transactions:read'],
      }, token)

      // The raw key is returned once — keep it in state so the UI can show it
      const newKey = {
        id:          created.id,
        name:        created.name,
        mode:        created.environment === 'LIVE' ? 'live' : 'sandbox',
        prefix:      created.key?.substring(0, 12) + '...' ?? '••••',
        fullKey:     created.key ?? '',   // shown ONCE
        last_four:   created.key?.slice(-4) ?? '',
        created:     created.created_at?.split('T')[0] ?? '',
        lastUsed:    'Never',
      }
      setApiKeys((prev) => [newKey, ...prev])
      showToast('New API Key generated. Store it now — it won\'t be shown again.')
      return newKey
    } catch (e) {
      showToast(e.message || 'Failed to create API key', 'error')
      throw e
    }
  }

  /** Revoke an API key */
  const deleteApiKey = async (id) => {
    if (!token) throw new Error('Not authenticated')
    try {
      await apiDelete(`/v1/api-keys/${id}`, token)
      setApiKeys((prev) => prev.filter((k) => k.id !== id))
      showToast('API key revoked', 'info')
    } catch (e) {
      showToast(e.message || 'Failed to revoke key', 'error')
    }
  }

  // ── Destination mutations ─────────────────────────────────────────────────

  /** Register a new bank destination via dashboard JWT route */
  const addDestination = async (payload) => {
    if (!token) throw new Error('Not authenticated')
    const result = await apiPost('/v1/destinations/dashboard', payload, token)
    await loadDestinations()
    showToast('Destination registered. Approval takes up to 24 hours.')
    return result
  }

  /** Remove a destination */
  const removeDestination = async (id) => {
    if (!token) throw new Error('Not authenticated')
    await apiDelete(`/v1/destinations/dashboard/${id}`, token)
    setDestinations((prev) => prev.filter((d) => d.id !== id))
    showToast('Destination removed', 'info')
  }

  /** Set a destination as default */
  const setDefaultDestination = async (id) => {
    if (!token) throw new Error('Not authenticated')
    await apiPatch(`/v1/destinations/dashboard/${id}/default`, {}, token)
    await loadDestinations()
    showToast('Default destination updated')
  }

  // ── Remittance mutations (INDIVIDUAL accounts) ────────────────────────────

  const submitRemittanceKyc = async (payload) => {
    if (!token) throw new Error('Not authenticated')
    return apiPost('/v1/remittance/kyc', payload, token)
  }

  const createDeposit = async (payload) => {
    if (!token) throw new Error('Not authenticated')
    const result = await apiPost('/v1/remittance/deposit', payload, token)
    await loadTransactions()
    return result
  }

  const addRecipient = async (payload) => {
    if (!token) throw new Error('Not authenticated')
    return apiPost('/v1/remittance/recipients', payload, token)
  }

  const getRecipients = async () => {
    if (!token) throw new Error('Not authenticated')
    return apiGet('/v1/remittance/recipients', token)
  }

  const lockRate = async (payload) => {
    if (!token) throw new Error('Not authenticated')
    return apiPost('/v1/remittance/rate', payload, token)
  }

  const sendRemittance = async (payload) => {
    if (!token) throw new Error('Not authenticated')
    const result = await apiPost('/v1/remittance/send', payload, token)
    await loadTransactions()
    return result
  }

  const getRemittanceHistory = async (limit = 20) => {
    if (!token) throw new Error('Not authenticated')
    return apiGet(`/v1/remittance/history?limit=${limit}`, token)
  }

  /** Record a checkout payment (called after /pay/[linkId] POST succeeds) */
  const recordCheckoutPayment = async () => {
    await loadTransactions()
  }

  // ── Webhook config (local-only for now, wired to display) ─────────────────
  const [webhookConfig, setWebhookConfig] = useState({
    url:    '',
    events: ['payment.success', 'offramp.completed', 'customer.created'],
    secret: '',
  })
  const [webhookLogs, setWebhookLogs] = useState([])
  const [partnerFee, setPartnerFee] = useState({
    percentage:    1.0,
    partnerFeeId:  '',
  })

  // ── Populate webhook / partner fee from merchant profile ─────────────────
  useEffect(() => {
    if (authMerchant) {
      setPartnerFee((prev) => ({
        ...prev,
        partnerFeeId: `pfee_${authMerchant.id?.substring(0, 8) ?? 'agile'}`,
      }))
    }
  }, [authMerchant])

  const value = {
    // auth-derived
    accountType,

    // UI toggles
    isSandbox,
    setIsSandbox,

    // data
    links,
    transactions,
    apiKeys,
    destinations,
    loadingLinks,
    loadingTransactions,
    loadingApiKeys,
    loadingDestinations,

    // refresh
    loadLinks,
    loadTransactions,
    loadApiKeys,
    loadDestinations,

    // link mutations
    createPaymentLink,
    recordCheckoutPayment,

    // api key mutations
    createApiKey,
    deleteApiKey,

    // destination mutations
    addDestination,
    removeDestination,
    setDefaultDestination,

    // remittance mutations
    submitRemittanceKyc,
    createDeposit,
    addRecipient,
    getRecipients,
    lockRate,
    sendRemittance,
    getRemittanceHistory,

    // webhook / partner
    webhookConfig,
    setWebhookConfig,
    webhookLogs,
    setWebhookLogs,
    partnerFee,
    setPartnerFee,

    // toast
    toastMessage,
    showToast,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium transition-all animate-bounce bg-slate-900 text-white dark:bg-brand-600 dark:border-brand-500 border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage.message}</span>
        </div>
      )}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within an AppProvider')
  return context
}

// ── Normalisers — map FastAPI shapes to the shapes the UI components expect ──

function normaliseTransactions(data) {
  if (!Array.isArray(data)) return []
  return data.map((tx) => ({
    id:           tx.charge_id || tx.id,
    customer:     tx.payer_name  || 'Unknown',
    email:        tx.payer_email || '',
    date:         tx.created_at  ? new Date(tx.created_at).toLocaleString() : '',
    amount:       Number(tx.source_amount) || 0,
    currency:     tx.source_currency || 'USDC',
    localAmount:  Number(tx.target_amount) || 0,
    localCurrency: tx.target_currency || '',
    channel:      tx.type === 'ON_RAMP' ? 'On-ramp' : 'USDC Rail',
    rail:         'Off-ramped via Lumx Base USDC',
    status:       normaliseStatus(tx.status),
    reference:    tx.charge_id || tx.id,
    // raw fields for expanded detail
    lumx_transaction_id: tx.lumx_transaction_id,
    description:  tx.description,
  }))
}

function normaliseStatus(status) {
  const map = {
    COMPLETED:  'Paid - Settled',
    PROCESSING: 'Processing',
    PENDING:    'Pending',
    FAILED:     'Failed',
    CANCELLED:  'Cancelled',
    REFUNDED:   'Refunded',
    AWAITING_FUNDS: 'Awaiting Funds',
  }
  return map[status] || status
}

function normaliseLinks(data) {
  if (!Array.isArray(data)) return []
  return data.map((lnk) => ({
    id:            lnk.link_id,
    title:         lnk.title,
    amount:        lnk.amount_cents ? lnk.amount_cents / 100 : 0,
    currency:      lnk.currency || 'USD',
    localAmount:   lnk.amount_cents ? (lnk.amount_cents / 100) * 15.5 : 0,
    localCurrency: 'GHS',
    destination:   lnk.default_destination_id || 'Default destination',
    shortUrl:      `agilepay.me/pay/${lnk.link_id}`,
    status:        lnk.is_active ? 'Active' : 'Inactive',
    views:         0,
    paymentsCount: lnk.use_count || 0,
    createdAt:     lnk.created_at?.split('T')[0] ?? '',
    note:          lnk.description || '',
    // raw
    link_id:       lnk.link_id,
    raw:           lnk,
  }))
}

function normaliseApiKeys(data) {
  if (!Array.isArray(data)) return []
  return data.map((k) => ({
    id:        k.id,
    name:      k.name || 'Unnamed key',
    mode:      k.environment === 'LIVE' ? 'live' : 'sandbox',
    prefix:    k.prefix || 'sk_',
    fullKey:   '',  // never returned after creation
    last_four: k.last_four || '••••',
    created:   k.created_at?.split('T')[0] ?? '',
    lastUsed:  k.last_used_at
                 ? new Date(k.last_used_at).toLocaleString()
                 : 'Never',
    scopes:    k.scopes || [],
  }))
}
