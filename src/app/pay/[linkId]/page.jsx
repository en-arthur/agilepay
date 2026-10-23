'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import {
  ShieldCheck, CheckCircle2, Lock, Sun, Moon, Zap, Check, AlertCircle,
  Copy, Building2, Clock, ArrowRight, RefreshCw,
} from 'lucide-react'

import { API_URL } from '@/lib/apiUrl'

const CURRENCY_SYMBOL = { USD: '$', GBP: '£', EUR: '€', MXN: 'MX$', BRL: 'R$' }

const FIELD_LABELS = {
  iban:          'IBAN',
  bic:           'BIC / SWIFT',
  sortCode:      'Sort code',
  accountNumber: 'Account number',
  routingNumber: 'Routing number',
  clabe:         'CLABE',
  accountType:   'Account type',
  brCode:        'PIX code',
  phone:         'Phone',
  taxId:         'Tax ID',
  name:          'Account name',
}

const RAIL_LABEL = {
  SWIFT:   'International bank transfer (SWIFT)',
  SEPA:    'SEPA bank transfer',
  FPS:     'Faster Payments (UK)',
  ACH:     'ACH bank transfer (US)',
  FEDWIRE: 'Fedwire bank transfer (US)',
  SPEI:    'SPEI transfer (Mexico)',
  PIX:     'PIX instant payment (Brazil)',
}

function label(key) {
  return FIELD_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
}

function money(amount, currency) {
  const sym = CURRENCY_SYMBOL[currency] || ''
  return `${sym}${Number(amount || 0).toFixed(2)} ${currency}`
}

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
    throw new Error(err.detail || 'Could not start the payment')
  }
  return res.json()
}

async function fetchCollection(linkId, collectionId) {
  const res = await fetch(`${API_URL}/pay/${linkId}/collections/${collectionId}`)
  if (!res.ok) return null
  return res.json()
}

