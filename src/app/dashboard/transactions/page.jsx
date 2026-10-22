'use client'

import React, { useState } from 'react'
import { useApp } from '@/context/AppContext'
import {
  ArrowLeftRight, Search, Filter, Download, CheckCircle2, Clock,
  TrendingUp, DollarSign, Smartphone, CreditCard, Coins, ChevronDown,
  ArrowUpRight, Receipt, RefreshCw,
} from 'lucide-react'

const STATUS_MAP = {
  'Paid - Settled':   { label: 'Settled',    cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  'Processing':       { label: 'Processing', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  'Pending':          { label: 'Pending',    cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  'Awaiting Funds':   { label: 'Awaiting',  cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  'Failed':           { label: 'Failed',     cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  'Cancelled':        { label: 'Cancelled', cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
  'Refunded':         { label: 'Refunded',  cls: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' },
}

function statusStyle(status) {
  return STATUS_MAP[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600 border-slate-200' }
}

export default function TransactionsPage() {
  const { transactions, loadingTransactions, loadTransactions } = useApp()
  const [searchQuery, setSearchQuery]   = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId]     = useState(null)

  const filtered = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase()
    const matchSearch =
      (tx.customer || '').toLowerCase().includes(q) ||
      (tx.reference || '').toLowerCase().includes(q) ||
      (tx.email || '').toLowerCase().includes(q)
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'settled'  && tx.status.includes('Settled')) ||
      (statusFilter === 'pending'  && (tx.status.includes('Pending') || tx.status.includes('Processing'))) ||
      (statusFilter === 'failed'   && tx.status.includes('Failed'))
    return matchSearch && matchStatus
  })

  const totalCollected = transactions
    .filter(t => t.status.includes('Settled'))
    .reduce((s, t) => s + t.amount, 0)
  const settledCount = transactions.filter(t => t.status.includes('Settled')).length
  const pendingCount = transactions.filter(t =>
    t.status.includes('Pending') || t.status.includes('Processing')).length

  const handleExport = () => {
    const header = 'Charge ID,Customer,Email,Date,Amount,Currency,Status\n'
    const rows = filtered.map(tx =>
      `${tx.reference},${tx.customer},${tx.email},${tx.date},${tx.amount},${tx.currency},${tx.status}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'agilepay-transactions.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ArrowLeftRight className="w-7 h-7 text-brand-500" />
            Transactions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live settlement log — USDC off-ramp status and Lumx rail details
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button onClick={() => loadTransactions()}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loadingTransactions ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleExport}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4 text-brand-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Total Collected', value: `$${totalCollected.toFixed(2)}`, sub: `${settledCount} settled`, icon: DollarSign, color: 'emerald' },
          { label: 'Successful', value: settledCount, sub: 'Off-ramped', icon: CheckCircle2, color: 'brand' },
          { label: 'Pending', value: pendingCount, sub: 'Awaiting settlement', icon: Clock, color: 'amber' },
          { label: 'Total', value: transactions.length, sub: 'All time', icon: TrendingUp, color: 'cyan' },
        ].map((m) => {
          const Icon = m.icon
          return (
            <div key={m.label} className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{m.label}</span>
                <div className={`w-8 h-8 rounded-lg bg-${m.color}-500/10 text-${m.color}-600 dark:text-${m.color}-400 flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{m.value}</div>
              <div className="mt-1 text-xs text-slate-400">{m.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transaction History</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {filtered.length} of {transactions.length} transactions
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer">
                <option value="all">All Statuses</option>
                <option value="settled">Settled</option>
                <option value="pending">Pending / Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search by name, charge ID…"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {loadingTransactions ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">No transactions yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Transactions will appear here once payments are processed
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Customer</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Rail</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Charge ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((tx) => {
                  const isExpanded = expandedId === tx.id
                  const st = statusStyle(tx.status)
                  return (
                    <React.Fragment key={tx.id}>
                      <tr onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer">
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-xs shrink-0">
                              {(tx.customer || '?').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{tx.customer || 'Unknown'}</p>
                              <p className="text-[11px] text-slate-400">{tx.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{tx.date}</span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className="font-bold text-slate-900 dark:text-white">${tx.amount.toFixed(2)}</span>
                          <p className="text-[11px] text-slate-400">{tx.currency}</p>
                        </td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {tx.channel}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${st.cls}`}>
                            <CheckCircle2 className="w-3 h-3" />
                            {st.label}
                          </span>
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <div className="flex items-center justify-end gap-1">
                            <span className="font-mono text-[11px] text-slate-400 truncate max-w-[110px]">{tx.reference}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                          <td colSpan={6} className="px-4 sm:px-6 py-5">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Charge ID</p>
                                <p className="font-mono font-bold text-slate-900 dark:text-white">{tx.reference}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Lumx TX</p>
                                <p className="font-mono text-slate-600 dark:text-slate-300 truncate">{tx.lumx_transaction_id || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Settlement Rail</p>
                                <p className="font-semibold text-emerald-600 dark:text-emerald-400">{tx.rail}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</p>
                                <p className="text-slate-600 dark:text-slate-300">{tx.description || '—'}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
