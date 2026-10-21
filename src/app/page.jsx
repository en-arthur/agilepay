'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Calculator from '@/components/Calculator';
import {
  Zap,
  Code2,
  MessageSquare,
  Coins,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Smartphone,
  CreditCard,
  Building2,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Subtle background glow circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-brand-600/20 via-indigo-600/10 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-300 text-xs font-semibold mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-ping" />
            <span>Receive funds in your local currency: Receive funds in GHS, NGN, or KES automatically</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>

          {/* Catchy Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.12]">
            Global Collections for African Businesses,{' '}
            <span className="bg-gradient-to-r from-brand-500 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
              Settled Instantly.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Accept payments from anywhere via Card, Mobile Money, or Crypto. Settle instantly to local
            MoMo or bank accounts with just 3 lines of code or simple no-code links.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex items-center justify-center">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base shadow-glow hover:shadow-glow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <span>Start Building</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Platform Preview Image Container */}
          <div className="w-full max-w-5xl mx-auto mt-12">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1321] shadow-2xl aspect-[16/9] flex items-center justify-center group">
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/20 via-indigo-600/15 to-violet-500/20 blur-3xl -z-10 pointer-events-none rounded-3xl" />
              <img
                src="/dashboard-preview.png"
                alt="AgilePay Platform Preview"
                className="w-full h-full object-cover hidden"
              />
              <div className="text-center space-y-3 p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-violet-400 flex items-center justify-center text-white shadow-glow mx-auto">
                  <Zap className="w-8 h-8 fill-white stroke-none" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    AgilePay Platform & Checkout Preview
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Image preview area (place your screenshot or image here)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Logos Bar */}
      <section className="py-10 border-y border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-[#0A0E18]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6">
            Supported Settlement Channels & Financial Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-500 dark:text-slate-400 font-semibold text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span>MTN Mobile Money</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span>Base Network USDC</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
              <span>Visa & Mastercard</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Cards */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for Modern Commerce</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Everything your business needs to collect and settle globally
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Whether you are integrating the Python SDK or selling handmade products online,
            AgilePay bridges the gap between global buyers and local wallets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: 3-Line Developer Integration */}
          <div className="p-8 rounded-2xl bg-white dark:bg-[#101524] border border-slate-200 dark:border-slate-800 shadow-lg hover:border-brand-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              1. 3-Line Developer Integration
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Drop-in Python SDK and webhooks that get developers up and running in minutes. Complete
              with automated retry logic and sandbox simulation modes.
            </p>
            <ul className="space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Python library and SDK</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Webhook events for every lifecycle status</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Custom partner split fees engine</span>
              </li>
            </ul>
          </div>

          {/* Card 2: No-Code Payment Links */}
          <div className="p-8 rounded-2xl bg-white dark:bg-[#101524] border border-slate-200 dark:border-slate-800 shadow-lg hover:border-brand-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              2. No-Code Payment Links
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Generate payment links in seconds. Turn your Instagram bio, invoice email, or social media
              post into an instant checkout.
            </p>
            <ul className="space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>1-click short links and QR code generator</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Shareable via SMS, email, or social media</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Customer SMS receipt confirmation</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Stablecoin-Powered Settlement */}
          <div className="p-8 rounded-2xl bg-white dark:bg-[#101524] border border-slate-200 dark:border-slate-800 shadow-lg hover:border-brand-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              3. Fast Cross-Border Settlement
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Get paid in dollars and receive the money directly in your local mobile money or bank
              account. No more waiting days for international bank transfers to clear.
            </p>
            <ul className="space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Receive funds in GHS, NGN, or KES automatically</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Money lands in your mobile money wallet instantly</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>No hidden exchange rate markups or surprise fees</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Fee Calculator Section */}
      <Calculator />

      {/* Merchant Dashboard Preview Banner */}
      <section className="py-20 bg-slate-100/70 dark:bg-[#0B0F19] border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-2xl border border-brand-800/40">
            <div className="max-w-2xl relative z-10 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-300">
                Merchant Operations Hub
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Ready to collect payments in seconds?
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Log into the non-code merchant dashboard or use our developer API keys to start accepting
                real card, MoMo, and crypto payments today.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 rounded-xl bg-white text-brand-900 font-bold text-sm hover:bg-slate-100 transition-all shadow-md"
                >
                  Open Merchant Dashboard
                </Link>
                <Link
                  href="/dashboard/developers"
                  className="px-6 py-3 rounded-xl border border-brand-400/50 hover:bg-brand-800/40 text-white font-semibold text-sm transition-all"
                >
                  View Developer Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