function CopyRow({ label: fieldLabel, value, mono = true }) {
  const [copied, setCopied] = useState(false)
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-200/70 dark:border-slate-800 last:border-0">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{fieldLabel}</p>
        <p className={`text-sm font-semibold text-slate-900 dark:text-white break-all ${mono ? 'font-mono' : ''}`}>
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(String(value))
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
        className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label={`Copy ${fieldLabel}`}
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

export default function HostedCheckoutPage() {
  const params = useParams()
  const linkId = params?.linkId
  const { theme, toggleTheme } = useTheme()

  const [linkData, setLinkData]     = useState(null)
  const [linkError, setLinkError]   = useState(null)
  const [loadingLink, setLoadingLink] = useState(true)

  // Payer details
  const [buyerName,  setBuyerName]   = useState('')
  const [buyerEmail, setBuyerEmail]  = useState('')
  const [buyerPhone, setBuyerPhone]  = useState('')
  const [amountInput, setAmountInput] = useState('')

  // Flow: idle → instructions → completed
  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [collection, setCollection]   = useState(null)

  useEffect(() => {
    if (!linkId) return
    setLoadingLink(true)
    fetchLink(linkId)
      .then(setLinkData)
      .catch((e) => setLinkError(e.message))
      .finally(() => setLoadingLink(false))
  }, [linkId])

  const currency = linkData?.currency || 'USD'
  const resolvedAmountCents = linkData?.amount_cents
    ?? (amountInput ? Math.round(parseFloat(amountInput) * 100) : 0)
  const resolvedAmount = resolvedAmountCents / 100

  // ── Poll for payment confirmation ─────────────────────────────────────────
  const pollStatus = useCallback(async () => {
    if (!collection?.id) return
    const fresh = await fetchCollection(linkId, collection.id)
    if (fresh) setCollection((prev) => ({ ...prev, ...fresh }))
  }, [collection?.id, linkId])

  useEffect(() => {
    if (!collection?.id) return
    if (!['AWAITING_FUNDS', 'PENDING', 'PROCESSING'].includes(collection.status)) return
    const timer = setInterval(pollStatus, 5000)
    return () => clearInterval(timer)
  }, [collection?.id, collection?.status, pollStatus])

  const handleStartPayment = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    try {
      const result = await submitPayment(linkId, {
        payer_name:   buyerName,
        payer_email:  buyerEmail,
        payer_phone:  buyerPhone || null,
        amount_cents: linkData?.is_fixed_amount ? undefined : resolvedAmountCents,
      })
      // POST returns `collection_id`; the status endpoint returns `id`.
      // Normalise so polling can start immediately.
      setCollection({ ...result, id: result.collection_id || result.id })
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
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

  const completed = collection?.status === 'COMPLETED'
  const failed = ['FAILED', 'EXPIRED', 'CANCELLED'].includes(collection?.status)
  const payment = collection?.payment || {}
  const identifier = payment.identifier || {}
  const holder = payment.holder || {}
  const bank = payment.bank || {}
  const bankAddress = bank.address || {}
  const holderAddress = holder.address || {}

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

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Total Due</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {money(collection?.amount ?? resolvedAmount, collection?.currency ?? currency)}
              </span>
            </div>
            {collection?.rail && (
              <p className="text-[11px] text-slate-400 mt-1">{RAIL_LABEL[collection.rail] || collection.rail}</p>
            )}
          </div>

          <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Pay by bank transfer — no card needed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>This page confirms automatically when funds arrive</span>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="md:col-span-7 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0E1321] border border-slate-200 dark:border-slate-800 shadow-xl">
          {submitError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}

          {/* ── Step 1: payer details ── */}
          {!collection && (
            <form onSubmit={handleStartPayment} className="space-y-5">
              {!linkData?.is_fixed_amount && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Amount ({currency}) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                      {CURRENCY_SYMBOL[currency] || ''}
                    </span>
                    <input type="number" step="0.01"
                      min={linkData.min_amount_cents ? linkData.min_amount_cents / 100 : 1}
                      max={linkData.max_amount_cents ? linkData.max_amount_cents / 100 : undefined}
                      required value={amountInput} onChange={(e) => setAmountInput(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  {linkData.min_amount_cents && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Min: {money(linkData.min_amount_cents / 100, currency)}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
                  <input type="text" required value={buyerName} onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Email *</label>
                  <input type="email" required value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Phone (optional)</label>
                <input type="text" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-glow hover:shadow-glow-sm transition-all active:scale-[0.99] disabled:opacity-60">
                <Lock className="w-4 h-4" />
                {submitting ? 'Preparing payment…' : `Continue — ${money(resolvedAmount, currency)}`}
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* ── Step 2: payment instructions ── */}
          {collection && !completed && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {failed ? 'Payment could not be completed' : 'Send the payment'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {failed
                      ? 'This collection expired or was rejected. Start a new payment.'
                      : `Transfer exactly ${money(collection.amount, collection.currency)} using the details below.`}
                  </p>
                </div>
                {!failed && (
                  <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Awaiting funds
                  </span>
                )}
              </div>

              {failed ? (
                <button onClick={() => { setCollection(null); setSubmitError('') }}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Try again
                </button>
              ) : (
                <>
                  {/* PIX */}
                  {payment.brCode ? (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <CopyRow label="PIX code" value={payment.brCode} />
                      <p className="text-[11px] text-slate-400 mt-2">
                        Paste this code in your bank app to pay instantly.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      {Object.entries(identifier).map(([k, v]) => (
                        <CopyRow key={k} label={label(k)} value={v} />
                      ))}
                      <CopyRow label="Account holder" value={holder.name} mono={false} />
                      <CopyRow label="Bank" value={bank.name} mono={false} />
                      {bankAddress.line1 && (
                        <CopyRow
                          label="Bank address"
                          value={[bankAddress.line1, bankAddress.city, bankAddress.state, bankAddress.postalCode, bankAddress.country]
                            .filter(Boolean).join(', ')}
                          mono={false}
                        />
                      )}
                      {holderAddress.country && !bank.name && (
                        <CopyRow
                          label="Beneficiary address"
                          value={[holderAddress.line1, holderAddress.city, holderAddress.state, holderAddress.postalCode, holderAddress.country]
                            .filter(Boolean).join(', ')}
                          mono={false}
                        />
                      )}
                    </div>
                  )}

                  {payment.memo && (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            Payment reference — required
                          </p>
                          <p className="font-mono font-bold text-amber-900 dark:text-amber-200 break-all">{payment.memo}</p>
                        </div>
                        <button type="button"
                          onClick={() => navigator.clipboard.writeText(payment.memo)}
                          className="shrink-0 p-1.5 rounded-lg text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1.5">
                        Include this reference exactly, otherwise we cannot match your payment.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>This page updates automatically every few seconds.</span>
                    <button type="button" onClick={pollStatus} className="ml-auto inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400">
                      <RefreshCw className="w-3 h-3" /> Check now
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Collection ID</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{collection.id}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Status</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{collection.status}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Step 3: completed ── */}
          {completed && (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Payment received</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {money(collection.amount, collection.currency)} confirmed.
                  A receipt will be sent to {buyerEmail}.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Collection ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{collection.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {money(collection.amount, collection.currency)}
                  </span>
                </div>
                {collection.target_amount && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Credited:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {Number(collection.target_amount).toFixed(2)} {collection.target_currency}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">COMPLETED</span>
                </div>
              </div>
              {collection.success_url && (
                <a href={collection.success_url}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm">
                  Continue <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="max-w-4xl w-full mx-auto text-center pt-8 text-xs text-slate-400 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Secured by AgilePay · Settlement powered by Lumx</span>
      </footer>
    </div>
  )
}
