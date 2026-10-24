'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { apiDelete } from '@/lib/api'
import PaymentDrawer from '@/components/PaymentDrawer'
import QRCodePreview from '@/components/QRCodePreview'
import {
  Link2, Plus, Copy, Check, Search, ExternalLink, Eye, Trash2,
  TrendingUp, DollarSign, QrCode, Filter, ArrowUpRight, MoreVertical,
  RefreshCw,
} from 'lucide-react'

export default function PaymentLinksPage() {
  const { links, loadLinks, loadingLinks, showToast } = useApp()
  const { getToken } = useAuth()

  const [drawerOpen, setDrawerOpen]     = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [copiedLink, setCopiedLink]     = useState(null)
  const [qrPreviewLink, setQrPreviewLink] = useState(null)
  const [menuOpenId, setMenuOpenId]     = useState(null)
  const [deletingId, setDeletingId]     = useState(null)

  const filtered = links.filter((lnk) => {
    const matchSearch =
      lnk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lnk.shortUrl.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active'   && lnk.status === 'Active') ||
      (statusFilter === 'inactive' && lnk.status !== 'Active')
    return matchSearch && matchStatus
  })

  const totalPayments = links.reduce((s, l) => s + (l.paymentsCount || 0), 0)
  const totalVolume   = links.reduce((s, l) => s + l.amount * (l.paymentsCount || 0), 0)

  const handleCopyLink = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl)
    setCopiedLink(shortUrl)
    showToast(`Copied ${shortUrl} to clipboard`)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const handleDeleteLink = async (linkItem) => {
    setDeletingId(linkItem.link_id || linkItem.id)
    setMenuOpenId(null)
    try {
      const token = getToken()
      await apiDelete(`/v1/links/${linkItem.link_id || linkItem.id}`, token)
      await loadLinks()
      showToast('Payment link deleted', 'info')
    } catch (e) {
      showToast(e.message || 'Failed to delete link', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      <PaymentDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Link2 className="w-7 h-7 text-brand-500" />
            Payment Links
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            No-code checkout links that settle instantly to your bank destination
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => loadLinks()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh">
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loadingLinks ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setDrawerOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-glow-sm hover:shadow-glow transition-all active:scale-95">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            + Create Payment Link
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Total Links',    value: links.length,              icon: Link2,     color: 'cyan' },
          { label: 'Conversions',    value: totalPayments,             icon: TrendingUp,color: 'emerald' },
          { label: 'Volume Collected', value: `$${totalVolume.toFixed(0)}`, icon: DollarSign, color: 'violet' },
          { label: 'Active Links',   value: links.filter(l => l.status === 'Active').length, icon: ArrowUpRight, color: 'brand' },
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
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Payment Links</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Shareable checkout pages auto-settling to your registered destination
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer">
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search links…"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {loadingLinks ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Link2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">No payment links yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Create your first link to start collecting payments</p>
            <button onClick={() => setDrawerOpen(true)}
              className="mt-5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-glow-sm transition-all">
              <Plus className="w-4 h-4" />
              Create Payment Link
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Link / Product</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Payments</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filtered.map((lnk) => (
                  <tr key={lnk.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                          <Link2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{lnk.title}</p>
                          <p className="font-mono text-[11px] text-brand-500 mt-0.5">{lnk.shortUrl}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="font-bold text-slate-900 dark:text-white">${lnk.amount.toFixed(2)} {lnk.currency}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {lnk.paymentsCount} paid
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        lnk.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${lnk.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {lnk.status}
                      </span>
                    </td>
                    <td className="py-4 pr-2">
                      <div className="flex items-center justify-end gap-1.5 relative">
                        <button onClick={() => handleCopyLink(lnk.shortUrl)}
                          className="p-2 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-500/10 transition-colors">
                          {copiedLink === lnk.shortUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setQrPreviewLink(lnk)}
                          className="p-2 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-500/10 transition-colors">
                          <QrCode className="w-4 h-4" />
                        </button>
                        <Link href={`/pay/${lnk.id}`} target="_blank"
                          className="p-2 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-500/10 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setMenuOpenId(menuOpenId === lnk.id ? null : lnk.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {menuOpenId === lnk.id && (
                          <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111624] shadow-xl py-1.5 text-xs">
                            <button onClick={() => { handleCopyLink(lnk.shortUrl); setMenuOpenId(null) }}
                              className="w-full px-3 py-2 text-left text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2">
                              <Copy className="w-3.5 h-3.5" /> Copy URL
                            </button>
                            <button onClick={() => { setQrPreviewLink(lnk); setMenuOpenId(null) }}
                              className="w-full px-3 py-2 text-left text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2">
                              <QrCode className="w-3.5 h-3.5" /> View QR Code
                            </button>
                            <button onClick={() => handleDeleteLink(lnk)}
                              disabled={deletingId === (lnk.link_id || lnk.id)}
                              className="w-full px-3 py-2 text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 disabled:opacity-50">
                              <Trash2 className="w-3.5 h-3.5" />
                              {deletingId === (lnk.link_id || lnk.id) ? 'Deleting…' : 'Delete Link'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrPreviewLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setQrPreviewLink(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#0D1220] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-center space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">QR Code</h3>
              <button onClick={() => setQrPreviewLink(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>
            <div className="flex flex-col items-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <QRCodePreview value={qrPreviewLink.shortUrl} size={160} />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-3">
                Scan to pay ${qrPreviewLink.amount} {qrPreviewLink.currency}
              </p>
              <p className="font-mono text-[11px] text-brand-500 mt-1">{qrPreviewLink.shortUrl}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleCopyLink(qrPreviewLink.shortUrl)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all">
                {copiedLink === qrPreviewLink.shortUrl ? <><Check className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy Link</>}
              </button>
              <Link href={`/pay/${qrPreviewLink.id}`} target="_blank"
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" /> Open
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
