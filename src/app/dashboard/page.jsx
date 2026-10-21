'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import PaymentDrawer from '@/components/PaymentDrawer';
import {
  TrendingUp,
  ArrowUpRight,
  Link2,
  DollarSign,
  Smartphone,
  Plus,
  MessageSquare,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function MerchantDashboard() {
  const { links, transactions, isSandbox, showToast } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(null);
  const [botActive, setBotActive] = useState(true);

  // Filter transactions based on search
  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.channel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyLink = (shortUrl) => {
    navigator.clipboard.writeText(`https://${shortUrl}`);
    setCopiedLink(shortUrl);
    showToast(`Copied ${shortUrl} to clipboard`);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Create Payment Link Drawer */}
      <PaymentDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Merchant Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time collection volume, instant MoMo off-ramps, and active payment links
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-glow-sm hover:shadow-glow transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Create Payment Link</span>
          </button>
        </div>
      </div>

      {/* 4 Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-brand-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Volume Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            $24,850.00
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-400">≈ GH₵ 385,175.00</span>
            <span className="text-emerald-500 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +18.4%
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-brand-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Successful Off-Ramps
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            184 MoMo / Bank
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-400">Avg speed: 1.2s</span>
            <span className="text-emerald-500 font-bold">100% Settled</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-brand-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Payment Links
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {links.length} Active
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-400">541 total views</span>
            <span className="text-cyan-500 font-bold">87 Paid</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-brand-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Platform Fees Earned
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            $248.50 USD
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-400">1.0% Partner Split</span>
            <span className="text-violet-500 font-bold">Auto-accrued</span>
          </div>
        </div>
      </div>

      {/* Quick Actions & WhatsApp Bot Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* WhatsApp Bot Status Card (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-emerald-900/20 border border-emerald-500/30 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                <MessageSquare className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    💬 WhatsApp Bot Active
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                    ONLINE
                  </span>
                </div>
                <p className="text-xs font-mono text-emerald-300 mt-0.5">
                  +233 24 559 8192 (AgilePay Business AI)
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setBotActive(!botActive);
                showToast(
                  botActive
                    ? 'WhatsApp Bot paused'
                    : 'WhatsApp Bot active and listening for payment commands'
                );
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 transition-colors"
            >
              {botActive ? 'Pause Bot' : 'Resume Bot'}
            </button>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-slate-950/60 border border-emerald-500/20 text-xs text-slate-300 font-mono space-y-1.5">
            <p className="text-slate-400 text-[11px] uppercase tracking-wider font-sans font-bold">
              Recent text command processed:
            </p>
            <p className="text-emerald-400">
              Merchant: &quot;charge $50 for Brown Loafers to Kofi&quot;
            </p>
            <p className="text-slate-300">
              Bot: &quot;Link created 👉 agilepay.me/x/8492. Sent MoMo push prompt to customer.&quot;
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Linked to MTN MoMo (+233 24 819 2041)</span>
            <Link
              href="/dashboard/settings"
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Bot Settings</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Quick Payment Link Creator Trigger (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4" />
              <span>Instant Checkout Links</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Sell anywhere in seconds
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Create a hosted checkout page with zero code. Send the link to buyers on Instagram,
              WhatsApp, SMS, or Telegram.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Payment Link</span>
            </button>

            <Link
              href="/dashboard/links"
              className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              View All
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live settlement log off-ramping into your local MoMo & bank account
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-1">Customer Name</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Amount (USD & GHS)</th>
                <th className="pb-3">Channel / Rail</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-1">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 pl-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-xs">
                        {tx.customer.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {tx.customer}
                        </p>
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
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        ${tx.amount.toFixed(2)} USD
                      </span>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        ≈ GH₵ {tx.localAmount.toFixed(2)}
                      </p>
                    </div>
                  </td>

                  <td className="py-3.5">
                    <div>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {tx.channel}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{tx.rail}</p>
                    </div>
                  </td>

                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        tx.status.includes('Paid')
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{tx.status}</span>
                    </span>
                  </td>

                  <td className="py-3.5 text-right pr-1">
                    <span className="font-mono text-[11px] text-slate-400">
                      {tx.reference}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
