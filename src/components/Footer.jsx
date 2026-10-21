'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Cpu,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg)] transition-colors">
      <div className="frame">
        {/* Compliance Badges Bar */}
        <div className="frame-row grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3.5 rounded-[var(--r-md)] bg-[var(--bg-subtle)] border border-[var(--border)]">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-xs font-medium text-[var(--text)]">PCI-DSS Level 1</p>
              <p className="mono-meta mt-0.5">Highest security tier</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-[var(--r-md)] bg-[var(--bg-subtle)] border border-[var(--border)]">
            <Lock className="w-5 h-5 text-[var(--accent)] shrink-0" />
            <div>
              <p className="text-xs font-medium text-[var(--text)]">256-Bit TLS</p>
              <p className="mono-meta mt-0.5">End-to-end tokenization</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-[var(--r-md)] bg-[var(--bg-subtle)] border border-[var(--border)]">
            <Cpu className="w-5 h-5 text-[var(--accent)] shrink-0" />
            <div>
              <p className="text-xs font-medium text-[var(--text)]">Base USDC Rails</p>
              <p className="mono-meta mt-0.5">Instant on-chain clearing</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-[var(--r-md)] bg-[var(--bg-subtle)] border border-[var(--border)]">
            <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" />
            <div>
              <p className="text-xs font-medium text-[var(--text)]">Local MoMo Ready</p>
              <p className="mono-meta mt-0.5">MTN Mobile Money</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="frame-row grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[var(--r-sm)] bg-[var(--accent)] flex items-center justify-center text-white">
                <Zap className="w-3.5 h-3.5 fill-white" />
              </div>
              <span className="font-medium text-base text-[var(--text)]">AgilePay</span>
            </div>
            <p className="mt-3 text-sm text-[var(--text-body)] max-w-sm leading-relaxed">
              Global collections for African businesses, settled instantly.
              Accept payments via Card, MoMo, or Crypto and settle directly to your bank or mobile wallet.
            </p>
            <div className="mt-4">
              <span className="status status--ok">
                All payment networks operational (99.99%)
              </span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="label mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-body)]">
              <li>
                <Link href="/dashboard" className="hover:text-[var(--text)] transition-colors">
                  Merchant Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/links" className="hover:text-[var(--text)] transition-colors">
                  Payment Links
                </Link>
              </li>
              <li>
                <Link href="/pay/8492" className="hover:text-[var(--text)] transition-colors">
                  Hosted Checkout
                </Link>
              </li>
              <li>
                <Link href="/#calculator" className="hover:text-[var(--text)] transition-colors">
                  Fee Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Developers */}
          <div>
            <h4 className="label mb-3">
              Developers
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-body)]">
              <li>
                <Link href="/dashboard/developers" className="hover:text-[var(--text)] transition-colors">
                  3-Line SDK Quickstart
                </Link>
              </li>
              <li>
                <Link href="/dashboard/developers" className="hover:text-[var(--text)] transition-colors">
                  API Keys & Tokens
                </Link>
              </li>
              <li>
                <Link href="/dashboard/developers" className="hover:text-[var(--text)] transition-colors">
                  Webhook Inspector
                </Link>
              </li>
              <li>
                <Link href="/dashboard/developers" className="hover:text-[var(--text)] transition-colors">
                  Partner Split Fees
                </Link>
              </li>
              <li>
                <a
                  href="https://docs.agilepay.io"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--text)] transition-colors"
                >
                  REST API Reference
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="frame-row frame-row--tight flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-faint)]">
          <p>© {new Date().getFullYear()} AgilePay Global Technologies, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[var(--text)] transition-colors">
              Terms of Service
            </Link>
            <Link href="/security" className="hover:text-[var(--text)] transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
