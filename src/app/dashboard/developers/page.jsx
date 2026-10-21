'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Code2,
  Key,
  Webhook,
  Percent,
  Terminal,
  Copy,
  Check,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const SDK_EXAMPLES = {
  nodejs: `// Install: npm install @agilepay/sdk
import { AgilePay } from '@agilepay/sdk';

const checkout = new AgilePay({ apiKey: process.env.AGILEPAY_KEY });
const session = await checkout.charge({
  amount: 50.00,
  currency: 'USD',
  channel: 'momo', // Auto-routes to local MTN/Telecel MoMo
  recipient: '+233248192041'
});`,

  python: `# Install: pip install agilepay
from agilepay import AgilePay
import os

client = AgilePay(api_key=os.environ.get("AGILEPAY_KEY"))
charge = client.charges.create(
    amount=50.00,
    currency="USD",
    channel="momo",
    payout_to="+233248192041"
)`,

  react: `// Install: npm install @agilepay/react
import { useAgileCheckout } from '@agilepay/react';

export function CheckoutButton() {
  const { openCheckout } = useAgileCheckout();

  return (
    <button onClick={() => openCheckout({ amount: 50, currency: 'USD' })}>
      Instant Checkout (MoMo & Card)
    </button>
  );
}`,
};

export default function DeveloperPortalPage() {
  const {
    apiKeys,
    createApiKey,
    deleteApiKey,
    partnerFee,
    setPartnerFee,
    webhookConfig,
    setWebhookConfig,
    webhookLogs,
    isSandbox,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState('keys'); // 'keys' | 'partner' | 'webhooks' | 'logs'
  const [activeSdkTab, setActiveSdkTab] = useState('nodejs');
  const [copiedSdk, setCopiedSdk] = useState(false);

  // Key creation state
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [visibleKeyId, setVisibleKeyId] = useState(null);
  const [copiedKeyId, setCopiedKeyId] = useState(null);

  // Partner Fee Form
  const [feeRate, setFeeRate] = useState(partnerFee.percentage.toString());
  const [isSavingFee, setIsSavingFee] = useState(false);

  // Webhook State
  const [webhookUrl, setWebhookUrl] = useState(webhookConfig.url);
  const [selectedEvents, setSelectedEvents] = useState(webhookConfig.events);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // Expanded log accordion
  const [expandedLogId, setExpandedLogId] = useState(webhookLogs[0]?.id || null);

  const copySdkSnippet = () => {
    navigator.clipboard.writeText(SDK_EXAMPLES[activeSdkTab]);
    setCopiedSdk(true);
    showToast('SDK integration snippet copied');
    setTimeout(() => setCopiedSdk(false), 2000);
  };

  const handleCopyKey = (keyItem) => {
    navigator.clipboard.writeText(keyItem.fullKey);
    setCopiedKeyId(keyItem.id);
    showToast(`API Key "${keyItem.name}" copied!`);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCreateKey = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    createApiKey(newKeyName);
    setNewKeyName('');
    setShowKeyModal(false);
  };

  const handleSavePartnerFee = (e) => {
    e.preventDefault();
    setIsSavingFee(true);
    const newId = `pfee_agile_v2_${Math.floor(100000 + Math.random() * 900000)}`;
    setPartnerFee({
      percentage: Number(feeRate),
      partnerFeeId: newId,
    });
    setTimeout(() => {
      setIsSavingFee(false);
      showToast(`Partner commission updated to ${feeRate}%! Fee ID: ${newId}`);
    }, 400);
  };

  const handleSaveWebhooks = (e) => {
    e.preventDefault();
    setWebhookConfig({
      ...webhookConfig,
      url: webhookUrl,
      events: selectedEvents,
    });
    showToast('Webhook endpoint settings updated successfully');
  };

  const toggleEventCheckbox = (eventName) => {
    if (selectedEvents.includes(eventName)) {
      setSelectedEvents(selectedEvents.filter((ev) => ev !== eventName));
    } else {
      setSelectedEvents([...selectedEvents, eventName]);
    }
  };

  const handleSendTestWebhook = () => {
    setIsTestingWebhook(true);
    setTimeout(() => {
      setIsTestingWebhook(false);
      showToast('Webhook ping sent: 200 OK (114ms)');
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Code2 className="w-7 h-7 text-brand-500" />
            <span>Developer Portal & SDK Rails</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build on Base network USDC settlement, instant MoMo off-ramps, and drop-in SDKs
          </p>
        </div>

        <a
          href="https://docs.agilepay.io"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
        >
          <span>Read Full API Docs</span>
          <ExternalLink className="w-3.5 h-3.5 text-brand-500" />
        </a>
      </div>

      {/* HIGHLIGHT BOX: "Integrate in 3 lines of code" */}
      <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-950/40 via-slate-950 to-indigo-950/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fast Track Integration</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Integrate in 3 lines of code
            </h2>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Accept international credit cards and crypto, settle immediately in Ghanaian Cedis or
              local MoMo. Works smoothly with Node.js, Python, or React.
            </p>
          </div>

          {/* Copyable SDK snippet box */}
          <div className="w-full lg:w-[480px] rounded-xl bg-[#090D15] border border-slate-800 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-[#0F1422] border-b border-slate-800 text-xs">
              <div className="flex items-center gap-1">
                {['nodejs', 'python', 'react'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveSdkTab(lang)}
                    className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                      activeSdkTab === lang
                        ? 'bg-brand-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'nodejs' ? 'Node.js' : lang === 'python' ? 'Python' : 'React SDK'}
                  </button>
                ))}
              </div>

              <button
                onClick={copySdkSnippet}
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 px-2 py-1 rounded"
              >
                {copiedSdk ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSdk ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              <code>{SDK_EXAMPLES[activeSdkTab]}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Main Tabbed Interface */}
      <div className="bg-white dark:bg-[#0F1424] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {[
            { id: 'keys', label: 'API Keys', icon: Key },
            { id: 'partner', label: 'Partner Fees', icon: Percent },
            { id: 'webhooks', label: 'Webhooks', icon: Webhook },
            { id: 'logs', label: 'Webhook Logs / Inspector', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 bg-brand-50/30 dark:bg-brand-950/20'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: API Keys */}
        {activeTab === 'keys' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Secret Tokens & API Keys
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Use these keys to authenticate SDK calls. Secret keys can charge and initiate payouts.
                </p>
              </div>

              <button
                onClick={() => setShowKeyModal(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 self-start shadow-glow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create New Key</span>
              </button>
            </div>

            {/* Keys Table */}
            <div className="space-y-3">
              {apiKeys.map((keyItem) => {
                const isVisible = visibleKeyId === keyItem.id;
                const isCopied = copiedKeyId === keyItem.id;
                return (
                  <div
                    key={keyItem.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {keyItem.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            keyItem.mode === 'live'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {keyItem.mode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {isVisible
                            ? keyItem.fullKey
                            : `${keyItem.prefix}•••••••••••••xYs8`}
                        </span>
                        <button
                          onClick={() =>
                            setVisibleKeyId(isVisible ? null : keyItem.id)
                          }
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                          title={isVisible ? 'Hide token' : 'Show token'}
                        >
                          {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Created: {keyItem.created} · Last used: {keyItem.lastUsed}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleCopyKey(keyItem)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied' : 'Copy Key'}</span>
                      </button>

                      <button
                        onClick={() => deleteApiKey(keyItem.id)}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Partner Fees */}
        {activeTab === 'partner' && (
          <div className="p-6 sm:p-8 max-w-2xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Platform Commission & Partner Split
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Monetize your SaaS or marketplace by automatically charging a percentage fee on every
                transaction before funds settle to connected merchants.
              </p>
            </div>

            <form onSubmit={handleSavePartnerFee} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Commission Percentage (%)
                </label>
                <div className="relative w-48">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={feeRate}
                    onChange={(e) => setFeeRate(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    %
                  </span>
                </div>
              </div>

              {/* Generated Partner Fee ID */}
              <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-500/20 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Active Partner Fee Identifier
                </span>
                <div className="flex items-center justify-between font-mono text-xs bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-brand-500/30">
                  <span className="text-slate-800 dark:text-slate-200 font-bold">
                    {partnerFee.partnerFeeId}
                  </span>
                  <span className="text-emerald-500 font-semibold">{partnerFee.percentage}% Flat</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pass this identifier in your SDK charge payload: <code className="text-brand-500">partner_fee_id: &quot;{partnerFee.partnerFeeId}&quot;</code>
                </p>
              </div>

              {/* Example calculation preview */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Live Example Calculation:
                </p>
                <div className="flex justify-between text-slate-500">
                  <span>Customer Pays:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">$100.00 USD</span>
                </div>
                <div className="flex justify-between text-brand-600 dark:text-brand-400">
                  <span>Your Platform Split ({feeRate}%):</span>
                  <span className="font-bold">+${((100 * Number(feeRate || 0)) / 100).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Merchant Receives (MoMo):</span>
                  <span className="font-bold">${(100 - (100 * Number(feeRate || 0)) / 100).toFixed(2)} USD</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingFee}
                className="py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-glow-sm"
              >
                {isSavingFee ? 'Saving...' : 'Update Commission & Generate Fee ID'}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Webhooks */}
        {activeTab === 'webhooks' && (
          <div className="p-6 sm:p-8 max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Webhook Endpoints
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Receive cryptographically signed HTTP POST notifications for payment lifecycle events
                </p>
              </div>
              <button
                onClick={handleSendTestWebhook}
                disabled={isTestingWebhook}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-brand-500" />
                <span>{isTestingWebhook ? 'Sending...' : 'Send Test Ping'}</span>
              </button>
            </div>

            <form onSubmit={handleSaveWebhooks} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Webhook URL *
                </label>
                <input
                  type="url"
                  required
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://api.merchant.com/agilepay-webhook"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Subscribed Events *
                </label>
                <div className="space-y-2">
                  {[
                    {
                      name: 'payment.success',
                      desc: 'Triggered immediately when customer MoMo or Card charge succeeds',
                    },
                    {
                      name: 'offramp.completed',
                      desc: 'Triggered when Base USDC is converted and paid into merchant bank/MoMo',
                    },
                    {
                      name: 'customer.created',
                      desc: 'Triggered when a new buyer profile is recorded',
                    },
                  ].map((evt) => (
                    <label
                      key={evt.name}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(evt.name)}
                        onChange={() => toggleEventCheckbox(evt.name)}
                        className="mt-1 rounded text-brand-600 focus:ring-brand-500"
                      />
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {evt.name}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{evt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Webhook Secret Key */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Webhook Signing Secret
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="font-mono text-xs text-slate-500 truncate flex-1">
                    {webhookConfig.secret}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(webhookConfig.secret);
                      showToast('Webhook secret copied to clipboard');
                    }}
                    className="text-xs font-semibold text-brand-500 hover:text-brand-400 px-2 py-1"
                  >
                    Copy Secret
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-glow-sm"
              >
                Save Webhook Configuration
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Webhook Logs / Inspector Table */}
        {activeTab === 'logs' && (
          <div className="p-6 sm:p-8 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Webhook Logs & Payload Inspector
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect real HTTP deliveries, response latency, and JSON request payloads
              </p>
            </div>

            <div className="space-y-3">
              {webhookLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div
                    key={log.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/30"
                  >
                    <div
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {log.statusText}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {log.event}
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          Duration: {log.duration}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{log.timestamp}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Expandable Payload Preview Accordion */}
                    {isExpanded && (
                      <div className="p-4 bg-[#0A0D15] border-t border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                        <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-800 text-[11px] text-slate-400">
                          <span>HTTP POST payload delivered to: {webhookConfig.url}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(log.payload, null, 2));
                              showToast('JSON payload copied to clipboard');
                            }}
                            className="text-brand-400 hover:text-white"
                          >
                            Copy JSON
                          </button>
                        </div>
                        <pre className="text-emerald-400 leading-relaxed">
                          <code>{JSON.stringify(log.payload, null, 2)}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowKeyModal(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#0E1321] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create New API Key
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate a new token for {isSandbox ? 'Sandbox' : 'Production'} integration.
            </p>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Key Name / Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile App Backend SDK"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg shadow-glow-sm"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
