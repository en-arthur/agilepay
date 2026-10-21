'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import QRCodePreview from '@/components/QRCodePreview';
import {
  CreditCard,
  Smartphone,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sun,
  Moon,
  Zap,
  Download,
  Share2,
  Check,
  Building,
} from 'lucide-react';

export default function HostedCheckoutPage() {
  const params = useParams();
  const linkId = params?.linkId || '8492';
  const { links, recordCheckoutPayment } = useApp();
  const { theme, toggleTheme } = useTheme();

  // Find linked item or fallback
  const linkData = links.find((l) => l.id === linkId) || {
    id: linkId,
    title: 'Shoe Haven Ghana - Leather Oxford Shoes',
    amount: 50.0,
    currency: 'USD',
    localAmount: 775.0,
    localCurrency: 'GHS',
    destination: 'MTN Mobile Money (+233 24 819 2041)',
  };

  const [paymentMethod, setPaymentMethod] = useState('momo'); // 'momo' | 'card' | 'crypto'
  const [buyerName, setBuyerName] = useState('Kofi Mensah');
  const [buyerEmail, setBuyerEmail] = useState('kofi.mensah@gmail.com');

  // MoMo Form
  const [momoNumber, setMomoNumber] = useState('0248192041');
  const [momoNetwork, setMomoNetwork] = useState('mtn');

  // Card Form
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('841');

  // Modal states: 'idle' | 'processing' | 'success'
  const [checkoutState, setCheckoutState] = useState('idle');
  const [completedTx, setCompletedTx] = useState(null);

  const handlePayNow = (e) => {
    e.preventDefault();
    setCheckoutState('processing');

    // Simulate Lumx routing and settlement delay
    setTimeout(() => {
      const tx = recordCheckoutPayment({
        customerName: buyerName,
        email: buyerEmail,
        amount: linkData.amount,
        currency: linkData.currency,
        localAmount: linkData.localAmount,
        channelLabel:
          paymentMethod === 'momo'
            ? `MoMo (${momoNetwork.toUpperCase()})`
            : paymentMethod === 'card'
            ? 'Card (Visa)'
            : 'USDC Base Rail',
      });
      setCompletedTx(tx);
      setCheckoutState('success');
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080B14] text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <Zap className="w-3.5 h-3.5 fill-white stroke-none" />
          </div>
          <span className="font-extrabold text-base text-slate-900 dark:text-white">
            AgilePay
          </span>
          <span className="text-[10px] font-semibold text-slate-400">Checkout</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full">
            <Lock className="w-3 h-3" />
            <span>256-bit Encrypted</span>
          </span>

          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Checkout Container */}
      <div className="max-w-4xl w-full mx-auto my-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Order Summary (5 cols) */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#0E1321] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Payment To
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              Shoe Haven Ghana
            </h2>
            <p className="text-xs text-slate-400">Verified Merchant · Accra, Ghana</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {linkData.title}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ref: AP-{linkData.id} · Single item checkout
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Total Due:</span>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ${linkData.amount.toFixed(2)} {linkData.currency}
                </span>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ≈ GH₵ {linkData.localAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Instant digital receipt sent to your email</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Direct settlement to merchant MTN MoMo</span>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Form (7 cols) */}
        <div className="md:col-span-7 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0E1321] border border-slate-200 dark:border-slate-800 shadow-xl">
          <form onSubmit={handlePayNow} className="space-y-6">
            {/* Buyer Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Choose Payment Method *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Method 1: MoMo */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('momo')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                    paymentMethod === 'momo'
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold">Mobile Money</span>
                </button>

                {/* Method 2: Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                    paymentMethod === 'card'
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-500" />
                  <span className="text-xs font-bold">Card</span>
                </button>

                {/* Method 3: Crypto */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                    paymentMethod === 'crypto'
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Coins className="w-5 h-5 text-cyan-500" />
                  <span className="text-xs font-bold">Base USDC</span>
                </button>
              </div>
            </div>

            {/* Method Details: MoMo */}
            {paymentMethod === 'momo' && (
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                      Network Provider
                    </label>
                    <select
                      value={momoNetwork}
                      onChange={(e) => setMomoNetwork(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="mtn">MTN Mobile Money 🇬🇭</option>
                      <option value="telecel">Telecel Cash 🇬🇭</option>
                      <option value="at">AT Money 🇬🇭</option>
                      <option value="mpesa">Safaricom M-Pesa 🇰🇪</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder="024 XXX XXXX"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>An authorization prompt will be pushed immediately to your handset.</span>
                </p>
              </div>
            )}

            {/* Method Details: Card */}
            {paymentMethod === 'card' && (
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="841"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Method Details: Crypto */}
            {paymentMethod === 'crypto' && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center space-y-3">
                <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                  Pay 50.00 USDC via Base Network
                </span>
                <QRCodePreview value="ethereum:0x98a109823b109820398402948102830192840192@8453?value=50" size={130} />
                <p className="font-mono text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  0x98a1...0192 (Lumx Smart Settlement Rail)
                </p>
              </div>
            )}

            {/* Action Pay Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-glow hover:shadow-glow-sm transition-all active:scale-[0.99]"
            >
              <Lock className="w-4 h-4" />
              <span>
                Pay ${linkData.amount.toFixed(2)} {linkData.currency} Now
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Security Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center pt-8 text-xs text-slate-400 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>🔒 Secured by AgilePay Invisible Rails · PCI-DSS Level 1 · Lumx Smart Off-Ramps</span>
      </footer>

      {/* Processing & Success Modal */}
      {checkoutState !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md" />

          <div className="relative w-full max-w-md bg-white dark:bg-[#0D1220] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-center space-y-6">
            {checkoutState === 'processing' ? (
              <div className="py-6 space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-16 h-16 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-brand-500 fill-brand-500 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Routing payment via Lumx rails...
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Initiating Base USDC clearing and converting directly to MTN Mobile Money payout.
                  </p>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full w-2/3 animate-pulse" />
                </div>
              </div>
            ) : (
              /* Success State */
              <div className="space-y-5 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Payment Successful!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Your digital receipt has been sent to {buyerEmail}
                  </p>
                </div>

                {/* Instant Payout Badge */}
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Settled to Merchant MoMo (+233 24 819 2041)</span>
                </div>

                {/* Receipt Details Box */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {completedTx?.id || 'tx_98419'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount Charged:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ${linkData.amount.toFixed(2)} USD (GH₵ {linkData.localAmount.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rail Network:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Base USDC ⚡ Instant Clearing
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href="/dashboard"
                    className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-glow-sm transition-all"
                  >
                    <span>View in Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => setCheckoutState('idle')}
                    className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
