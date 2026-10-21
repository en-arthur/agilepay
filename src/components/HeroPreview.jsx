'use client';

import React, { useState } from 'react';
import {
  Check,
  Copy,
  Terminal,
  Smartphone,
  CreditCard,
  Coins,
  ShieldCheck,
  ArrowRight,
  Zap,
} from 'lucide-react';

const SNIPPETS = {
  nodejs: `import { AgilePay } from '@agilepay/sdk';

const checkout = new AgilePay({ apiKey: process.env.AGILEPAY_KEY });
await checkout.charge({
  amount: 50,
  currency: 'USD',
  channel: 'momo', // MTN, Telecel, M-Pesa or Card
  recipient: '+233248192041'
});`,

  python: `from agilepay import AgilePay
import os

client = AgilePay(api_key=os.getenv("AGILEPAY_KEY"))
charge = client.charges.create(
    amount=50.00,
    currency="USD",
    channel="momo",
    payout_to="+233248192041"
)`,

  react: `import { useAgileCheckout } from '@agilepay/react';

export function PayButton() {
  const { openCheckout } = useAgileCheckout();

  return (
    <button onClick={() => openCheckout({ amount: 50, currency: 'USD' })}>
      Instant Checkout (MoMo & Card)
    </button>
  );
}`,

  curl: `curl -X POST https://api.agilepay.io/v1/charges \\
  -H "Authorization: Bearer sec_live_948f..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 50.00,
    "currency": "USD",
    "channel": "momo",
    "payout_rail": "base_usdc_instant"
  }'`,
};

export default function HeroPreview() {
  const [activeTab, setActiveTab] = useState('nodejs');
  const [copied, setCopied] = useState(false);
  const [activeChannel, setActiveChannel] = useState('momo');

  const copyCode = () => {
    navigator.clipboard.writeText(SNIPPETS[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* Glow aura background */}
      <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/20 via-indigo-600/15 to-violet-500/20 blur-3xl -z-10 pointer-events-none rounded-3xl" />

      {/* Code Snippet Box (7 cols) */}
      <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-700/80 bg-[#0C101A] shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#131926] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-xs font-mono text-slate-400">agilepay-integration.js</span>
          </div>

          {/* Language Tabs */}
          <div className="flex items-center gap-1 bg-[#0A0D14] p-1 rounded-lg border border-slate-800">
            {['nodejs', 'python', 'react', 'curl'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  activeTab === tab
                    ? 'bg-brand-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'nodejs'
                  ? 'Node.js'
                  : tab === 'python'
                  ? 'Python'
                  : tab === 'react'
                  ? 'React'
                  : 'cURL'}
              </button>
            ))}
          </div>

          {/* Copy Button */}
          <button
            onClick={copyCode}
            aria-label="Copy Code"
            className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content Area */}
        <div className="p-5 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto leading-relaxed bg-[#0A0E17]">
          <pre className="text-slate-300">
            <code>
              {SNIPPETS[activeTab].split('\n').map((line, idx) => {
                let formatted = line;
                let colorClass = 'text-slate-300';
                if (line.startsWith('import ') || line.startsWith('from ') || line.startsWith('export ')) {
                  colorClass = 'text-brand-400 font-semibold';
                } else if (line.includes('const ') || line.includes('await ') || line.includes('def ')) {
                  colorClass = 'text-purple-400';
                } else if (line.includes('//') || line.includes('#')) {
                  colorClass = 'text-slate-500 italic';
                } else if (line.includes('amount') || line.includes('currency') || line.includes('channel')) {
                  colorClass = 'text-cyan-300';
                } else if (line.includes('curl -X')) {
                  colorClass = 'text-amber-300';
                }
                return (
                  <div key={idx} className="flex">
                    <span className="w-7 select-none text-slate-600 text-right pr-4 text-xs">
                      {idx + 1}
                    </span>
                    <span className={colorClass}>{formatted}</span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>

        {/* Terminal Footer */}
        <div className="px-5 py-2.5 bg-[#0e1422] border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-medium">Auto-Settlement Ready</span>
          </div>
          <span className="text-slate-500">Latency: 180ms · Lumx Base USDC Rail</span>
        </div>
      </div>

      {/* Live Interactive Preview Card (5 cols) */}
      <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111624] p-6 shadow-2xl relative transition-all">
        {/* Floating badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-4">
          <Zap className="w-3.5 h-3.5" />
          <span>Live Hosted Checkout Preview</span>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Merchant</p>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Shoe Haven Ghana
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Order #AP-8492</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                $50.00
              </span>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                ≈ GHS 775.00
              </p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">
              Choose Payment Rail
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveChannel('momo')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                  activeChannel === 'momo'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/30'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Smartphone className="w-5 h-5 text-amber-500" />
                <span className="text-[11px] font-bold">MoMo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveChannel('card')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                  activeChannel === 'card'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/30'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-500" />
                <span className="text-[11px] font-bold">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveChannel('usdc')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                  activeChannel === 'usdc'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/30'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Coins className="w-5 h-5 text-cyan-500" />
                <span className="text-[11px] font-bold">USDC Rail</span>
              </button>
            </div>
          </div>

          {/* Dynamic instruction */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            {activeChannel === 'momo' && (
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Instant STK push notification to MTN / Telecel number</span>
              </p>
            )}
            {activeChannel === 'card' && (
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Accepts Visa, Mastercard & Apple Pay with 3D Secure</span>
              </p>
            )}
            {activeChannel === 'usdc' && (
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Base L2 Smart Settlement. Off-ramps to MoMo automatically.</span>
              </p>
            )}
          </div>

          <a
            href="/pay/8492"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all"
          >
            <span>Open Interactive Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Instant MoMo & Bank Off-ramp</span>
          </div>
        </div>
      </div>
    </div>
  );
}
