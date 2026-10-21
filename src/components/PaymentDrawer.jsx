'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import QRCodePreview from './QRCodePreview';
import {
  X,
  Link2,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function PaymentDrawer({ isOpen, onClose }) {
  const { createPaymentLink, showToast } = useApp();

  const [amount, setAmount] = useState('50.00');
  const [currency, setCurrency] = useState('USD');
  const [title, setTitle] = useState('Leather Oxford Shoes - Brown (Size 43)');
  const [note, setNote] = useState('Includes express delivery within Accra');
  const [destination, setDestination] = useState('MTN Mobile Money (+233 24 819 2041)');

  const [createdLink, setCreatedLink] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    const newLink = createPaymentLink({
      amount: Number(amount),
      currency,
      title,
      note,
      destination,
    });
    setCreatedLink(newLink);
  };

  const resetForm = () => {
    setCreatedLink(null);
    setAmount('50.00');
    setTitle('');
    setNote('');
  };

  const handleCopyShortUrl = () => {
    if (!createdLink) return;
    const url = `https://${createdLink.shortUrl}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Payment link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyWhatsAppMsg = () => {
    if (!createdLink) return;
    const msg = `Hi there! 👋 Here is your secure payment link for *${createdLink.title}* (${createdLink.currency} ${createdLink.amount}):\n👉 https://${createdLink.shortUrl}\n\nYou can pay securely via MTN MoMo, Telecel Cash, Card, or Crypto USDC. Instant digital receipt included!`;
    navigator.clipboard.writeText(msg);
    setCopiedWhatsApp(true);
    showToast('WhatsApp message formatted & copied!');
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0E131F] h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {createdLink ? 'Payment Link Ready' : 'Create Payment Link'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {createdLink
                  ? 'Share this link anywhere or send via WhatsApp'
                  : 'Sell goods, services, or collect invoices with 0 code'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1">
          {!createdLink ? (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Amount & Currency */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Amount & Currency *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'GH₵'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="50.00"
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full py-3 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="GHS">GHS (GH₵)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  Approx. GH₵ {(Number(amount || 0) * (currency === 'USD' ? 15.5 : 1)).toFixed(2)} at mid-market rate.
                </p>
              </div>

              {/* Order / Product Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Product / Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Handmade Leather Loafers (Size 42)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Order Note */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Customer Note / Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Delivery takes 24 hours. Enter your shipping address at checkout."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Payout Destination */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Instant Payout Destination *
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="MTN Mobile Money (+233 24 819 2041)">
                    MTN Mobile Money (+233 24 819 2041) - Instant
                  </option>
                  <option value="Telecel Cash (+233 50 339 1042)">
                    Telecel Cash (+233 50 339 1042) - Instant
                  </option>
                  <option value="Standard Chartered Bank (Account ****9102)">
                    Standard Chartered Bank (Account ****9102) - Same Day
                  </option>
                  <option value="Base USDC Smart Wallet (0x84...9204)">
                    Base USDC Smart Wallet (0x84...9204) - On-Chain
                  </option>
                </select>
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Funds automatically off-ramped directly to this destination upon payment</span>
                </p>
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Payment Link</span>
                </button>
              </div>
            </form>
          ) : (
            /* Output State */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    Payment Link Active!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Your customers can now pay via MoMo, Card, or Crypto.
                  </p>
                </div>
              </div>

              {/* Short Link Display Box */}
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 mb-1.5 block">
                  Short URL
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-mono text-sm text-brand-600 dark:text-brand-400 font-semibold truncate flex-1 pl-1">
                    https://{createdLink.shortUrl}
                  </span>
                  <button
                    onClick={handleCopyShortUrl}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition-colors"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
                <QRCodePreview value={`https://${createdLink.shortUrl}`} size={140} />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-3">
                  Scan to Pay ${createdLink.amount} {createdLink.currency}
                </p>
                <p className="text-[11px] text-slate-400">
                  Perfect for retail counters, Instagram stories, or printed flyers
                </p>
              </div>

              {/* 1-Click WhatsApp Button */}
              <button
                onClick={handleCopyWhatsAppMsg}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>
                  {copiedWhatsApp ? 'WhatsApp Message Copied!' : '1-Click Copy WhatsApp Message'}
                </span>
              </button>

              {/* Test Hosted Checkout Directly */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <Link
                  href={`/pay/${createdLink.id}`}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-brand-500 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-brand-500" />
                  <span>Preview Checkout Screen</span>
                </Link>

                <button
                  onClick={resetForm}
                  className="py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-medium"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
