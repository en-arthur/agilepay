'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import PaymentDrawer from '@/components/PaymentDrawer';
import QRCodePreview from '@/components/QRCodePreview';
import {
  Link2,
  Plus,
  Copy,
  Check,
  Search,
  ExternalLink,
  Eye,
  Trash2,
  TrendingUp,
  DollarSign,
  QrCode,
  Filter,
  ArrowUpRight,
  MoreVertical,
} from 'lucide-react';

export default function PaymentLinksPage() {
  const { links, showToast, isSandbox } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedLink, setCopiedLink] = useState(null);
  const [qrPreviewLink, setQrPreviewLink] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.shortUrl.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || link.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalViews = links.reduce((sum, l) => sum + l.views, 0);
  const totalPayments = links.reduce((sum, l) => sum + l.paymentsCount, 0);
  const totalVolume = links.reduce((sum, l) => sum + l.amount * l.paymentsCount, 0);

  const handleCopyLink = (shortUrl) => {
    navigator.clipboard.writeText(`https://${shortUrl}`);
    setCopiedLink(shortUrl);
    showToast(`Copied ${shortUrl} to clipboard`);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleDeleteLink = (shortUrl) => {
    showToast(`Payment link ${shortUrl} archived`, 'info');
    setMenuOpenId(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Payment Link Drawer */}
      <PaymentDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Link2 className="w-7 h-7 text-brand-500" />
            <span>Payment Links</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, share, and track no-code checkout links across WhatsApp, Instagram, and SMS
          </p>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-glow-sm hover:shadow-glow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Create Payment Link</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Links
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {links.length}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-500 font-bold">All active</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Views
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalViews}
          </div>
          <div className="mt-1 text-xs text-slate-400">Link impressions</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Conversions
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalPayments}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {((totalPayments / (totalViews || 1)) * 100).toFixed(1)}% conversion rate
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Collected Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ${totalVolume.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-400">From link conversions</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              All Payment Links
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Shareable checkout pages auto-settling to your MoMo or bank account
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Status Filter */}
            <div className="relative flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Links Table / Cards */}
        {filteredLinks.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-7 h-7 text-slate-400" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              No payment links found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create your first no-code checkout link to start collecting payments
            </p>
            <button
              onClick={() => setDrawerOpen(true)}
              className="mt-5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-glow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Payment Link</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Link / Product</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Payout Destination</th>
                  <th className="pb-3">Performance</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredLinks.map((link) => (
                  <tr
                    key={link.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                          <Link2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate max-w-[220px]">
                            {link.title}
                          </p>
                          <p className="font-mono text-[11px] text-brand-500 mt-0.5">
                            {link.shortUrl}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        ${link.amount.toFixed(2)} {link.currency}
                      </span>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        ≈ GH₵ {link.localAmount.toFixed(2)}
                      </p>
                    </td>

                    <td className="py-4">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block max-w-[160px]">
                        {link.destination}
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {link.views} views
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {link.paymentsCount} paid
                        </span>
                      </div>
                    </td>

                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {link.status}
                      </span>
                    </td>

                    <td className="py-4 pr-2">
                      <div className="flex items-center justify-end gap-1.5 relative">
                        <button
                          onClick={() => handleCopyLink(link.shortUrl)}
                          className="p-2 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                          title="Copy link"
                        >
                          {copiedLink === link.shortUrl ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => setQrPreviewLink(link)}
                          className="p-2 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                          title="QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <Link
                          href={`/pay/${link.id}`}
                          target="_blank"
                          className="p-2 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                          title="Preview checkout"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() =>
                            setMenuOpenId(menuOpenId === link.id ? null : link.id)
                          }
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {menuOpenId === link.id && (
                          <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111624] shadow-xl py-1.5 text-xs">
                            <button
                              onClick={() => {
                                handleCopyLink(link.shortUrl);
                                setMenuOpenId(null);
                              }}
                              className="w-full px-3 py-2 text-left text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy URL</span>
                            </button>
                            <button
                              onClick={() => {
                                setQrPreviewLink(link);
                                setMenuOpenId(null);
                              }}
                              className="w-full px-3 py-2 text-left text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>View QR Code</span>
                            </button>
                            <button
                              onClick={() => handleDeleteLink(link.shortUrl)}
                              className="w-full px-3 py-2 text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Archive Link</span>
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

      {/* QR Code Preview Modal */}
      {qrPreviewLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setQrPreviewLink(null)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#0D1220] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-center space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                QR Code Preview
              </h3>
              <button
                onClick={() => setQrPreviewLink(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <QRCodePreview value={`https://${qrPreviewLink.shortUrl}`} size={160} />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-3">
                Scan to pay ${qrPreviewLink.amount} {qrPreviewLink.currency}
              </p>
              <p className="font-mono text-[11px] text-brand-500 mt-1">
                {qrPreviewLink.shortUrl}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyLink(qrPreviewLink.shortUrl)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedLink === qrPreviewLink.shortUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
              <Link
                href={`/pay/${qrPreviewLink.id}`}
                target="_blank"
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
