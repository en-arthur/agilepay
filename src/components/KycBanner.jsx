'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { apiGet } from '@/lib/api'
import { ShieldCheck, AlertTriangle, ExternalLink, X, RefreshCw } from 'lucide-react'

/**
 * Sticky top-of-dashboard KYC banner.
 * Shows when kyc_status is NOT 'APPROVED'.
 * Dismissible per session (not persisted — reappears on refresh until approved).
 */
export default function KycBanner() {
  const { merchant, getToken } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [kycLink, setKycLink]     = useState(null)
  const [loading, setLoading]     = useState(false)

  const status = merchant?.kyc_status ?? 'NOT_STARTED'

  // Pre-fetch the verification link so the CTA works instantly
  useEffect(() => {
    if (status === 'APPROVED' || status === 'PENDING') return
    const token = getToken()
    if (!token) return
    setLoading(true)
    apiGet('/v1/merchants/me/kyc', token)
      .then(d => setKycLink(d.kyc_link))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  // Nothing to show if approved or dismissed
  if (status === 'APPROVED' || dismissed) return null

  const configs = {
    NOT_STARTED: {
      bg:   'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      title: 'Complete KYC to activate live payments',
      body:  'Your account is in sandbox mode. Complete identity verification to accept real payments and enable off-ramp settlement.',
      cta:   'Start KYC Verification',
    },
    PENDING: {
      bg:   'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800',
      icon: RefreshCw,
      iconColor: 'text-blue-500',
      title: 'KYC under review',
      body:  'Your documents are being reviewed. This typically takes 1 business day. You\'ll get an email once approved.',
      cta:   null,
    },
    RFI: {
      bg:   'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      title: 'Additional information required',
      body:  'Lumx has requested more details to complete your KYC. Open the verification form to continue.',
      cta:   'Continue KYC →',
    },
    FINAL_REJECTION: {
      bg:   'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800',
      icon: AlertTriangle,
      iconColor: 'text-rose-500',
      title: 'KYC verification rejected',
      body:  'Your identity verification was rejected. Please contact support at support@agilepay.io for assistance.',
      cta:   null,
    },
  }

  const cfg = configs[status] ?? configs.NOT_STARTED
  const Icon = cfg.icon

  return (
    <div className={`w-full flex items-start gap-3 px-5 py-4 rounded-2xl border mb-6 ${cfg.bg}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white">{cfg.title}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{cfg.body}</p>
        {cfg.cta && (
          <a
            href={kycLink || '#'}
            target="_blank"
            rel="noreferrer"
            onClick={!kycLink && !loading ? e => { e.preventDefault() } : undefined}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
          >
            {loading ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading link…</>
            ) : (
              <><ExternalLink className="w-3.5 h-3.5" /> {cfg.cta}</>
            )}
          </a>
        )}
      </div>
      <button onClick={() => setDismissed(true)}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
        aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
