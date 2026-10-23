'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { apiGet } from '@/lib/api'
import QRCodePreview from './QRCodePreview'
import {
  X, Link2, Copy, Check, Share2, ExternalLink, MessageSquare,
  Sparkles, ShieldCheck, AlertCircle, RefreshCw,
} from 'lucide-react'

export default function PaymentDrawer({ isOpen, onClose }) {
  const { createPaymentLink, showToast } = useApp()
  const { getToken } = useAuth()

  // Form state
  const [amount,      setAmount]      = useState('')
  const [currency,    setCurrency]    = useState('USD')
  const [title,       setTitle]       = useState('')
  const [note,        setNote]        = useState('')
  const [isFixed,     setIsFixed]     = useState(true)
  const [destinationId, setDestinationId] = useState('')

  // Destinations from backend
  const [destinations, setDestinations]   = useState([])
  const [loadingDests, setLoadingDests]   = useState(false)

  // Submission state
  const [createdLink, setCreatedLink] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Share/copy state
  const [copiedLink,    setCopiedLink]    = useState(false)
  const [copiedWA,      setCopiedWA]      = useState(false)

  // Load approved destinations when drawer opens
  useEffect(() => {
    if (!isOpen) return
    const token = getToken()
    if (!token) return
    setLoadingDests(true)
    apiGet('/v1/destinations', token)
      .then(data => {
        const approved = (data || []).filter(d => d.status === 'APPROVED')
        setDestinations(approved)
        if (approved.length > 0 && !destinationId) {
          const def = approved.find(d => d.is_default) || approved[0]
          setDestinationId(def.id)
        }
      })
      .catch(() => {/* silent — user can still create without a pre-selected dest */})
      .finally(() => setLoadingDests(false))
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isFixed && (!amount || Number(amount) <= 0)) {
      setSubmitError('Please enter a valid amount')
      return
    }
    setSubmitError('')
    setIsSubmitting(true)
    try {
      const link = await createPaymentLink({
        title,
        note,
        amount:         isFixed ? Number(amount) : null,
        currency,
        destination_id: destinationId || undefined,
      })
      setCreatedLink(link)
    } catch (err) {
      setSubmitError(err.message || 'Failed to create link')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCreatedLink(null)
    setAmount('')
    setTitle('')
    setNote('')
    setSubmitError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const shareUrl = createdLink
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/pay/${createdLink.link_id || createdLink.id}`
    : ''

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopiedLink(true)
    showToast('Payment link copied!')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCopyWhatsApp = () => {
    const msg = `Hi! 👋 Here's your secure payment link for *${createdLink.title}*${createdLink.amount ? ` (${createdLink.currency} ${createdLink.amount.toFixed(2)})` : ''}:\n👉 ${shareUrl}\n\nPay securely — instant digital receipt included! ✅`
    navigator.clipboard.writeText(msg)
    setCopiedWA(true)
    showToast('WhatsApp message copied!')
    setTimeout(() => setCopiedWA(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-[#0E131F] h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {createdLink ? 'Payment Link Ready' : 'Create Payment Link'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {createdLink ? 'Share this link anywhere' : 'Collect payments with zero code'}
              </p>
            </div>
          </div>
          <button onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1">
          {!createdLink ? (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Error */}
              {submitError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError}
                </div>
              )}

              {/* Fixed / Variable toggle */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Amount Type
                </label>
                <div className="flex gap-2">
                  {[{v:true, l:'Fixed Amount'}, {v:false, l:'Buyer Sets Amount'}].map(opt => (
                    <button key={String(opt.v)} type="button" onClick={() => setIsFixed(opt.v)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        isFixed === opt.v
                          ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                      }`}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              {isFixed && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Amount & Currency *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                        {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'GH₵'}
                      </span>
                      <input type="number" step="0.01" min="0.01" required={isFixed}
                        value={amount} onChange={e => setAmount(e.target.value)}
                        placeholder="50.00"
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <select value={currency} onChange={e => setCurrency(e.target.value)}
                      className="py-3 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                      <option value="USD">USD</option>
                      <option value="GHS">GHS</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Product / Service Name *
                </label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Leather Oxford Shoes (Size 42)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Customer Note (optional)
                </label>
                <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Includes delivery within Accra"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Destination */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Payout Destination
                </label>
                {loadingDests ? (
                  <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ) : destinations.length === 0 ? (
                  <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    No approved destinations yet. Add one in Settings → Destinations.
                  </div>
                ) : (
                  <select value={destinationId} onChange={e => setDestinationId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="">— Use merchant default —</option>
                    {destinations.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.label} ({d.rail} · {d.currency}){d.is_default ? ' ★' : ''}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Funds auto off-ramped to this destination on payment
                </p>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all disabled:opacity-60">
                  <Sparkles className="w-4 h-4" />
                  {isSubmitting ? 'Creating…' : 'Generate Payment Link'}
                </button>
              </div>
            </form>
          ) : (
            /* Success state */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Payment Link Active!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Your customers can now pay via this link.
                  </p>
                </div>
              </div>

              {/* URL box */}
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 mb-1.5 block">Checkout URL</label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-mono text-sm text-brand-600 dark:text-brand-400 font-semibold truncate flex-1 pl-1">
                    {shareUrl}
                  </span>
                  <button onClick={handleCopyLink}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition-colors shrink-0">
                    {copiedLink ? <><Check className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
                <QRCodePreview value={shareUrl} size={140} />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-3">
                  {createdLink.title}{createdLink.amount ? ` · $${createdLink.amount.toFixed(2)} ${createdLink.currency}` : ''}
                </p>
                <p className="text-[11px] text-slate-400">Print for in-store or Instagram story checkout</p>
              </div>

              {/* WhatsApp copy */}
              <button onClick={handleCopyWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95">
                <MessageSquare className="w-4 h-4 fill-white" />
                {copiedWA ? '✓ WhatsApp Message Copied!' : '1-Click Copy WhatsApp Message'}
              </button>

              <div className="flex items-center gap-3">
                <Link href={`/pay/${createdLink.link_id || createdLink.id}`} target="_blank"
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-brand-500 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5 text-brand-500" />
                  Preview Checkout
                </Link>
                <button onClick={resetForm}
                  className="py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-medium">
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
