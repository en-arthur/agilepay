'use client'

import React, { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { apiPost } from '@/lib/api'
import {
  Code2, Key, Webhook, Terminal, Copy, Check, Plus,
  Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Send, Sparkles, ExternalLink,
} from 'lucide-react'

const SDK_EXAMPLES = {
  nodejs: `// Install: npm install @agilepay/sdk
import { AgilePay } from '@agilepay/sdk';

const client = new AgilePay({ apiKey: process.env.AGILEPAY_KEY });
const charge = await client.charges.create({
  amount: 50.00,
  destination_id: 'YOUR_DESTINATION_ID',
  description: 'Invoice #1042',
});`,

  python: `# Install: pip install agilepay
import agilepay, os

client = agilepay.AgilePay(api_key=os.environ.get("AGILEPAY_KEY"))
charge = client.charges.create(
    amount=50.00,
    destination_id="YOUR_DESTINATION_ID",
    description="Invoice #1042",
)
print(charge["id"])   # chg_xxxxxxxxxxxxxxxxxxxxxx`,

  curl: `curl -X POST https://api.agilepay.io/v1/charges \\
  -H "Authorization: Bearer sk_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 50.00,
    "destination_id": "YOUR_DESTINATION_ID",
    "description": "Invoice #1042"
  }'`,
}

export default function DeveloperPortalPage() {
  const { apiKeys, createApiKey, deleteApiKey,
          webhookConfig, setWebhookConfig, webhookLogs, isSandbox, showToast,
          loadingApiKeys } = useApp()
  const { getToken } = useAuth()

  const [activeTab, setActiveTab]       = useState('keys')
  const [activeSdkTab, setActiveSdkTab] = useState('python')
  const [copiedSdk, setCopiedSdk]       = useState(false)

  // Key creation
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [newKeyName, setNewKeyName]     = useState('')
  const [creatingKey, setCreatingKey]   = useState(false)
  const [visibleKeyId, setVisibleKeyId] = useState(null)
  const [copiedKeyId, setCopiedKeyId]   = useState(null)
  const [newKeyPlain, setNewKeyPlain]   = useState(null)  // raw key shown once

  // Webhook
  const [webhookUrl, setWebhookUrl]           = useState(webhookConfig.url)
  const [selectedEvents, setSelectedEvents]   = useState(webhookConfig.events)
  const [isTestingWebhook, setIsTestingWebhook] = useState(false)
  const [expandedLogId, setExpandedLogId]     = useState(webhookLogs[0]?.id || null)

  const copySdkSnippet = () => {
    navigator.clipboard.writeText(SDK_EXAMPLES[activeSdkTab])
    setCopiedSdk(true)
    showToast('SDK snippet copied')
    setTimeout(() => setCopiedSdk(false), 2000)
  }

  const handleCopyKey = (keyItem) => {
    const value = keyItem.fullKey || `${keyItem.prefix}••••${keyItem.last_four}`
    navigator.clipboard.writeText(value)
    setCopiedKeyId(keyItem.id)
    showToast(`"${keyItem.name}" copied`)
    setTimeout(() => setCopiedKeyId(null), 2000)
  }

  const handleCreateKey = async (e) => {
    e.preventDefault()
    if (!newKeyName.trim()) return
    setCreatingKey(true)
    try {
      const created = await createApiKey(newKeyName)
      if (created?.fullKey) {
        setNewKeyPlain(created.fullKey)
      }
      setNewKeyName('')
      setShowKeyModal(false)
    } finally {
      setCreatingKey(false)
    }
  }

  const handleSaveWebhooks = (e) => {
    e.preventDefault()
    setWebhookConfig({ ...webhookConfig, url: webhookUrl, events: selectedEvents })
    showToast('Webhook settings saved')
  }

  const toggleEvent = (ev) =>
    setSelectedEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
    )

  const handleSendTestWebhook = async () => {
    if (!webhookUrl) { showToast('Set a webhook URL first', 'error'); return }
    setIsTestingWebhook(true)
    try {
      const token = getToken()
      await apiPost('/v1/webhooks/test', { url: webhookUrl }, token).catch(() => {})
      showToast('Test webhook sent')
    } finally {
      setIsTestingWebhook(false)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Code2 className="w-7 h-7 text-brand-500" />
            <span>Developer Portal & SDK Rails</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build on Base network USDC settlement with instant off-ramps
          </p>
        </div>
        <a href="https://docs.agilepay.io" target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
          <span>API Docs</span>
          <ExternalLink className="w-3.5 h-3.5 text-brand-500" />
        </a>
      </div>

      {/* "Raw key shown once" notice */}
      {newKeyPlain && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 space-y-3">
          <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
            ⚠ Copy this key now — it will never be shown again
          </p>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-amber-300/50 dark:border-amber-700/50 rounded-xl px-4 py-3">
            <code className="font-mono text-xs text-slate-800 dark:text-slate-200 flex-1 break-all">
              {newKeyPlain}
            </code>
            <button
              onClick={() => { navigator.clipboard.writeText(newKeyPlain); showToast('Key copied!') }}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold flex items-center gap-1.5">
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
          </div>
          <button onClick={() => setNewKeyPlain(null)}
            className="text-xs text-amber-600 dark:text-amber-400 underline">
            I've saved it — dismiss
          </button>
        </div>
      )}

      {/* SDK Highlight */}
      <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-950/40 via-slate-950 to-indigo-950/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Fast Track Integration
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Integrate in minutes</h2>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Accept USD from anywhere, settle instantly to local bank accounts via SWIFT, SEPA, ACH, FPS, PIX, or SPEI.
            </p>
          </div>

          <div className="w-full lg:w-[500px] rounded-xl bg-[#090D15] border border-slate-800 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-[#0F1422] border-b border-slate-800 text-xs">
              <div className="flex items-center gap-1">
                {['python', 'nodejs', 'curl'].map((lang) => (
                  <button key={lang} onClick={() => setActiveSdkTab(lang)}
                    className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                      activeSdkTab === lang ? 'bg-brand-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}>
                    {lang === 'nodejs' ? 'Node.js' : lang === 'python' ? 'Python' : 'cURL'}
                  </button>
                ))}
              </div>
              <button onClick={copySdkSnippet}
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 px-2 py-1 rounded">
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

      {/* Tabbed interface */}
      <div className="bg-white dark:bg-[#0F1424] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {[
            { id: 'keys',    label: 'API Keys',           icon: Key },
            { id: 'webhooks',label: 'Webhooks',           icon: Webhook },
            { id: 'logs',    label: 'Webhook Logs',       icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 bg-brand-50/30 dark:bg-brand-950/20'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}>
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* ── Tab: API Keys ── */}
        {activeTab === 'keys' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Secret API Keys</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Use these keys to authenticate SDK calls. Never expose live keys in client-side code.
                </p>
              </div>
              <button onClick={() => setShowKeyModal(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 self-start shadow-glow-sm">
                <Plus className="w-4 h-4" />
                + Create New Key
              </button>
            </div>

            {loadingApiKeys ? (
              <div className="space-y-3">
                {[1,2].map(i => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse bg-slate-100 dark:bg-slate-900 h-20" />
                ))}
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="py-12 text-center">
                <Key className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No API keys yet</p>
                <p className="text-xs text-slate-400 mt-1">Create your first key to start integrating</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((keyItem) => {
                  const isVisible = visibleKeyId === keyItem.id
                  const isCopied  = copiedKeyId  === keyItem.id
                  return (
                    <div key={keyItem.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{keyItem.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            keyItem.mode === 'live'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}>{keyItem.mode}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                            {isVisible && keyItem.fullKey
                              ? keyItem.fullKey
                              : `${keyItem.prefix}••••••••••••${keyItem.last_four}`}
                          </span>
                          {keyItem.fullKey && (
                            <button onClick={() => setVisibleKeyId(isVisible ? null : keyItem.id)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Created: {keyItem.created} · Last used: {keyItem.lastUsed}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button onClick={() => handleCopyKey(keyItem)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors">
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button onClick={() => deleteApiKey(keyItem.id)}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Revoke">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Webhooks ── */}
        {activeTab === 'webhooks' && (
          <div className="p-6 sm:p-8 max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Webhook Endpoints</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Receive HMAC-SHA256 signed POST notifications for payment events.
                </p>
              </div>
              <button onClick={handleSendTestWebhook} disabled={isTestingWebhook}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-60">
                <Send className="w-3.5 h-3.5 text-brand-500" />
                {isTestingWebhook ? 'Sending…' : 'Send Test Ping'}
              </button>
            </div>

            <form onSubmit={handleSaveWebhooks} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Webhook URL *
                </label>
                <input type="url" required value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://api.yourapp.com/webhooks/agilepay"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Subscribed Events
                </label>
                <div className="space-y-2">
                  {[
                    { name: 'offramp.success',  desc: 'Payment settled to bank / MoMo' },
                    { name: 'offramp.failed',   desc: 'Payment failed to settle' },
                    { name: 'destinations.approved', desc: 'Bank destination approved by Lumx' },
                    { name: 'customer.verification.approved', desc: 'KYC verification approved' },
                  ].map((evt) => (
                    <label key={evt.name}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700">
                      <input type="checkbox" checked={selectedEvents.includes(evt.name)}
                        onChange={() => toggleEvent(evt.name)}
                        className="mt-1 rounded text-brand-600 focus:ring-brand-500"
                      />
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{evt.name}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{evt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit"
                className="py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-glow-sm">
                Save Webhook Config
              </button>
            </form>
          </div>
        )}

        {/* ── Tab: Webhook Logs ── */}
        {activeTab === 'logs' && (
          <div className="p-6 sm:p-8 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Webhook Logs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect inbound Lumx webhook deliveries — signature, payload, and status
              </p>
            </div>

            {webhookLogs.length === 0 ? (
              <div className="py-12 text-center">
                <Terminal className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No webhook events yet</p>
                <p className="text-xs text-slate-400 mt-1">Events from Lumx will appear here once live payments start</p>
              </div>
            ) : (
              <div className="space-y-3">
                {webhookLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id
                  return (
                    <div key={log.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
                      <div onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {log.response_status || 200} OK
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            {log.event_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{log.created_at ? new Date(log.created_at).toLocaleString() : log.timestamp}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 bg-[#0A0D15] border-t border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                          <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-800 text-[11px] text-slate-400">
                            <span>Raw payload</span>
                            <button
                              onClick={() => { navigator.clipboard.writeText(JSON.stringify(log.raw_payload, null, 2)); showToast('Payload copied') }}
                              className="text-brand-400 hover:text-white">Copy JSON</button>
                          </div>
                          <pre className="text-emerald-400 leading-relaxed">
                            <code>{JSON.stringify(log.raw_payload || log.payload, null, 2)}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowKeyModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#0E1321] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New API Key</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generating a {isSandbox ? 'Sandbox (TEST)' : 'Production (LIVE)'} key.
            </p>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Key Name *
                </label>
                <input type="text" required
                  placeholder="e.g. Mobile App Backend"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={creatingKey}
                  className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg shadow-glow-sm disabled:opacity-60">
                  {creatingKey ? 'Creating…' : 'Generate Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
