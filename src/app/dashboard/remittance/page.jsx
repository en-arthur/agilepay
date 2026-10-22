'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import {
  Wallet, Plus, ArrowUpRight, Send, Users, RefreshCw, DollarSign,
  CheckCircle2, Clock, AlertCircle, ChevronDown, X, Lock, Zap,
  ArrowRight, Check,
} from 'lucide-react'

const TABS = [
  { id: 'deposit',    label: 'Fund Wallet',   icon: Wallet },
  { id: 'recipients', label: 'Recipients',    icon: Users },
  { id: 'send',       label: 'Send Money',    icon: Send },
  { id: 'history',    label: 'History',       icon: ArrowUpRight },
]

export default function RemittancePage() {
  const { merchant } = useAuth()
  const {
    transactions, loadingTransactions, loadTransactions,
    submitRemittanceKyc, createDeposit, addRecipient, getRecipients,
    lockRate, sendRemittance, getRemittanceHistory, showToast,
  } = useApp()

  const [activeTab, setActiveTab] = useState('deposit')

  // KYC gate
  const kycApproved = merchant?.kyc_status === 'APPROVED'
  const kycLink     = merchant?.kyc_sumsub_link

  // ── Recipients state ──────────────────────────────────────────────────────
  const [recipients, setRecipients]         = useState([])
  const [loadingRecipients, setLoadingRecipients] = useState(false)

  const refreshRecipients = useCallback(async () => {
    setLoadingRecipients(true)
    try {
      const data = await getRecipients()
      setRecipients(Array.isArray(data) ? data : [])
    } catch { /* silent */ }
    finally { setLoadingRecipients(false) }
  }, [getRecipients])

  useEffect(() => {
    if (activeTab === 'recipients' || activeTab === 'send') refreshRecipients()
  }, [activeTab, refreshRecipients])

  // ── Remittance history ────────────────────────────────────────────────────
  const [history, setHistory]       = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const refreshHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const data = await getRemittanceHistory(30)
      setHistory(Array.isArray(data) ? data : [])
    } catch { /* silent */ }
    finally { setLoadingHistory(false) }
  }, [getRemittanceHistory])

  useEffect(() => {
    if (activeTab === 'history') refreshHistory()
  }, [activeTab, refreshHistory])

  // ── Deposit form ──────────────────────────────────────────────────────────
  const [depositAmount,   setDepositAmount]   = useState('')
  const [depositCurrency, setDepositCurrency] = useState('USD')
  const [depositRail,     setDepositRail]     = useState('ACH')
  const [depositLoading,  setDepositLoading]  = useState(false)
  const [depositResult,   setDepositResult]   = useState(null)
  const [depositError,    setDepositError]    = useState('')

  const handleDeposit = async (e) => {
    e.preventDefault()
    setDepositLoading(true); setDepositError('')
    try {
      const res = await createDeposit({ amount: depositAmount, source_currency: depositCurrency, rail: depositRail })
      setDepositResult(res)
      showToast('Deposit initiated — send funds to the instructions below')
    } catch (err) {
      setDepositError(err.message || 'Failed to initiate deposit')
    } finally {
      setDepositLoading(false)
    }
  }

  // ── Add recipient form ────────────────────────────────────────────────────
  const [showRecipientModal, setShowRecipientModal] = useState(false)
  const [recipientForm, setRecipientForm] = useState({
    full_name: '', email: '', phone: '', relationship: 'RELATIVE',
    country: 'US', identifier: {},
  })
  const [recipientRail, setRecipientRail] = useState('ACH')
  const [savingRecipient, setSavingRecipient] = useState(false)
  const [recipientError, setRecipientError]  = useState('')

  const COUNTRY_RAIL = { BR:'PIX',MX:'SPEI',DE:'SEPA',FR:'SEPA',ES:'SEPA',IT:'SEPA',NL:'SEPA',PT:'SEPA',AT:'SEPA',BE:'SEPA',US:'ACH',GB:'FPS' }
  const RAIL_FIELDS  = {
    PIX:   [['keyType','Key Type','EMAIL | CPF | PHONE | RANDOM'],['keyValue','Key Value','value']],
    SPEI:  [['clabe','CLABE (18 digits)','000000000000000000']],
    SEPA:  [['iban','IBAN','DE89370400440532013000'],['bic','BIC','DEUTDEDB']],
    ACH:   [['routingNumber','Routing Number','021000021'],['accountNumber','Account Number','000123456789'],['accountType','Account Type','CHECKING | SAVINGS']],
    FPS:   [['sortCode','Sort Code','20-00-00'],['accountNumber','Account Number (8 digits)','55779911']],
    SWIFT: [['accountNumber','Account Number',''],['swiftCode','SWIFT / BIC',''],['bankName','Bank Name',''],['bankAddress','Bank Address (optional)','']],
  }

  const handleRecipientCountry = (c) => {
    setRecipientForm(p => ({ ...p, country: c, identifier: {} }))
    setRecipientRail(COUNTRY_RAIL[c] || 'SWIFT')
  }

  const handleAddRecipient = async (e) => {
    e.preventDefault()
    setSavingRecipient(true); setRecipientError('')
    try {
      await addRecipient({ ...recipientForm, country: recipientForm.country })
      setShowRecipientModal(false)
      setRecipientForm({ full_name:'', email:'', phone:'', relationship:'RELATIVE', country:'US', identifier:{} })
      await refreshRecipients()
      showToast('Recipient added — awaiting Lumx approval (up to 24h)')
    } catch (err) {
      setRecipientError(err.message || 'Failed to add recipient')
    } finally {
      setSavingRecipient(false)
    }
  }

  // ── Send money form ───────────────────────────────────────────────────────
  const [selectedRecipientId, setSelectedRecipientId] = useState('')
  const [sendAmount,  setSendAmount]  = useState('')
  const [lockedRate,  setLockedRate]  = useState(null)
  const [lockingRate, setLockingRate] = useState(false)
  const [sending,     setSending]     = useState(false)
  const [sendResult,  setSendResult]  = useState(null)
  const [sendError,   setSendError]   = useState('')

  const handleLockRate = async () => {
    if (!selectedRecipientId || !sendAmount) {
      setSendError('Select a recipient and enter an amount first'); return
    }
    setLockingRate(true); setSendError(''); setLockedRate(null)
    try {
      const rate = await lockRate({ recipient_id: selectedRecipientId, amount: sendAmount })
      setLockedRate(rate)
    } catch (err) {
      setSendError(err.message || 'Could not lock exchange rate')
    } finally {
      setLockingRate(false)
    }
  }

  const handleSend = async () => {
    if (!lockedRate) return
    setSending(true); setSendError('')
    try {
      const res = await sendRemittance({
        recipient_id:     selectedRecipientId,
        exchange_rate_id: lockedRate.exchange_rate_id,
        amount:           sendAmount,
      })
      setSendResult(res)
      setLockedRate(null); setSendAmount(''); setSelectedRecipientId('')
      showToast('Remittance sent successfully!')
      await refreshHistory()
    } catch (err) {
      setSendError(err.message || 'Remittance failed')
    } finally {
      setSending(false)
    }
  }

  const approvedRecipients = recipients.filter(r => r.status === 'APPROVED')

  // ── KYC gate UI ───────────────────────────────────────────────────────────
  if (!kycApproved) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-brand-500" /> Remittance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Send money to family and friends worldwide</p>
        </div>
        <div className="p-8 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-center space-y-4">
          <Lock className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">KYC Verification Required</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Complete your identity verification to unlock remittance features. This is required by Lumx to comply with financial regulations.
          </p>
          {merchant?.kyc_status === 'PENDING' ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-semibold">
              <Clock className="w-4 h-4" /> KYC review in progress — typically 1 business day
            </div>
          ) : kycLink ? (
            <a href={kycLink} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-glow-sm transition-all">
              <ArrowRight className="w-4 h-4" /> Complete KYC Verification
            </a>
          ) : (
            <p className="text-xs text-slate-400">Check Settings → KYC & Verification for your verification link.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-brand-500" /> Remittance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fund your wallet, add recipients, and send money globally
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4" /> KYC Approved
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}>
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Fund Wallet ── */}
      {activeTab === 'deposit' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Fund Your Wallet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Send USD from your bank to your Lumx USDC wallet. Funds are credited once received.
            </p>
          </div>

          {depositResult ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Deposit Initiated</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">Charge ID: {depositResult.charge_id}</p>
                </div>
              </div>
              {depositResult.payment_instructions && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <p className="font-bold text-slate-700 dark:text-slate-300">Payment Instructions:</p>
                  {Object.entries(depositResult.payment_instructions).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-400 capitalize">{k.replace(/_/g, ' ')}:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setDepositResult(null)}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Make another deposit
              </button>
            </div>
          ) : (
            <form onSubmit={handleDeposit} className="space-y-4 max-w-sm">
              {depositError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {depositError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Amount *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input type="number" step="0.01" min="1" required
                    value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                    placeholder="500.00"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Currency</label>
                <select value={depositCurrency} onChange={e => setDepositCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Rail</label>
                <select value={depositRail} onChange={e => setDepositRail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="ACH">ACH — US Bank Transfer (same day)</option>
                  <option value="SWIFT">SWIFT — International Wire (1–3 days)</option>
                  <option value="SEPA">SEPA — European Transfer (instant)</option>
                </select>
              </div>
              <button type="submit" disabled={depositLoading}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glow-sm transition-all disabled:opacity-60">
                <Wallet className="w-4 h-4" />
                {depositLoading ? 'Initiating…' : 'Get Payment Instructions'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── Recipients ── */}
      {activeTab === 'recipients' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recipients</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Family members or friends you can send money to. Each must be approved by Lumx.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={refreshRecipients}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                <RefreshCw className={`w-4 h-4 text-slate-500 ${loadingRecipients ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setShowRecipientModal(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-glow-sm">
                <Plus className="w-4 h-4" /> Add Recipient
              </button>
            </div>
          </div>

          {loadingRecipients ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
            </div>
          ) : recipients.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No recipients yet</p>
              <p className="text-xs text-slate-400 mt-1">Add a family member or friend to get started</p>
              <button onClick={() => setShowRecipientModal(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Recipient
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recipients.map(r => (
                <div key={r.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-sm flex items-center justify-center shrink-0">
                      {r.full_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{r.full_name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {r.rail} · {r.currency} · {r.country}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20">
                          {r.relationship?.toLowerCase()}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          r.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}>{r.status}</span>
                      </div>
                      {r.email && <p className="text-[11px] text-slate-400 mt-0.5">{r.email}</p>}
                    </div>
                  </div>
                  {r.status === 'APPROVED' && (
                    <button onClick={() => { setSelectedRecipientId(r.id); setActiveTab('send') }}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shrink-0 flex items-center gap-1.5">
                      <Send className="w-3 h-3" /> Send
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Recipient Modal */}
          {showRecipientModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowRecipientModal(false); setRecipientError('') }} />
              <div className="relative w-full max-w-lg bg-white dark:bg-[#0E1321] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Recipient</h3>
                  <button onClick={() => { setShowRecipientModal(false); setRecipientError('') }} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {recipientError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {recipientError}
                  </div>
                )}
                <form onSubmit={handleAddRecipient} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
                      <input type="text" required value={recipientForm.full_name}
                        onChange={e => setRecipientForm(p => ({ ...p, full_name: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Relationship *</label>
                      <select value={recipientForm.relationship}
                        onChange={e => setRecipientForm(p => ({ ...p, relationship: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                        <option value="RELATIVE">Relative</option>
                        <option value="FRIEND">Friend</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Email</label>
                      <input type="email" value={recipientForm.email}
                        onChange={e => setRecipientForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Phone</label>
                      <input type="text" value={recipientForm.phone}
                        onChange={e => setRecipientForm(p => ({ ...p, phone: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Destination Country *</label>
                    <select value={recipientForm.country} onChange={e => handleRecipientCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                      {[['US','🇺🇸 United States (ACH)'],['GB','🇬🇧 United Kingdom (FPS)'],['DE','🇩🇪 Germany (SEPA)'],['FR','🇫🇷 France (SEPA)'],['BR','🇧🇷 Brazil (PIX)'],['MX','🇲🇽 Mexico (SPEI)'],['GH','🇬🇭 Ghana (SWIFT)'],['NG','🇳🇬 Nigeria (SWIFT)'],['KE','🇰🇪 Kenya (SWIFT)'],['OTHER','🌍 Other (SWIFT)']].map(([c, l]) => (
                        <option key={c} value={c}>{l}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-brand-600 dark:text-brand-400 mt-1 font-semibold">Rail: {recipientRail}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Bank Details *</label>
                    {(RAIL_FIELDS[recipientRail] || RAIL_FIELDS.SWIFT).map(([key, label, placeholder]) => (
                      <div key={key}>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">{label}</label>
                        <input type="text" placeholder={placeholder}
                          value={recipientForm.identifier[key] || ''}
                          onChange={e => setRecipientForm(p => ({ ...p, identifier: { ...p.identifier, [key]: e.target.value } }))}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => { setShowRecipientModal(false); setRecipientError('') }}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                      Cancel
                    </button>
                    <button type="submit" disabled={savingRecipient}
                      className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-glow-sm disabled:opacity-60">
                      {savingRecipient ? 'Adding…' : 'Add Recipient'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Send Money ── */}
      {activeTab === 'send' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-lg">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Send Money</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Lock a live exchange rate, then confirm. Your wallet is debited in USDC.
            </p>
          </div>

          {sendResult ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                <Check className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Remittance Sent!</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">Charge ID: {sendResult.charge_id}</p>
                </div>
              </div>
              <button onClick={() => setSendResult(null)}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Send another
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sendError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {sendError}
                </div>
              )}

              {approvedRecipients.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No approved recipients</p>
                  <p className="text-xs text-slate-400 mt-1">Add and wait for approval in the Recipients tab</p>
                  <button onClick={() => setActiveTab('recipients')}
                    className="mt-3 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                    Go to Recipients →
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Recipient *</label>
                    <select value={selectedRecipientId} onChange={e => { setSelectedRecipientId(e.target.value); setLockedRate(null) }}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                      <option value="">— Select a recipient —</option>
                      {approvedRecipients.map(r => (
                        <option key={r.id} value={r.id}>{r.full_name} ({r.currency} · {r.country})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Amount (USDC) *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                      <input type="number" step="0.01" min="1"
                        value={sendAmount} onChange={e => { setSendAmount(e.target.value); setLockedRate(null) }}
                        placeholder="100.00"
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  {!lockedRate ? (
                    <button onClick={handleLockRate} disabled={lockingRate || !selectedRecipientId || !sendAmount}
                      className="w-full py-3 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                      <Lock className="w-4 h-4" />
                      {lockingRate ? 'Fetching rate…' : 'Get Live Exchange Rate'}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-500/30 space-y-2 text-xs">
                        <p className="font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" /> Rate Locked — expires soon
                        </p>
                        <div className="flex justify-between">
                          <span className="text-slate-500">You send:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{sendAmount} USDC</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Recipient gets:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {lockedRate.final_target_amount} {lockedRate.target_currency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Rate:</span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            1 USDC = {lockedRate.exchange_rate} {lockedRate.target_currency}
                          </span>
                        </div>
                      </div>
                      <button onClick={handleSend} disabled={sending}
                        className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glow transition-all disabled:opacity-60">
                        <Send className="w-4 h-4" />
                        {sending ? 'Sending…' : `Confirm & Send ${sendAmount} USDC`}
                      </button>
                      <button onClick={() => setLockedRate(null)} className="w-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 py-1">
                        Cancel — get a new rate
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── History ── */}
      {activeTab === 'history' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Remittance History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All your deposits and sends</p>
            </div>
            <button onClick={refreshHistory}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
              <RefreshCw className={`w-4 h-4 text-slate-500 ${loadingHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingHistory ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center">
              <ArrowUpRight className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No history yet</p>
              <p className="text-xs text-slate-400 mt-1">Fund your wallet and send your first remittance</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 text-left">Charge ID</th>
                    <th className="pb-3 text-left">Type</th>
                    <th className="pb-3 text-left">Amount</th>
                    <th className="pb-3 text-left">Status</th>
                    <th className="pb-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {history.map(tx => (
                    <tr key={tx.charge_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-mono text-[11px] text-slate-500">{tx.charge_id}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${tx.type === 'ON_RAMP' ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400' : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'}`}>
                          {tx.type === 'ON_RAMP' ? 'Deposit' : 'Send'}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">
                        {tx.source_amount} {tx.source_currency}
                        {tx.target_currency && <span className="text-[11px] text-slate-400 font-normal ml-1">→ {tx.target_currency}</span>}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          tx.status.includes('Settled') || tx.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">{tx.created_at ? new Date(tx.created_at).toLocaleDateString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
