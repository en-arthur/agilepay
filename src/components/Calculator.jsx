'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  ShieldCheck,
  CheckCircle,
  Zap,
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
    <div id="calculator" className="frame-row">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="label label--active mb-4">
          ROI & Savings Calculator
        </div>
        <h2>
          Stop losing 5–8% to SWIFT wire delays & hidden FX markups
        </h2>
        <p className="lead mx-auto">
          See how much your business saves by replacing legacy correspondent banking with AgilePay’s
          Base USDC settlement and instant MoMo off-ramps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
        {/* Controls Column */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-[var(--r-lg)] bg-[var(--bg-subtle)] border border-[var(--border)] shadow-sm space-y-7 flex flex-col justify-between">
          {/* Monthly Volume Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-[var(--text)]">
                Estimated Monthly Cross-Border Volume
              </label>
              <span className="font-mono text-base font-semibold text-[var(--accent)]">
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
              className="w-full h-2 bg-[var(--border)] rounded-[var(--r-pill)] appearance-none cursor-pointer accent-[var(--accent)]"
            />
            <div className="flex justify-between text-xs font-mono text-[var(--text-faint)] mt-1.5">
              <span>$1,000</span>
              <span>$50,000</span>
              <span>$100,000+</span>
            </div>
          </div>

          {/* Monthly Transfers Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-[var(--text)]">
                Average Inbound Payments / Month
              </label>
              <span className="font-mono text-base font-semibold text-[var(--accent)]">
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
              className="w-full h-2 bg-[var(--border)] rounded-[var(--r-pill)] appearance-none cursor-pointer accent-[var(--accent)]"
            />
            <div className="flex justify-between text-xs font-mono text-[var(--text-faint)] mt-1.5">
              <span>5 payouts</span>
              <span>100 payouts</span>
              <span>200+ payouts</span>
            </div>
          </div>

          {/* Breakdown Comparison Grid */}
          <div className="pt-6 border-t border-[var(--border)] grid grid-cols-2 gap-4">
            <div className="p-4 rounded-[var(--r-md)] bg-[var(--bg)] border border-[var(--border)]">
              <p className="text-[11px] font-mono uppercase tracking-wider text-rose-500 font-semibold">
                Traditional SWIFT
              </p>
              <p className="text-xl font-medium text-[var(--text)] mt-1 tabular-nums">
                ${Math.round(traditionalFee).toLocaleString()}
              </p>
              <p className="text-[11px] text-[var(--text-faint)] mt-1 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-[var(--text-faint)]" />
                <span>3-5 business days</span>
              </p>
            </div>

            <div className="p-4 rounded-[var(--r-md)] bg-[var(--accent-soft)] border border-[var(--accent)]/30">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent)] font-semibold">
                AgilePay Rails
              </p>
              <p className="text-xl font-medium text-[var(--accent)] mt-1 tabular-nums">
                ${Math.round(agilePayFee).toLocaleString()}
              </p>
              <p className="text-[11px] text-[var(--accent)] mt-1 flex items-center gap-1 font-mono">
                <Zap className="w-3 h-3 fill-current stroke-none" />
                <span>Instant MoMo clearing</span>
              </p>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 p-8 rounded-[var(--r-lg)] bg-[var(--ink)] text-[var(--bg)] shadow-[var(--shadow-card)] border border-[var(--border-strong)] flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="label label--active !text-[var(--bg)] before:!bg-[var(--accent)]">
                Estimated Net Savings
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="amount text-4xl sm:text-5xl !text-[var(--bg)] font-normal tracking-tight">
                  ${Math.round(annualSavings).toLocaleString()}
                </span>
                <span className="text-sm font-mono text-[var(--text-faint)]">/ year</span>
              </div>
              <p className="text-xs text-[var(--text-faint)] mt-2">
                Save ~${Math.round(monthlySavings).toLocaleString()} each month ({percentSaved}% lower fees).
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-[var(--border-strong)]/30 text-xs text-[var(--bg)]/90">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Direct settlement to MTN MoMo & local bank</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero correspondent wire deductions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Transparent 1.0% flat fee</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link
              href="/signup"
              className="btn btn--primary w-full py-3"
            >
              <span>Start Saving With AgilePay</span>
              <span className="caret" />
            </Link>
            <p className="text-center text-[10px] font-mono text-[var(--text-faint)] mt-2.5">
              Free sandbox setup in 2 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
