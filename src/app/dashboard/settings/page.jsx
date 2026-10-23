'use client'

import React, { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { apiPatch, apiGet } from '@/lib/api'
import {
  Settings, Building2, Wallet, Code2, CheckCircle2, Shield, Bell,
  Globe, Smartphone, Banknote, Coins, ChevronRight, Lock, KeyRound,
  Trash2, User, Mail, MapPin, Phone, Zap, ExternalLink, RefreshCw,
  Plus, AlertCircle, X,
} from 'lucide-react'

export default function SettingsPage() {
  const { isSandbox, setIsSandbox, showToast, accountType,
          destinations, loadingDestinations, loadDestinations,
          addDestination, removeDestination, setDefaultDestination } = useApp()
  const { merchant, getToken, fetchMerchant } = useAuth()
  const [activeSection, setActiveSection] = useState('business')
  const [savingProfile, setSavingProfile]  = useState(false)

  // ── Business profile — seeded from real merchant data ───────────────────
  const [businessName, setBusinessName] = useState('')
  const [contactName,  setContactName]  = useState('')
  const [email,        setEmail]        = useState('')
  const [phone,        setPhone]        = useState('')
  const [country,      setCountry]      = useState('GH')

  useEffect(() => {
    if (merchant) {
      setBusinessName(merchant.business_name || merchant.full_name || '')
      setContactName(merchant.full_name || '')
      setEmail(merchant.email || '')
      setPhone(merchant.phone || '')
      setCountry(merchant.country || 'GH')
    }
  }, [merchant])

  const handleSaveBusiness = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const token = getToken()
      await apiPatch('/v1/merchants/me', {
        full_name:     contactName,
        business_name: businessName,
        phone,
      }, token)
      await fetchMerchant(token)
      showToast('Business profile updated')
    } catch (err) {
      showToast(err.message || 'Failed to save profile', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  // ── KYC status ──────────────────────────────────────────────────────────
  const [kycStatus, setKycStatus] = useState(merchant?.kyc_status || 'NOT_STARTED')
  const [kycLink,   setKycLink]   = useState(null)
  const [loadingKyc, setLoadingKyc] = useState(false)

  const refreshKyc = async () => {
    setLoadingKyc(true)
    try {
      const token = getToken()
      const data = await apiGet('/v1/merchants/me/kyc', token)
      setKycStatus(data.kyc_status)
      setKycLink(data.kyc_link)
    } catch {
      /* silent */
    } finally {
      setLoadingKyc(false)
    }
  }

  useEffect(() => {
    if (merchant) {
      setKycStatus(merchant.kyc_status || 'NOT_STARTED')
    }
  }, [merchant])

  // ── Notifications (local for now) ───────────────────────────────────────
  const [notifications, setNotifications] = useState({
    paymentEmail: true, offrampEmail: true, webhookFailure: true, weeklyReport: true,
  })
  const toggleNotif = (key) => setNotifications(p => ({ ...p, [key]: !p[key] }))

  const kycBadge = {
    APPROVED:        { label: 'KYC Approved',    cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    PENDING:         { label: 'KYC Pending',     cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    NOT_STARTED:     { label: 'KYC Required',    cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
    RFI:             { label: 'Info Requested',  cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    FINAL_REJECTION: { label: 'KYC Rejected',    cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  }[kycStatus] ?? { label: kycStatus, cls: 'bg-slate-100 text-slate-500 border-slate-200' }

  const sections = [
    { id: 'business',      label: 'Business Profile',   icon: Building2 },
    { id: 'kyc',           label: 'KYC & Verification',  icon: Shield },
    { id: 'destinations',  label: 'Payout Destinations', icon: Wallet },
    { id: 'account',       label: 'Account Mode',        icon: accountType === 'developer' ? Code2 : Smartphone },
    { id: 'notifications', label: 'Notifications',       icon: Bell },
    { id: 'security',      label: 'Security',            icon: KeyRound },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-brand-500" />
            Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your profile, KYC status, account mode, and security
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <nav className="p-2 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 lg:sticky lg:top-24">
            {sections.map((s) => {
              const Icon = s.icon
              const isActive = activeSection === s.id
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  }`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                  <span className="flex-1">{s.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-9 space-y-6">

          {/* ── Business Profile ── */}
          {activeSection === 'business' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-500" /> Business Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Appears on customer checkout pages and digital receipts
                </p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-glow-sm">
                  {(businessName || 'AP').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{businessName || merchant?.full_name}</p>
                  <p className="text-xs text-slate-400">{email}</p>
                  <span className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${kycBadge.cls}`}>
                    {kycBadge.label}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveBusiness} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Business Name</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Contact Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="text" value={contactName} onChange={e => setContactName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="email" value={email} readOnly
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Email is managed via Supabase Auth</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Phone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="+233 24 000 0000"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={savingProfile}
                  className="py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-glow-sm disabled:opacity-60">
                  {savingProfile ? 'Saving…' : 'Save Profile'}
                </button>
              </form>
            </div>
          )}

          {/* ── KYC & Verification ── */}
          {activeSection === 'kyc' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-brand-500" /> KYC & Verification
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Required to activate live payments and off-ramp settlements
                  </p>
                </div>
                <button onClick={refreshKyc} disabled={loadingKyc}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <RefreshCw className={`w-4 h-4 text-slate-500 ${loadingKyc ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Status card */}
              <div className={`p-5 rounded-2xl border ${
                kycStatus === 'APPROVED'
                  ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20'
                  : kycStatus === 'PENDING'
                  ? 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20'
                  : 'border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Current Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${kycBadge.cls}`}>
                      {kycBadge.label}
                    </span>
                  </div>
                  {kycStatus === 'APPROVED' && (
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  )}
                </div>

                {kycStatus !== 'APPROVED' && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                      {kycStatus === 'PENDING'
                        ? 'Your documents are under review. This typically takes 1 business day.'
                        : kycStatus === 'RFI'
                        ? 'Additional information is required. Please complete the verification form.'
                        : 'Complete identity verification to unlock live payments and off-ramp settlement.'}
                    </p>
                    {(kycStatus === 'NOT_STARTED' || kycStatus === 'RFI') && (
                      <a
                        href={kycLink || '#'}
                        target="_blank"
                        rel="noreferrer"
                        onClick={!kycLink ? (e) => { e.preventDefault(); refreshKyc() } : undefined}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm transition-all">
                        <ExternalLink className="w-3.5 h-3.5" />
                        {kycLink ? 'Start KYC Verification' : 'Load KYC Link'}
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">What KYC unlocks:</p>
                {['Live payment processing', 'Bank & MoMo off-ramp settlement', 'Higher transaction limits', 'Partner fee engine'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Destinations ── */}
          {activeSection === 'destinations' && (
            <DestinationsSection
              destinations={destinations}
              loading={loadingDestinations}
              onRefresh={loadDestinations}
              onAdd={addDestination}
              onRemove={removeDestination}
              onSetDefault={setDefaultDestination}
              showToast={showToast}
            />
          )}

          {/* ── Account Mode ── */}
          {activeSection === 'account' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-brand-500" /> Account Type
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your account type was set at signup. Contact support to change it.
                </p>
              </div>
              <div className="p-5 rounded-2xl border border-brand-500/30 bg-brand-500/5 dark:bg-brand-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                    {accountType === 'individual' ? <Smartphone className="w-5 h-5" /> : <Code2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white capitalize">{accountType} Account</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {accountType === 'individual'
                        ? 'Remittance account'
                        : 'Payment links, API keys, SDK, and webhooks enabled'}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                </div>
              </div>

              {/* Environment toggle */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">API Environment</p>
                <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-800 text-xs font-semibold max-w-xs">
                  <button onClick={() => { setIsSandbox(false); showToast('Switched to Live mode') }}
                    className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${!isSandbox ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${!isSandbox ? 'bg-white' : 'bg-emerald-500'}`} />
                    Live Production
                  </button>
                  <button onClick={() => { setIsSandbox(true); showToast('Switched to Sandbox mode') }}
                    className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${isSandbox ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSandbox ? 'bg-slate-950' : 'bg-amber-400'}`} />
                    Sandbox
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeSection === 'notifications' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-brand-500" /> Notifications
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Choose what events trigger email alerts</p>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'paymentEmail',   label: 'Payment received',       desc: 'Email when a payer completes checkout' },
                  { key: 'offrampEmail',   label: 'Off-ramp settled',        desc: 'Email when funds hit your bank / MoMo' },
                  { key: 'webhookFailure', label: 'Webhook delivery failure',desc: 'Alert if a webhook endpoint returns non-200' },
                  { key: 'weeklyReport',   label: 'Weekly summary',          desc: 'Digest of volume and settlement metrics' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notifications[key]}
                        onChange={() => { toggleNotif(key); showToast(`${label} ${!notifications[key] ? 'enabled' : 'disabled'}`) }}
                        className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 rounded-full peer peer-checked:bg-brand-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {activeSection === 'security' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-brand-500" /> Security
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Protect your merchant account</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-brand-500" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Password</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Password resets are handled securely through Supabase Auth.
                </p>
                <button onClick={() => showToast('Password reset email sent')}
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors">
                  Send Password Reset Email
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-brand-500" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Active Session</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Signed in as <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>.
                  Sessions auto-expire after 1 hour of inactivity.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}


// ── Destinations section component ───────────────────────────────────────────

const RAIL_FIELDS = {
  PIX:     [{ key: 'keyType',        label: 'Key Type',         placeholder: 'EMAIL | CPF | PHONE | RANDOM' },
             { key: 'keyValue',       label: 'Key Value',        placeholder: 'e.g. email@example.com' }],
  SPEI:    [{ key: 'clabe',          label: 'CLABE (18 digits)', placeholder: '000000000000000000' }],
  SEPA:    [{ key: 'iban',           label: 'IBAN',             placeholder: 'DE89370400440532013000' },
             { key: 'bic',            label: 'BIC / SWIFT',     placeholder: 'DEUTDEDB' }],
  ACH:     [{ key: 'routingNumber',  label: 'Routing Number',   placeholder: '021000021' },
             { key: 'accountNumber', label: 'Account Number',   placeholder: '000123456789' },
             { key: 'accountType',   label: 'Account Type',     placeholder: 'CHECKING | SAVINGS' }],
  FPS:     [{ key: 'sortCode',       label: 'Sort Code',        placeholder: '20-00-00' },
             { key: 'accountNumber', label: 'Account Number (8 digits)', placeholder: '55779911' }],
  SWIFT:   [{ key: 'accountNumber', label: 'Account / IBAN',   placeholder: 'Account number' },
             { key: 'swiftCode',     label: 'SWIFT / BIC',      placeholder: 'BARCGB22' },
             { key: 'bankName',      label: 'Bank Name',        placeholder: 'Barclays Bank' },
             { key: 'bankAddress',   label: 'Bank Address',     placeholder: 'Optional' }],
  FEDWIRE: [{ key: 'routingNumber',  label: 'Routing Number',   placeholder: '021000021' },
             { key: 'accountNumber', label: 'Account Number',   placeholder: '000123456789' }],
}

const COUNTRY_RAIL = {
  BR:'PIX', MX:'SPEI', DE:'SEPA', FR:'SEPA', ES:'SEPA', IT:'SEPA', NL:'SEPA',
  PT:'SEPA', AT:'SEPA', BE:'SEPA', US:'ACH', GB:'FPS',
}

// Lumx requires a `holder` and `bank` block for these rails (PIX needs
// neither, SPEI needs only the holder's tax ID — both are filled server-side
// from the merchant's KYC data when the inputs are left blank).
const NEEDS_HOLDER = ['SEPA', 'ACH', 'FEDWIRE', 'FPS', 'SWIFT']
const FULL_BANK_ADDRESS = ['ACH', 'FEDWIRE']

function DestinationsSection({ destinations, loading, onRefresh, onAdd, onRemove, onSetDefault, showToast }) {
  const [showModal, setShowModal]   = useState(false)
  const [saving,    setSaving]      = useState(false)
  const [error,     setError]       = useState('')

  // Form state
  const [label,      setLabel]      = useState('')
  const [holderName, setHolderName] = useState('')
  const [country,    setCountry]    = useState('US')
  const [identifier, setIdentifier] = useState({})

  // Holder / bank — required by non-PIX/SPEI rails
  const [holderTaxId,  setHolderTaxId]  = useState('')
  const [holderCountry, setHolderCountry] = useState('')
  const [holderLine1,  setHolderLine1]  = useState('')
  const [holderCity,   setHolderCity]   = useState('')
  const [holderState,  setHolderState]  = useState('')
  const [holderPostal, setHolderPostal] = useState('')
  const [bankName,     setBankName]     = useState('')
  const [bankCountry,  setBankCountry]  = useState('')
  const [bankLine1,    setBankLine1]    = useState('')
  const [bankCity,     setBankCity]     = useState('')
  const [bankState,    setBankState]    = useState('')
  const [bankPostal,   setBankPostal]   = useState('')

  const rail = COUNTRY_RAIL[country] || 'SWIFT'
  const fields = RAIL_FIELDS[rail] || RAIL_FIELDS.SWIFT
  const needsHolder = NEEDS_HOLDER.includes(rail)
  const needsFullBankAddress = FULL_BANK_ADDRESS.includes(rail)

  const handleCountryChange = (c) => {
    setCountry(c)
    setIdentifier({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { label, holder_name: holderName, country, identifier }
      if (needsHolder) {
        payload.holder_tax_id = holderTaxId || undefined
        payload.holder_address_country = holderCountry || undefined
        if (needsFullBankAddress) {
          payload.holder_address_line1 = holderLine1 || undefined
          payload.holder_address_city = holderCity || undefined
          payload.holder_address_state = holderState || undefined
          payload.holder_address_postal_code = holderPostal || undefined
        }
        payload.bank_name = bankName || undefined
        payload.bank_address_country = bankCountry || undefined
        if (needsFullBankAddress) {
          payload.bank_address_line1 = bankLine1 || undefined
          payload.bank_address_city = bankCity || undefined
          payload.bank_address_state = bankState || undefined
          payload.bank_address_postal_code = bankPostal || undefined
        }
      }
      await onAdd(payload)
      setShowModal(false)
      setLabel(''); setHolderName(''); setCountry('US'); setIdentifier({})
      setHolderTaxId(''); setHolderCountry('')
      setHolderLine1(''); setHolderCity(''); setHolderState(''); setHolderPostal('')
      setBankName(''); setBankCountry('')
      setBankLine1(''); setBankCity(''); setBankState(''); setBankPostal('')
    } catch (err) {
      setError(err.message || 'Failed to register destination')
    } finally {
      setSaving(false)
    }
  }

  const railLabel = { PIX:'PIX', SPEI:'SPEI', SEPA:'SEPA', ACH:'ACH', FPS:'Faster Payments', SWIFT:'SWIFT', FEDWIRE:'Fedwire' }

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-brand-500" /> Payout Destinations
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bank accounts and mobile money wallets where payments are settled. Each must be approved by Lumx.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-glow-sm">
            <Plus className="w-4 h-4" /> Add Destination
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
        </div>
      ) : destinations.length === 0 ? (
        <div className="py-12 text-center">
          <Banknote className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No destinations yet</p>
          <p className="text-xs text-slate-400 mt-1">Add a bank account to enable payment settlement</p>
          <button onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add First Destination
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {destinations.map(dest => (
            <div key={dest.id}
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                dest.is_default
                  ? 'border-brand-500/40 bg-brand-500/5 dark:bg-brand-950/20 ring-1 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30'
              }`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5 text-brand-500" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{dest.label}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {railLabel[dest.rail] || dest.rail} · {dest.currency}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      dest.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : dest.status === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}>{dest.status}</span>
                    {dest.is_default && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">DEFAULT</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{dest.holder_name} · {dest.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!dest.is_default && dest.status === 'APPROVED' && (
                  <button onClick={() => onSetDefault(dest.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                    Set Default
                  </button>
                )}
                <button onClick={() => onRemove(dest.id)}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
        <Zap className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
        <span>Destinations must be approved by Lumx before they can receive settlements. Approval typically takes up to 24 hours. SWIFT destinations may take 1–3 business days to settle.</span>
      </div>

      {/* Add Destination Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowModal(false); setError('') }} />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0E1321] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Payout Destination</h3>
              <button onClick={() => { setShowModal(false); setError('') }} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Label</label>
                  <input type="text" value={label} onChange={e => setLabel(e.target.value)}
                    placeholder="e.g. My Chase Account"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Account Holder Name *</label>
                  <input type="text" required value={holderName} onChange={e => setHolderName(e.target.value)}
                    placeholder="Full legal name"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Country *</label>
                <select value={country} onChange={e => handleCountryChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {[
                    ['US','🇺🇸 United States (ACH)'],['GB','🇬🇧 United Kingdom (FPS)'],
                    ['DE','🇩🇪 Germany (SEPA)'],['FR','🇫🇷 France (SEPA)'],
                    ['ES','🇪🇸 Spain (SEPA)'],['IT','🇮🇹 Italy (SEPA)'],
                    ['NL','🇳🇱 Netherlands (SEPA)'],['PT','🇵🇹 Portugal (SEPA)'],
                    ['AT','🇦🇹 Austria (SEPA)'],['BE','🇧🇪 Belgium (SEPA)'],
                    ['BR','🇧🇷 Brazil (PIX)'],['MX','🇲🇽 Mexico (SPEI)'],
                    ['GH','🇬🇭 Ghana (SWIFT)'],['NG','🇳🇬 Nigeria (SWIFT)'],
                    ['KE','🇰🇪 Kenya (SWIFT)'],['OTHER','🌍 Other (SWIFT)'],
                  ].map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                </select>
                <p className="text-[11px] text-brand-600 dark:text-brand-400 mt-1 font-semibold">
                  Rail: {railLabel[rail] || rail}
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {railLabel[rail]} Identifier Fields *
                </label>
                {fields.map(f => (
                  <div key={f.key}>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">{f.label}</label>
                    <input type="text"
                      value={identifier[f.key] || ''}
                      onChange={e => setIdentifier(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                ))}
              </div>

              {needsHolder && (
                <div className="space-y-3 p-4 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800">
                  <p className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider">
                    Account Holder (required by {railLabel[rail] || rail})
                  </p>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      Holder Tax ID (defaults to your account Tax ID)
                    </label>
                    <input type="text" value={holderTaxId} onChange={e => setHolderTaxId(e.target.value)}
                      placeholder="e.g. 123-45-6789"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      Holder Country (ISO-2, defaults to your country)
                    </label>
                    <input type="text" value={holderCountry} onChange={e => setHolderCountry(e.target.value.toUpperCase())}
                      placeholder="e.g. GB" maxLength={2}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  {needsFullBankAddress && (
                    <>
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Holder Address Line 1 *</label>
                        <input type="text" required value={holderLine1} onChange={e => setHolderLine1(e.target.value)}
                          placeholder="e.g. 12 High Street"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">City *</label>
                          <input type="text" required value={holderCity} onChange={e => setHolderCity(e.target.value)}
                            placeholder="Accra"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">State *</label>
                          <input type="text" required value={holderState} onChange={e => setHolderState(e.target.value)}
                            placeholder="GA"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Postal *</label>
                          <input type="text" required value={holderPostal} onChange={e => setHolderPostal(e.target.value)}
                            placeholder="GA-123"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <p className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider pt-1">Bank</p>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Bank Name *</label>
                    <input type="text" required value={bankName} onChange={e => setBankName(e.target.value)}
                      placeholder="e.g. Barclays Bank"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      Bank Country (ISO-2, defaults to destination country)
                    </label>
                    <input type="text" value={bankCountry} onChange={e => setBankCountry(e.target.value.toUpperCase())}
                      placeholder="e.g. GB" maxLength={2}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  {needsFullBankAddress && (
                    <>
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Bank Address Line 1 *</label>
                        <input type="text" required value={bankLine1} onChange={e => setBankLine1(e.target.value)}
                          placeholder="e.g. 270 Park Avenue"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">City *</label>
                          <input type="text" required value={bankCity} onChange={e => setBankCity(e.target.value)}
                            placeholder="New York"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">State *</label>
                          <input type="text" required value={bankState} onChange={e => setBankState(e.target.value)}
                            placeholder="NY"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Postal *</label>
                          <input type="text" required value={bankPostal} onChange={e => setBankPostal(e.target.value)}
                            placeholder="10017"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setError('') }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-glow-sm disabled:opacity-60">
                  {saving ? 'Registering…' : 'Register Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
