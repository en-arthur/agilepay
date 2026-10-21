'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  ArrowLeftRight,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  Smartphone,
  CreditCard,
  Coins,
  ChevronDown,
  ArrowUpRight,
  Receipt,
  ExternalLink,
} from 'lucide-react';

const CHANNEL_ICONS = {
  'MoMo (MTN)': Smartphone,
  'MoMo (Telecel)': Smartphone,
  'Card (Visa)': CreditCard,
  'Card (Mastercard)': CreditCard,
  'USDC Rail': Coins,
};

const CHANNEL_COLORS = {
  'MoMo (MTN)': 'text-amber-500',
  'MoMo (Telecel)': 'text-rose-500',
  'Card (Visa)': 'text-indigo-500',
  'Card (Mastercard)': 'text-indigo-500',
  'USDC Rail': 'text-cyan-500',
};

export default function TransactionsPage() {
  const { transactions, isSandbox } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedTxId, setExpandedTxId] = useState(null);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel =
      channelFilter === 'all' || tx.channel.toLowerCase().includes(channelFilter.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'paid' && tx.status.includes('Paid')) ||
      (statusFilter === 'pending' && tx.status.includes('Pending'));
    return matchesSearch && matchesChannel && matchesStatus;
  });

  // Aggregate metrics
  const totalCollected = transactions
    .filter((t) => t.status.includes('Paid'))
    .reduce((sum, t) => sum + t.amount, 0);
  const totalLocalCollected = transactions
    .filter((t) => t.status.includes('Paid'))
    .reduce((sum, t) => sum + t.localAmount, 0);
  const paidCount = transactions.filter((t) => t.status.includes('Paid')).length;
  const pendingCount = transactions.filter((t) => t.status.includes('Pending')).length;

  const handleExport = () => {
    const csvHeader = 'Transaction ID,Customer,Email,Date,Amount (USD),Local Amount (GHS),Channel,Rail,Status,Reference\n';
    const csvRows = filteredTransactions
      .map(
        (tx) =>
          `${tx.id},${tx.customer},${tx.email},${tx.date},${tx.amount},${tx.localAmount},${tx.channel},${tx.rail},${tx.status},${tx.reference}`
      )
      .join('\n');
    const csv = csvHeader + csvRows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agilepay-transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ArrowLeftRight className="w-7 h-7 text-brand-500" />
            <span>Transactions</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Full settlement log with real-time MoMo off-ramp status and Base USDC rail details
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors self-start"
        >
          <Download className="w-4 h-4 text-brand-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ${totalCollected.toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            ≈ GH₵ {totalLocalCollected.toFixed(2)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Successful
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {paidCount}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-500 font-bold">Settled</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {pendingCount}
          </div>
          <div className="mt-1 text-xs text-slate-400">Awaiting settlement</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg Settlement
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            1.2s
          </div>
          <div className="mt-1 text-xs text-emerald-500 font-bold">Instant MoMo</div>
        </div>
      </div>

      {/* Filters & Transactions Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Transaction History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {filteredTransactions.length} of {transactions.length} transactions shown
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Channel Filter */}
            <div className="relative flex items-center">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="pl-9 pr-8 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
              >
                <option value="all">All Channels</option>
                <option value="momo">Mobile Money</option>
                <option value="card">Card</option>
                <option value="usdc">USDC Rail</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative flex items-center">
              <CheckCircle2 className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, ref, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-7 h-7 text-slate-400" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              No transactions found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your filters or search query
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
                  <th className="pb-3">Channel</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredTransactions.map((tx) => {
                  const ChannelIcon = CHANNEL_ICONS[tx.channel] || CreditCard;
                  const channelColor = CHANNEL_COLORS[tx.channel] || 'text-slate-400';
                  const isExpanded = expandedTxId === tx.id;
                  return (
                    <React.Fragment key={tx.id}>
                      <tr
                        onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-xs shrink-0">
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
                          <div className="flex items-center gap-2">
                            <ChannelIcon className={`w-4 h-4 ${channelColor} shrink-0`} />
                            <div>
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {tx.channel}
                              </span>
                              <p className="text-[10px] text-slate-400 mt-0.5">{tx.rail}</p>
                            </div>
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

                        <td className="py-3.5 text-right pr-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="font-mono text-[11px] text-slate-400">
                              {tx.reference}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Detail Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                          <td colSpan={6} className="px-4 sm:px-6 py-5">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                  Transaction ID
                                </p>
                                <p className="font-mono font-bold text-slate-900 dark:text-white">
                                  {tx.id}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                  Settlement Rail
                                </p>
                                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  {tx.rail}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                  Customer Email
                                </p>
                                <p className="font-medium text-slate-700 dark:text-slate-300">
                                  {tx.email}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                  Channel
                                </p>
                                <p className="font-semibold text-slate-700 dark:text-slate-300">
                                  {tx.channel}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
                              <span className="text-[11px] text-slate-400">
                                Digital receipt delivered to {tx.email}
                              </span>
                              <Link
                                href={`/pay/${tx.reference.split('-').pop()}`}
                                className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>View Checkout Page</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
