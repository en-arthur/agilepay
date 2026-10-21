'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Calculator from '@/components/Calculator';
import {
  Code2,
  MessageSquare,
  Coins,
  ArrowRight,
  ArrowDownUp,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  const [payAmount, setPayAmount] = useState('50.00');
  const [receiveAmount, setReceiveAmount] = useState('775.00');

  const handleSwapChange = (val) => {
    setPayAmount(val);
    const num = parseFloat(val) || 0;
    setReceiveAmount((num * 15.5).toFixed(2));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text-body)] selection:bg-[var(--accent)] selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      <main className="frame">
        {/* Hero Section */}
        <section className="hero frame-row">
          {/* Announcement pill */}
          <div className="flex justify-center mb-8">
            <Link href="/dashboard/developers" className="announce group hover:border-[var(--border-strong)] transition-colors">
              <span className="announce__badge">NEW</span>
              <span className="text-[var(--text)] text-xs sm:text-sm">
                Receive funds in your local currency: GHS, NGN, or KES automatically
              </span>
              <span className="caret ml-0.5 text-[var(--text-faint)] group-hover:text-[var(--text)] transition-colors" />
            </Link>
          </div>

          {/* Headline & Lead */}
          <h1 className="max-w-4xl mx-auto">
            Global Collections for African Businesses,{' '}
            <span className="text-[var(--accent)]">
              Settled Instantly.
            </span>
          </h1>

          <p className="lead mt-6">
            Accept payments from anywhere via Card, Mobile Money, or Crypto. Settle instantly to local
            MoMo or bank accounts with just 3 lines of code or simple no-code links.
          </p>

          {/* CTA Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="btn btn--dark w-full sm:w-auto"
            >
              <span>Start Building</span>
              <span className="caret" />
            </Link>

            <Link
              href="/dashboard/developers"
              className="btn btn--secondary w-full sm:w-auto"
            >
              <span>View Documentation</span>
            </Link>
          </div>

          {/* Product Visual: Lumx Diagonal Hatch Panel + Swap Card & Platform Preview */}
          <div className="mt-14 max-w-5xl mx-auto space-y-8">
            {/* Lumx Panel Hatch with Swap Card */}
            <div className="panel-hatch shadow-sm">
              <div className="swap">
                <div className="swap__head">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="mono-meta">LIVE RATE: 1 USD = 15.50 GHS · ZERO SPREAD</span>
                </div>

                {/* From Field */}
                <div className="swap__field">
                  <div className="swap__row">
                    <span className="mono-meta uppercase">Customer Pays</span>
                    <span className="status status--ok">Base USDC Rail</span>
                  </div>
                  <div className="swap__row mt-2.5">
                    <div className="flex items-baseline">
                      <input
                        type="text"
                        value={payAmount}
                        onChange={(e) => handleSwapChange(e.target.value)}
                        className="amount bg-transparent border-none outline-none w-36 font-normal"
                      />
                      <span className="unit font-mono text-sm text-[var(--text-faint)]">USD</span>
                    </div>
                    <span className="text-xs text-[var(--text-faint)] font-mono">Visa / Mastercard / USDC</span>
                  </div>
                </div>

                {/* Central Swap Toggle Button */}
                <div className="swap__toggle" title="Auto-converted rate">
                  <ArrowDownUp className="w-3.5 h-3.5" />
                </div>

                {/* To Field */}
                <div className="swap__field">
                  <div className="swap__row">
                    <span className="mono-meta uppercase">Merchant Receives</span>
                    <span className="mono-meta text-emerald-600 dark:text-emerald-400 font-semibold">Instant MoMo Off-Ramp</span>
                  </div>
                  <div className="swap__row mt-2.5">
                    <div className="flex items-baseline">
                      <span className="amount font-normal">{receiveAmount}</span>
                      <span className="unit font-mono text-sm text-[var(--text-faint)]">GHS</span>
                    </div>
                    <span className="text-xs font-mono text-[var(--accent)] font-medium">MTN Mobile Money 🇬🇭</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Preview Image Container */}
            <div className="relative rounded-[var(--r-lg)] overflow-hidden border border-[var(--border)] bg-[var(--bg-subtle)] shadow-sm aspect-[16/9] flex items-center justify-center">
              <img
                src="/dashboard-preview.png"
                alt="AgilePay Platform Preview"
                className="w-full h-full object-cover hidden"
              />
              <div className="text-center space-y-3 p-8">
                <div className="w-14 h-14 rounded-[var(--r-md)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto border border-[var(--accent)]/30">
                  <Zap className="w-7 h-7 fill-current stroke-none" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-[var(--text)]">
                    AgilePay Platform & Checkout Preview
                  </h3>
                  <p className="text-xs font-mono text-[var(--text-faint)] mt-1">
                    Image preview area (place your screenshot or image here)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Network Logos Bar */}
        <section className="frame-row frame-row--tight bg-[var(--bg-subtle)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <span className="label">
              Settlement Partners
            </span>
            <div className="flex flex-wrap items-center gap-8 text-xs font-mono text-[var(--text-body)]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>MTN Mobile Money</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Base Network USDC</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Visa & Mastercard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>NIP Direct Bank</span>
              </div>
            </div>
          </div>
        </section>

        {/* Foundation & Features Section */}
        <section id="features" className="frame-row">
          <div className="max-w-3xl mb-14">
            <div className="label label--active mb-4">
              01 / Global Payments
            </div>
            <h2>
              Everything your business needs to collect and settle globally
            </h2>
            <p className="lead">
              Whether you are integrating the Python SDK or selling handmade products online,
              AgilePay bridges the gap between global buyers and local wallets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: 3-Line Developer Integration */}
            <div className="p-7 rounded-[var(--r-lg)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[var(--r-md)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-6">
                  <Code2 className="w-5 h-5" />
                </div>
                <div className="label label--active mb-2">SDK & API</div>
                <h3 className="text-lg font-medium text-[var(--text)] mb-3">
                  3-Line Developer Integration
                </h3>
                <p className="text-sm text-[var(--text-body)] leading-relaxed mb-6">
                  Drop-in Python SDK and webhooks that get developers up and running in minutes. Complete
                  with automated retry logic and sandbox simulation modes.
                </p>
              </div>
              <ul className="space-y-2 text-xs font-mono text-[var(--text-faint)] pt-4 border-t border-[var(--border)]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--accent)]" />
                  <span>Python library and SDK</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--accent)]" />
                  <span>Webhook lifecycle events</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--accent)]" />
                  <span>Partner split fees engine</span>
                </li>
              </ul>
            </div>

            {/* Card 2: No-Code Payment Links */}
            <div className="p-7 rounded-[var(--r-lg)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[var(--r-md)] bg-[var(--bg-subtle)] text-[var(--text)] flex items-center justify-center mb-6 border border-[var(--border)]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="label label--active mb-2">Commerce</div>
                <h3 className="text-lg font-medium text-[var(--text)] mb-3">
                  No-Code Payment Links
                </h3>
                <p className="text-sm text-[var(--text-body)] leading-relaxed mb-6">
                  Generate payment links in seconds. Turn your Instagram bio, invoice email, or social media
                  post into an instant checkout.
                </p>
              </div>
              <ul className="space-y-2 text-xs font-mono text-[var(--text-faint)] pt-4 border-t border-[var(--border)]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--accent)]" />
                  <span>1-click short links & QR codes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--accent)]" />
                  <span>Shareable via SMS, email & bio</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--accent)]" />
                  <span>Automatic digital receipts</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Stablecoin-Powered Settlement */}
            <div className="p-7 rounded-[var(--r-lg)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[var(--r-md)] bg-[var(--bg-subtle)] text-[var(--text)] flex items-center justify-center mb-6 border border-[var(--border)]">
                  <Coins className="w-5 h-5" />
                </div>
                <div className="label label--active mb-2">Settlement</div>
                <h3 className="text-lg font-medium text-[var(--text)] mb-3">
                  Fast Cross-Border Settlement
                </h3>
                <p className="text-sm text-[var(--text-body)] leading-relaxed mb-6">
                  Get paid in dollars and receive the money directly in your local mobile money or bank
                  account. No more waiting days for international bank transfers.
                </p>
              </div>
              <ul className="space-y-2 text-xs font-mono text-[var(--text-faint)] pt-4 border-t border-[var(--border)]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--accent)]" />
                  <span>Settlement in GHS, NGN, or KES</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--accent)]" />
                  <span>Immediate local MoMo payout</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--accent)]" />
                  <span>Zero hidden FX markups</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Interactive Fee Calculator Section */}
        <Calculator />

        {/* Merchant Operations Hub CTA */}
        <section className="frame-row">
          <div className="p-8 sm:p-12 rounded-[var(--r-lg)] bg-[var(--ink)] text-[var(--bg)] border border-[var(--border-strong)] flex flex-col sm:flex-row sm:items-center justify-between gap-8">
            <div className="max-w-xl space-y-3">
              <div className="label label--active !text-[var(--bg)] before:!bg-[var(--accent)]">
                Merchant Operations Hub
              </div>
              <h2 className="!text-[var(--bg)] mb-2">
                Ready to collect payments in seconds?
              </h2>
              <p className="text-sm text-[var(--bg)]/80 leading-relaxed">
                Log into the non-code merchant dashboard or use our developer API keys to start accepting
                real card, MoMo, and crypto payments today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                href="/dashboard"
                className="btn btn--secondary !bg-[var(--bg)] !text-[var(--ink)] text-center"
              >
                <span>Merchant Dashboard</span>
              </Link>
              <Link
                href="/dashboard/developers"
                className="btn btn--primary text-center"
              >
                <span>Developer Portal</span>
                <span className="caret" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
