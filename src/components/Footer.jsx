'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Cpu,
  CheckCircle2,
  Zap,
  Globe,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#07090F] pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compliance Badges Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">PCI-DSS Level 1</p>
              <p className="text-[11px] text-slate-500">Highest banking security</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
            <Lock className="w-6 h-6 text-brand-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">256-Bit TLS</p>
              <p className="text-[11px] text-slate-500">End-to-end tokenization</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
            <Cpu className="w-6 h-6 text-violet-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Base USDC Rails</p>
              <p className="text-[11px] text-slate-500">Instant on-chain clearing</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
            <CheckCircle2 className="w-6 h-6 text-sky-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Local MoMo Ready</p>
              <p className="text-[11px] text-slate-500">MTN Mobile Money</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          {/* Col 1: Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-white">AgilePay</span>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Global collections for African businesses, settled instantly.
              Accept payments via Card, MoMo, or Crypto and settle directly to your bank or mobile wallet.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All payment networks operational (99.99%)</span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/dashboard" className="hover:text-brand-500 transition-colors">
                  Merchant Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/links" className="hover:text-brand-500 transition-colors">
                  Payment Links
                </Link>
              </li>
              <li>
                <Link href="/pay/8492" className="hover:text-brand-500 transition-colors">
                  Hosted Checkout
                </Link>
              </li>
              <li>
                <Link href="/#calculator" className="hover:text-brand-500 transition-colors">
                  Fee Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Developers */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Developers
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/dashboard/developers" className="hover:text-brand-500 transition-colors">
                  3-Line SDK Quickstart
                </Link>
              </li>
              <li>
                <Link href="/dashboard/developers" className="hover:text-brand-500 transition-colors">
                  API Keys & Tokens
                </Link>
              </li>
              <li>
                <Link href="/dashboard/developers" className="hover:text-brand-500 transition-colors">
                  Webhook Inspector
                </Link>
              </li>
              <li>
                <Link href="/dashboard/developers" className="hover:text-brand-500 transition-colors">
                  Partner Split Fees
                </Link>
              </li>
              <li>
                <a
                  href="https://docs.agilepay.io"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-500 transition-colors"
                >
                  REST API Reference
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AgilePay Global Technologies, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-800 dark:hover:text-slate-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-800 dark:hover:text-slate-300">
              Terms of Service
            </Link>
            <Link href="/security" className="hover:text-slate-800 dark:hover:text-slate-300">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
