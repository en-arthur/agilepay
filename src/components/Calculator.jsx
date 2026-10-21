'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calculator as CalcIcon,
  TrendingUp,
  Zap,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export default function Calculator() {
  const [monthlyVolume, setMonthlyVolume] = useState(15000); // USD
  const [numTransfers, setNumTransfers] = useState(20);

  // Traditional fee: 4.2% forex spread + $35 wire charge per batch transfer
  const traditionalFee = monthlyVolume * 0.042 + numTransfers * 35;

  // AgilePay fee: 1.0% transparent rail fee, $0 wire fee
  const agilePayFee = monthlyVolume * 0.01;

  // Monthly and Annual savings
  const monthlySavings = Math.max(0, traditionalFee - agilePayFee);
  const annualSavings = monthlySavings * 12;
  const percentSaved = Math.round((monthlySavings / traditionalFee) * 100) || 75;

  return (
    <section id="calculator" className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <CalcIcon className="w-3.5 h-3.5" />
            <span>ROI & Savings Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Stop losing 5–8% to SWIFT wire delays & hidden FX markups
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            See how much your business saves by replacing legacy correspondent banking with AgilePay’s
            Base USDC settlement and instant MoMo off-ramps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {/* Controls Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111624] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            {/* Monthly Volume Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Estimated Monthly Cross-Border Volume
                </label>
                <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                  ${monthlyVolume.toLocaleString()} USD
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>$1,000</span>
                <span>$50,000</span>
                <span>$100,000+</span>
              </div>
            </div>

            {/* Monthly Transfers Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Average Inbound Payments / Month
                </label>
                <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                  {numTransfers} transfers
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={numTransfers}
                onChange={(e) => setNumTransfers(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>5 payouts</span>
                <span>100 payouts</span>
                <span>200+ payouts</span>
              </div>
            </div>

            {/* Breakdown Comparison Grid */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <p className="text-xs text-rose-500 font-semibold uppercase tracking-wider">
                  Traditional Wire & SWIFT
                </p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                  ${Math.round(traditionalFee).toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>3 to 5 business days</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30">
                <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold uppercase tracking-wider">
                  AgilePay Rails
                </p>
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">
                  ${Math.round(agilePayFee).toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Instant MoMo clearing</span>
                </p>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-5 p-8 rounded-2xl bg-gradient-to-br from-brand-600 via-indigo-600 to-brand-700 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-brand-200 bg-white/10 px-3 py-1 rounded-full inline-block">
                  Estimated Net Savings
                </span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight">
                    ${Math.round(annualSavings).toLocaleString()}
                  </span>
                  <span className="text-brand-200 font-medium">/ year</span>
                </div>
                <p className="text-xs text-brand-100 mt-1">
                  That’s approximately ${Math.round(monthlySavings).toLocaleString()} saved each month (~{percentSaved}% savings).
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/15 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Direct settlement to MTN MoMo & Ghanaian bank</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Zero intermediary SWIFT correspondent fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Real-time mid-market rate with 1.0% flat fee</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/signup"
                  className="w-full py-3.5 px-6 rounded-xl bg-white text-brand-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 active:scale-95 transition-all shadow-lg"
                >
                  <span>Start Saving With AgilePay</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-center text-[11px] text-brand-200 mt-2">
                  No credit card required. Free sandbox setup in 2 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
