'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import PaymentDrawer from '@/components/PaymentDrawer'
import KycBanner from '@/components/KycBanner'
import {
  TrendingUp, ArrowUpRight, Link2, DollarSign, Smartphone, Plus,
  CheckCircle2, Clock, ExternalLink, Copy, Check, Search,
  Sparkles, Zap, Code2, Share2, QrCode, ArrowLeftRight,
  Wallet, RefreshCw,
} from 'lucide-react'

export default function MerchantDashboard() {
  const { links, transactions, loadingTransactions, loadingLinks, isSandbox, showToast, accountType, loadTransactions, loadLinks } = useApp()
  const { merchant } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedLink, setCopiedLink] = useState(null)

  // ── Real computed metrics ─────────────────────────────────────────────────
  const settledTxs     = transactions.filter(t => t.status.includes('Settled'))
  const totalVolumeUSD = settledTxs.reduce((s, t) => s + (t.amount || 0), 0)
  const settledCount   = settledTxs.length
  const activeLinks    = links.filter(l => l.status === 'Active').length
  const totalPayments  = links.reduce((s, l) => s + (l.paymentsCount || 0), 0)

  const filteredTransactions = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase()
    return (
      (tx.customer || '').toLowerCase().includes(q) ||
      (tx.reference || '').toLowerCase().includes(q) ||
      (tx.channel || '').toLowerCase().includes(q)
    )
  })

  const handleCopyLink = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl)
    setCopiedLink(shortUrl)
    showToast(`Copied ${shortUrl} to clipboard`)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const displayName = merchant?.business_name || merchant?.full_name || 'Merchant'

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PaymentDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <KycBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {accountType === 'individual'
              ? `Welcome, ${displayName}`
              : accountType === 'developer'
              ? 'Merchant Overview'
              : 'My Store Dashboard'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {accountType === 'developer'
              ? 'Real-time collection volume, instant off-ramps, and API activity'
              : accountType === 'individual'
              ? 'Fund your wallet, send to recipients, and track remittances'
              : 'Track your sales, create payment links, and get paid instantly'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => { loadTransactions(); loadLinks() }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh">
            <RefreshCw className={`w-4 h-4 text-slate-500 ${(loadingTransactions || loadingLinks) ? 'animate-spin' : ''}`} />
          </button>

          {accountType === 'developer' ? (
            <Link href="/dashboard/developers"
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-glow-sm hover:shadow-glow transition-all active:scale-95">
              <Code2 className="w-4 h-4 stroke-[2.5]" />
              Developer Portal
            </Link>
          ) : accountType === 'individual' ? (
            <Link href="/dashboard/remittance"
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-glow-sm hover:shadow-glow transition-all active:scale-95">
              <Wallet className="w-4 h-4" />
              Send Money
            </Link>
          ) : (
            <button onClick={() => setDrawerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-glow-sm hover:shadow-glow transition-all active:scale-95">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              + Create Payment Link
            </button>
          )}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Volume */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Volume</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          {loadingTransactions ? (
            <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          ) : (
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              ${totalVolumeUSD.toFixed(2)}
            </div>
          )}
          <div className="mt-1 text-xs text-slate-400">
            {settledCount} settled transaction{settledCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Successful txs / payments */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {accountType === 'individual' ? 'Remittances Sent' : 'Successful Off-Ramps'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          {loadingTransactions ? (
            <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          ) : (
            <div className="text-2xl font-black text-slate-900 dark:text-white">{settledCount}</div>
          )}
          <div className="mt-1 text-xs text-emerald-500 font-bold">100% Settled</div>
        </div>

        {/* Links / API calls */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {accountType === 'developer' ? 'Total Transactions' : 'Active Payment Links'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              {accountType === 'developer' ? <ArrowLeftRight className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            </div>
          </div>
          {loadingLinks || loadingTransactions ? (
            <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          ) : (
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {accountType === 'developer' ? transactions.length : activeLinks}
            </div>
          )}
          <div className="mt-1 text-xs text-slate-400">
            {accountType === 'developer' ? 'all time' : `${totalPayments} total payments`}
          </div>
        </div>

        {/* Pending */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          {loadingTransactions ? (
            <div className="h-8 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          ) : (
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {transactions.filter(t => t.status === 'Pending' || t.status === 'Processing').length}
            </div>
          )}
          <div className="mt-1 text-xs text-slate-400">Awaiting settlement</div>
        </div>
      </div>

      {/* Quick action panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {accountType === 'developer' ? (
          <div className="lg:col-span-7 p-6 rounded-2xl bg-gradient-to-r from-brand-950/40 via-slate-900 to-indigo-950/30 border border-brand-500/30 shadow-lg flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-lg">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Developer Quick Start</h3>
                  <p className="text-xs text-brand-300 mt-0.5">Integrate with the Python SDK</p>
                </div>
              </div>
              <Link href="/dashboard/developers"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-brand-500/40 text-brand-300 hover:bg-brand-500/10 transition-colors">
                Open Portal
              </Link>
            </div>
            <div className="mt-4 p-3.5 rounded-xl bg-slate-950/60 border border-brand-500/20 text-xs font-mono space-y-1">
              <p className="text-slate-400 text-[11px] uppercase tracking-wider font-sans font-bold">Python SDK:</p>
              <p className="text-brand-400">import agilepay</p>
              <p className="text-slate-300">client = agilepay.AgilePay(api_key=os.environ[&quot;AGILEPAY_KEY&quot;])</p>
              <p className="text-slate-300">charge = client.charges.create(amount=50, destination_id=&quot;...&quot;)</p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>API Keys · Webhooks · Destinations</span>
              <Link href="/dashboard/developers" className="text-brand-400 hover:underline flex items-center gap-1">
                <span>View Docs</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ) : accountType === 'individual' ? (
          <div className="lg:col-span-7 p-6 rounded-2xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-indigo-950/30 border border-violet-500/30 shadow-lg flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-lg">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Remittance Dashboard</h3>
                  <p className="text-xs text-violet-300 mt-0.5">Fund wallet · Add recipients · Send money</p>
                </div>
              </div>
              <Link href="/dashboard/remittance"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-violet-500/40 text-violet-300 hover:bg-violet-500/10 transition-colors">
                Open
              </Link>
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-300">
              {['Fund your wallet via bank transfer (ACH / SWIFT)', 'Add recipients — family or friends worldwide', 'Lock exchange rate and send in seconds'].map(step => (
                <div key={step} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-violet-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-emerald-900/20 border border-emerald-500/30 shadow-lg flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Promote Your Store</h3>
                  <p className="text-xs text-emerald-300 mt-0.5">Share your payment links anywhere</p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2.5 text-xs text-slate-300">
              {[
                { icon: Smartphone, text: 'Share links via SMS or social media — buyers pay with one tap' },
                { icon: QrCode,     text: 'Print QR codes for in-store or flyer checkout' },
                { icon: Link2,      text: 'Embed links in emails, invoices, or your website' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-emerald-500/20">
                  <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>{activeLinks} active link{activeLinks !== 1 ? 's' : ''}</span>
              <Link href="/dashboard/links" className="text-emerald-400 hover:underline flex items-center gap-1">
                Manage Links <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Secondary card */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              {accountType === 'developer' ? 'API Credentials' : accountType === 'individual' ? 'Wallet Status' : 'Instant Checkout'}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {accountType === 'developer' ? 'Developer Integration Rails' : accountType === 'individual' ? 'Your Remittance Account' : 'Sell anywhere in seconds'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {accountType === 'developer'
                ? 'Generate API keys, configure webhooks, and register bank destinations.'
                : accountType === 'individual'
                ? 'Fund your wallet via bank transfer, then send to approved recipients at live exchange rates.'
                : 'Create a hosted checkout page with zero code. Send to buyers on Instagram, SMS, or email.'}
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
            {accountType === 'developer' ? (
              <Link href="/dashboard/developers"
                className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all">
                <Code2 className="w-4 h-4" /> Manage API Keys
              </Link>
            ) : accountType === 'individual' ? (
              <Link href="/dashboard/remittance"
                className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all">
                <Wallet className="w-4 h-4" /> Open Remittance
              </Link>
            ) : (
              <>
                <button onClick={() => setDrawerOpen(true)}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all">
                  <Plus className="w-4 h-4" /> Create Payment Link
                </button>
                <Link href="/dashboard/links"
                  className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  View All
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live settlement log</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search customer, ref…"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {loadingTransactions ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <ArrowLeftRight className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No transactions yet</p>
            <p className="text-xs text-slate-400 mt-1">Transactions appear here once payments are processed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-1">Customer</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-1">Charge ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredTransactions.slice(0, 8).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-xs">
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
                        <Clock className="w-3.5 h-3.5" />
                        <span>{tx.date}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-slate-900 dark:text-white">${tx.amount.toFixed(2)}</span>
                      <p className="text-[11px] text-slate-400">{tx.currency}</p>
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        tx.status.includes('Settled')
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : tx.status === 'Processing' || tx.status === 'Pending'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-1">
                      <span className="font-mono text-[11px] text-slate-400 truncate max-w-[120px] block text-right">{tx.reference}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length > 8 && (
              <div className="pt-4 text-center">
                <Link href="/dashboard/transactions" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                  View all {transactions.length} transactions →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
