'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import {
  Send, Wallet, RefreshCw, ArrowUpRight, CheckCircle2, AlertCircle,
  Building2, Clock, Info, Settings2,
} from 'lucide-react'

const STATUS_STYLE = {
  COMPLETED:               'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
  PROCESSING:              'text-amber-600 dark:text-amber-400 bg-amber-500/10',
  PENDING:                 'text-slate-500 dark:text-slate-400 bg-slate-500/10',
  TRANSFERRING_STABLECOIN: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
  TRADING:                 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
  TRANSFERRING_FIAT:       'text-amber-600 dark:text-amber-400 bg-amber-500/10',
  FAILED:                  'text-rose-600 dark:text-rose-400 bg-rose-500/10',
  CANCELLED:               'text-rose-600 dark:text-rose-400 bg-rose-500/10',
}

function statusStyle(status) {
  return STATUS_STYLE[status] || STATUS_STYLE.PENDING
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function PayoutsPage() {
  const {
    destinations, payouts, payoutBalance, loadingPayouts,
    loadPayouts, loadPayoutBalance, createPayout, showToast,
  } = useApp()

  const approved = useMemo(
    () => (destinations || []).filter((d) => d.status === 'APPROVED'),
    [destinations]
  )
  const defaultDestination = useMemo(
    () => approved.find((d) => d.is_default) || approved[0],
    [approved]
  )

  const [destinationId, setDestinationId] = useState('')
  const [amount, setAmount]               = useState('')
  const [description, setDescription]     = useState('')
  const [reference, setReference]         = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [error, setError]                 = useState('')
  const [success, setSuccess]             = useState(null)

  useEffect(() => {
    if (!destinationId && defaultDestination) setDestinationId(defaultDestination.id)
  }, [defaultDestination, destinationId])

  const available = Number(payoutBalance?.amount || 0)
  const selected  = approved.find((d) => d.id === destinationId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(null)

    if (!destinationId) {
      setError('Choose a bank destination first')
      return
    }
    const value = Number(amount)
    if (!value || value <= 0) {
      setError('Enter an amount greater than zero')
      return
    }
    if (value < 50) {
      setError('The minimum payout is 50.00 USDC')
      return
    }
    if (available > 0 && value > available) {
      setError(`You only have ${available.toFixed(2)} USDC available`)
      return
    }

    setSubmitting(true)
    try {
      const created = await createPayout({
        amount: value,
        destination_id: destinationId,
        description,
        reference_id: reference,
      })
      setSuccess(created)
      setAmount('')
      setDescription('')
      setReference('')
    } catch (err) {
      setError(err.message || 'Payout failed')
    } finally {
      setSubmitting(false)
    }
  }

  const refresh = () => {
    loadPayouts()
    loadPayoutBalance()
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Send className="w-7 h-7 text-brand-500" />
            Payouts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Send your USDC balance to a bank account — no code required
          </p>
        </div>
        <button onClick={refresh}
          className="self-start p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Refresh">
          <RefreshCw className={`w-4 h-4 text-slate-500 ${loadingPayouts ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Balance + form */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white shadow-glow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">Available to pay out</span>
              <Wallet className="w-5 h-5 text-white/70" />
            </div>
            <p className="text-3xl font-black mt-2">
              {available.toFixed(2)} <span className="text-lg font-bold text-white/80">USDC</span>
            </p>
            <p className="text-[11px] text-white/70 mt-1">
              Collections credit this balance once Lumx confirms the payer&apos;s transfer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-[#0E1321] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-500" />
              <h2 className="font-bold text-slate-900 dark:text-white">Send a payout</h2>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Payout started
                </div>
                <p className="mt-1 text-xs font-mono break-all">{success.id}</p>
                <p className="text-xs mt-1">
                  {success.amount.toFixed(2)} USDC → {success.settlement_currency}. Status: {success.status}.
                </p>
              </div>
            )}

            {approved.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <Info className="w-4 h-4" /> No approved destination yet
                </div>
                <p className="text-xs">
                  Add a bank account under Settings → Payout Destinations. Lumx approves it before it can receive money.
                </p>
                <Link href="/dashboard/settings"
                  className="inline-flex items-center gap-1.5 text-xs font-bold underline">
                  <Settings2 className="w-3.5 h-3.5" /> Open payout destinations
                </Link>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Bank destination *
                  </label>
                  <select value={destinationId} onChange={(e) => setDestinationId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {approved.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label || d.holder_name} · {d.rail} · {d.currency}
                      </option>
                    ))}
                  </select>
                  {selected && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      {selected.holder_name} · {selected.country} · {selected.currency}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Amount (USDC) *
                    </label>
                    <input type="number" step="0.01" min="50" required
                      value={amount} onChange={(e) => setAmount(e.target.value)}
                      placeholder="50.00"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Minimum 50.00 USDC</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Reference
                    </label>
                    <input type="text" value={reference} onChange={(e) => setReference(e.target.value)}
                      placeholder="payroll-10"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Description
                  </label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="October payout"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all active:scale-[0.99] disabled:opacity-60">
                  <Send className="w-4 h-4" />
                  {submitting ? 'Starting payout…' : 'Send payout'}
                </button>
              </>
            )}
          </form>
        </div>

        {/* Recent payouts */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0E1321] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Recent payouts</h2>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          {payouts.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No payouts yet.</p>
          ) : (
            <div className="space-y-3">
              {payouts.map((p) => (
                <div key={p.id} className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5 text-brand-500" />
                      {Number(p.amount).toFixed(2)} USDC
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle(p.status)}`}>
                      {p.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                    <span className="font-mono truncate max-w-[55%]">{p.id}</span>
                    <span>→ {p.settlement_currency}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{formatDate(p.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
