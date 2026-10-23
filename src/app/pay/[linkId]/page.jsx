'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import {
  CreditCard, Smartphone, Coins, ShieldCheck, CheckCircle2,
  Lock, ArrowRight, Sun, Moon, Zap, Check, AlertCircle,
} from 'lucide-react'

import { API_URL } from '@/lib/apiUrl'

async function fetchLink(linkId) {
  const res = await fetch(`${API_URL}/pay/${linkId}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Link not found (${res.status})`)
  }
  return res.json()
}

async function submitPayment(linkId, payload) {
  const res = await fetch(`${API_URL}/pay/${linkId}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Payment failed')
  }
  return res.json()
}

export default function HostedCheckoutPage() {
  const params = useParams()
  const linkId = params?.linkId
  const { theme, toggleTheme } = useTheme()

  // Link data from FastAPI
  const [linkData, setLinkData]   = useState(null)
  const [linkError, setLinkError] = useState(null)
  const [loadingLink, setLoadingLink] = useState(true)

  useEffect(() => {
    if (!linkId) return
    setLoadingLink(true)
    fetchLink(linkId)
      .then(setLinkData)
      .catch(e => setLinkError(e.message))
      .finally(() => setLoadingLink(false))
  }, [linkId])

  // Form state
  const [paymentMethod, setPaymentMethod] = useState('momo')
  const [buyerName,  setBuyerName]   = useState('')
  const [buyerEmail, setBuyerEmail]  = useState('')
  const [buyerPhone, setBuyerPhone]  = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [momoNetwork, setMomoNetwork] = useState('mtn')

  // Checkout flow state: 'idle' | 'processing' | 'success' | 'error'
  const [checkoutState, setCheckoutState]   = useState('idle')
  const [completedResult, setCompletedResult] = useState(null)
  const [submitError, setSubmitError]       = useState('')

  const resolvedAmountCents = linkData?.amount_cents
    ?? (amountInput ? Math.round(parseFloat(amountInput) * 100) : 0)
  const resolvedAmountUSD = resolvedAmountCents / 100

  const handlePayNow = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setCheckoutState('processing')

    try {
      const result = await submitPayment(linkId, {
        payer_name:   buyerName,
        payer_email:  buyerEmail,
        payer_phone:  buyerPhone || null,
        amount_cents: linkData?.is_fixed_amount ? undefined : resolvedAmountCents,
      })
      setCompletedResult(result)
      setCheckoutState('success')
    } catch (err) {
      setSubmitError(err.message)
      setCheckoutState('error')
    }
  }

  // ── Loading / error states ───────────────────────────────────────────────
  if (loadingLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#080B14]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading checkout…</p>
        </div>
      </div>
    )
  }

  if (linkError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#080B14] p-4">
        <div className="max-w-sm w-full p-8 rounded-2xl bg-white dark:bg-[#0E1321] border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Link Unavailable</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{linkError}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold">
            <Zap className="w-4 h-4" /> Go to AgilePay
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080B14] text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <Zap className="w-3.5 h-3.5 fill-white stroke-none" />
          </div>
          <span className="font-extrabold text-base text-slate-900 dark:text-white">AgilePay</span>
          <span className="text-[10px] font-semibold text-slate-400">Checkout</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full">
            <Lock className="w-3 h-3" /> 256-bit Encrypted
          </span>
          <button onClick={toggleTheme} aria-label="Toggle Theme" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="max-w-4xl w-full mx-auto my-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Order summary */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#0E1321] border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Payment Request</span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">{linkData?.title}</h2>
            {linkData?.description && (
              <p className="text-xs text-slate-400 mt-1">{linkData.description}</p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Total Due:</span>
              <div className="text-right">
                {linkData?.is_fixed_amount ? (
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    ${resolvedAmountUSD.toFixed(2)} {linkData?.currency}
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-slate-500">Buyer sets amount</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Instant digital receipt sent to your email</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Settled directly to merchant bank account</span>
            </div>
          </div>
        </div>

        {/* Payment form */}
        <div className="md:col-span-7 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0E1321] border border-slate-200 dark:border-slate-800 shadow-xl">
          {submitError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}

          <form onSubmit={handlePayNow} className="space-y-5">
            {/* Variable amount */}
            {linkData && !linkData.is_fixed_amount && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Amount ({linkData.currency}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                  <input type="number" step="0.01" min={linkData.min_amount_cents ? linkData.min_amount_cents / 100 : 1}
                    max={linkData.max_amount_cents ? linkData.max_amount_cents / 100 : undefined}
                    required value={amountInput} onChange={e => setAmountInput(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {linkData.min_amount_cents && (
                  <p className="text-[11px] text-slate-400 mt-1">Min: ${(linkData.min_amount_cents / 100).toFixed(2)}</p>
                )}
              </div>
            )}

            {/* Buyer info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
                <input type="text" required value={buyerName} onChange={e => setBuyerName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Email *</label>
                <input type="email" required value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Phone (optional)</label>
              <input type="text" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)}
                placeholder="+233 24 000 0000"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Payment method selector — informational only (actual payment is USDC on backend) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Settlement Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'momo',   label: 'Mobile Money', icon: Smartphone, color: 'text-amber-500' },
                  { id: 'card',   label: 'Card',         icon: CreditCard,  color: 'text-indigo-500' },
                  { id: 'crypto', label: 'Base USDC',    icon: Coins,       color: 'text-cyan-500' },
                ].map((m) => (
                  <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                      paymentMethod === m.id
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/30'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}>
                    <m.icon className={`w-5 h-5 ${m.color}`} />
                    <span className="text-xs font-bold">{m.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Payment is processed via USDC on Base and settled by the merchant's registered destination.
              </p>
            </div>

            <button type="submit" disabled={checkoutState === 'processing'}
              className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-glow hover:shadow-glow-sm transition-all active:scale-[0.99] disabled:opacity-60">
              <Lock className="w-4 h-4" />
              {checkoutState === 'processing'
                ? 'Processing…'
                : `Pay $${resolvedAmountUSD.toFixed(2)} ${linkData?.currency ?? 'USD'} Now`}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center pt-8 text-xs text-slate-400 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Secured by AgilePay · Powered by Lumx on Base Network</span>
      </footer>

      {/* Processing / Success Modal */}
      {(checkoutState === 'processing' || checkoutState === 'success') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md" />
          <div className="relative w-full max-w-md bg-white dark:bg-[#0D1220] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-center space-y-6">

            {checkoutState === 'processing' ? (
              <div className="py-6 space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-16 h-16 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-brand-500 fill-brand-500 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Routing via Lumx rails…</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Initiating USDC clearing and fiat off-ramp to merchant destination.
                  </p>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full w-2/3 animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Payment Initiated!</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    A receipt will be sent to {buyerEmail} once settled.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Settlement in progress
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Charge ID:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{completedResult?.charge_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount:</span>
                    <span className="font-bold text-slate-900 dark:text-white">${resolvedAmountUSD.toFixed(2)} {linkData?.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400 capitalize">{completedResult?.status}</span>
                  </div>
                </div>
                <button onClick={() => setCheckoutState('idle')}
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
