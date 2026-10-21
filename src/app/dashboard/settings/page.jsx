'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Settings,
  Building2,
  Wallet,
  MessageSquare,
  Shield,
  Bell,
  Globe,
  Smartphone,
  Banknote,
  Coins,
  Check,
  ChevronRight,
  Copy,
  Lock,
  KeyRound,
  Trash2,
  User,
  Mail,
  MapPin,
  Phone,
  Zap,
} from 'lucide-react';

export default function SettingsPage() {
  const { isSandbox, setIsSandbox, showToast } = useApp();
  const [activeSection, setActiveSection] = useState('business');
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Business Profile
  const [businessName, setBusinessName] = useState('Shoe Haven Ghana Ltd.');
  const [contactName, setContactName] = useState('Kofi Mensah');
  const [email, setEmail] = useState('kofi@shoenhaven.com');
  const [phone, setPhone] = useState('+233 24 819 2041');
  const [country, setCountry] = useState('Ghana');
  const [city, setCity] = useState('Accra');

  // Payout destinations
  const [payoutMethods, setPayoutMethods] = useState([
    {
      id: 'momo_mtn',
      type: 'MTN Mobile Money',
      label: 'MTN MoMo',
      number: '+233 24 819 2041',
      isDefault: true,
      icon: Smartphone,
      color: 'text-amber-500',
    },
    {
      id: 'momo_telecel',
      type: 'Telecel Cash',
      label: 'Telecel Cash',
      number: '+233 50 339 1042',
      isDefault: false,
      icon: Smartphone,
      color: 'text-rose-500',
    },
    {
      id: 'bank_sc',
      type: 'Bank Transfer',
      label: 'Standard Chartered',
      number: 'Account ****9102',
      isDefault: false,
      icon: Banknote,
      color: 'text-indigo-500',
    },
    {
      id: 'wallet_base',
      type: 'Base USDC Wallet',
      label: 'Base Smart Wallet',
      number: '0x84...9204',
      isDefault: false,
      icon: Coins,
      color: 'text-cyan-500',
    },
  ]);

  // WhatsApp Bot config
  const [whatsappBot, setWhatsappBot] = useState({
    enabled: true,
    number: '+233 24 559 8192',
    autoReply: true,
    sendReceipts: true,
    commandPrefix: '!',
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    paymentEmail: true,
    paymentSms: false,
    offrampEmail: true,
    webhookFailure: true,
    weeklyReport: true,
    marketingEmails: false,
  });

  // Security
  const [twoFA, setTwoFA] = useState(true);

  const referralCode = 'AGILE-KOFI-8492';

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedReferral(true);
    showToast('Referral code copied to clipboard');
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleSaveBusiness = (e) => {
    e.preventDefault();
    showToast('Business profile updated successfully');
  };

  const handleSaveWhatsapp = (e) => {
    e.preventDefault();
    showToast('WhatsApp Bot configuration saved');
  };

  const handleSaveNotifications = () => {
    showToast('Notification preferences updated');
  };

  const handleSetDefaultPayout = (id) => {
    setPayoutMethods((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id }))
    );
    showToast('Default payout destination updated');
  };

  const handleDeletePayout = (id) => {
    setPayoutMethods((prev) => prev.filter((m) => m.id !== id));
    showToast('Payout destination removed', 'info');
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleWhatsappSetting = (key) => {
    setWhatsappBot((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    { id: 'business', label: 'Business Profile', icon: Building2 },
    { id: 'payouts', label: 'Payout Destinations', icon: Wallet },
    { id: 'whatsapp', label: 'WhatsApp Bot', icon: MessageSquare },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-brand-500" />
            <span>Settings</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your business profile, payout rails, WhatsApp bot, and account security
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Section Sidebar */}
        <aside className="lg:col-span-3">
          <nav className="p-2 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 lg:sticky lg:top-24">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                  <span className="flex-1">{section.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Section Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* === Business Profile === */}
          {activeSection === 'business' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-500" />
                  Business Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This information appears on customer checkout pages and digital receipts
                </p>
              </div>

              {/* Avatar / Logo */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-glow-sm">
                  SH
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Business Logo</p>
                  <p className="text-xs text-slate-400 mt-0.5">Displayed on hosted checkout pages</p>
                  <button className="mt-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Upload New Logo
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveBusiness} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Business Name *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Contact Person *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Work Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Country
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="Ghana">🇬🇭 Ghana</option>
                        <option value="Nigeria">🇳🇬 Nigeria</option>
                        <option value="Kenya">🇰🇪 Kenya</option>
                        <option value="Other">🌍 Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Referral Code */}
                <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      Merchant Referral Code
                    </p>
                    <p className="font-mono text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {referralCode}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Earn 0.5% of referee fees for 12 months
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyReferral}
                    className="px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedReferral ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReferral ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-glow-sm"
                >
                  Save Business Profile
                </button>
              </form>
            </div>
          )}

          {/* === Payout Destinations === */}
          {activeSection === 'payouts' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-brand-500" />
                    Payout Destinations
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Funds are auto-off-ramped to your default destination after each successful payment
                  </p>
                </div>
                <button
                  onClick={() => showToast('Add payout destination wizard coming soon')}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 self-start"
                >
                  <Wallet className="w-3.5 h-3.5 text-brand-500" />
                  <span>+ Add Destination</span>
                </button>
              </div>

              <div className="space-y-3">
                {payoutMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.id}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                        method.isDefault
                          ? 'border-brand-500/40 bg-brand-500/5 dark:bg-brand-950/20 ring-1 ring-brand-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${method.color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {method.label}
                            </span>
                            {method.isDefault && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            {method.number}
                          </p>
                          <p className="text-[11px] text-slate-400">{method.type}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!method.isDefault && (
                          <button
                            onClick={() => handleSetDefaultPayout(method.id)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePayout(method.id)}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-500" />
                  <span>
                    Instant off-ramp: Payments are converted via Base USDC and disbursed to your default
                    destination within 1-2 seconds. Bank transfers settle same-day.
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* === WhatsApp Bot === */}
          {activeSection === 'whatsapp' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  WhatsApp Bot Configuration
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Let buyers pay by texting commands to your AgilePay WhatsApp Business number
                </p>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-5 h-5 text-white fill-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">WhatsApp Bot</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${whatsappBot.enabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
                        {whatsappBot.enabled ? 'ONLINE' : 'PAUSED'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-emerald-300 mt-0.5">{whatsappBot.number}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappBot.enabled}
                    onChange={() => toggleWhatsappSetting('enabled')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-emerald-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5" />
                </label>
              </div>

              <form onSubmit={handleSaveWhatsapp} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    WhatsApp Business Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={whatsappBot.number}
                      onChange={(e) => setWhatsappBot((prev) => ({ ...prev, number: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Command Trigger Prefix
                  </label>
                  <div className="relative w-32">
                    <input
                      type="text"
                      value={whatsappBot.commandPrefix}
                      onChange={(e) => setWhatsappBot((prev) => ({ ...prev, commandPrefix: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Buyers text <code className="text-brand-500 font-mono">{whatsappBot.commandPrefix}pay 50</code> to generate a link instantly
                  </p>
                </div>

                {/* Toggle Settings */}
                <div className="space-y-3">
                  {[
                    { key: 'autoReply', label: 'Auto-reply with payment link', desc: 'Bot responds automatically to incoming messages' },
                    { key: 'sendReceipts', label: 'Send digital receipts via WhatsApp', desc: 'Deliver confirmation and receipt after payment' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 cursor-pointer"
                    >
                      <div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.label}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={whatsappBot[item.key]}
                        onChange={() => toggleWhatsappSetting(item.key)}
                        className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500"
                      />
                    </label>
                  ))}
                </div>

                {/* Command Reference */}
                <div className="p-4 rounded-xl bg-[#0A0D15] border border-slate-800 text-xs font-mono space-y-1.5">
                  <p className="text-slate-400 text-[11px] uppercase tracking-wider font-sans font-bold mb-2">
                    Supported Text Commands:
                  </p>
                  <p className="text-emerald-400">
                    {whatsappBot.commandPrefix}pay $50 for Brown Loafers
                  </p>
                  <p className="text-slate-300">{whatsappBot.commandPrefix}balance — check settled wallet</p>
                  <p className="text-slate-300">{whatsappBot.commandPrefix}links — list active payment links</p>
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-glow-sm"
                >
                  Save WhatsApp Configuration
                </button>
              </form>
            </div>
          )}

          {/* === Security === */}
          {activeSection === 'security' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-500" />
                  Security & Access
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Protect your merchant account, API keys, and settlement rails
                </p>
              </div>

              {/* Two-Factor Auth */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Two-Factor Authentication (2FA)
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {twoFA ? 'Enabled via Authenticator App' : 'Not enabled — recommend enabling'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFA}
                    onChange={() => {
                      setTwoFA(!twoFA);
                      showToast(twoFA ? '2FA disabled' : '2FA enabled via Authenticator App');
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 rounded-full peer peer-checked:bg-emerald-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5" />
                </label>
              </div>

              {/* Password */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-5 h-5 text-brand-500" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Password
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value="supersecretpassword123"
                    readOnly
                    className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs font-mono"
                  />
                  <button
                    onClick={() => showToast('Password reset link sent to your email')}
                    className="px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
                  >
                    Reset Password
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Last changed 3 months ago</p>
              </div>

              {/* Environment Mode */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-brand-500" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    API Environment Mode
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                  <button
                    onClick={() => {
                      setIsSandbox(false);
                      showToast('Switched to Live Production mode');
                    }}
                    className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      !isSandbox
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${!isSandbox ? 'bg-white' : 'bg-emerald-500'}`} />
                    Live Production
                  </button>
                  <button
                    onClick={() => {
                      setIsSandbox(true);
                      showToast('Switched to Sandbox test mode');
                    }}
                    className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      isSandbox
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSandbox ? 'bg-slate-950' : 'bg-amber-400'}`} />
                    Sandbox Test
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  {isSandbox
                    ? 'Sandbox mode: No real charges. Use test keys for development.'
                    : 'Live mode: Real charges will be processed. Ensure 2FA is enabled.'}
                </p>
              </div>

              {/* Session Management */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        Active Sessions
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        2 devices · Accra (Chrome) and Lagos (Mobile Safari)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast('Signed out of all other devices')}
                    className="px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
                  >
                    Revoke All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* === Notifications === */}
          {activeSection === 'notifications' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-brand-500" />
                  Notification Preferences
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Choose how you want to be alerted about payments, off-ramps, and system events
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'paymentEmail', label: 'Payment received (Email)', desc: 'Get an email every time a customer pays via your link' },
                  { key: 'paymentSms', label: 'Payment received (SMS)', desc: 'Receive an SMS for each successful charge (carrier fees apply)' },
                  { key: 'offrampEmail', label: 'Off-ramp completed (Email)', desc: 'Notify when USDC is converted and settled to your MoMo/bank' },
                  { key: 'webhookFailure', label: 'Webhook delivery failures', desc: 'Alert me when a webhook cannot be delivered after retries' },
                  { key: 'weeklyReport', label: 'Weekly settlement summary', desc: 'A digest of volume, fees, and off-ramp status every Monday' },
                  { key: 'marketingEmails', label: 'Product updates & tips', desc: 'New features, integration guides, and merchant success stories' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.label}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={() => toggleNotification(item.key)}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              <button
                onClick={handleSaveNotifications}
                className="py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-glow-sm"
              >
                Save Notification Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
