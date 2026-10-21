'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import {
  Zap,
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  Sun,
  Moon,
  Code2,
  Smartphone,
  CheckCircle,
  Check,
} from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { showToast, setAccountType: setGlobalAccountType } = useApp();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('developer'); // 'developer' | 'social_seller'
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!fullName || !businessName || !email || !password) {
      alert('Please fill out all fields in Step 1');
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert('Please accept the Terms of Service to continue');
      return;
    }
    setIsLoading(true);
    setGlobalAccountType(accountType);
    showToast(`Welcome to AgilePay, ${businessName || 'Merchant'}! Initializing workspace...`);
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-glow-sm">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <span className="font-extrabold text-xl text-slate-900 dark:text-white">
            AgilePay
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-lg mx-auto my-10">
        <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#0E1321] border border-slate-200 dark:border-slate-800 shadow-2xl">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 1
                    ? 'bg-brand-600 text-white'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Account Details</p>
                <p className="text-[11px] text-slate-400">Step 1 of 2</p>
              </div>
            </div>

            <div className="h-0.5 w-12 bg-slate-200 dark:bg-slate-800" />

            <div className="flex items-center gap-3">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 2
                    ? 'bg-brand-600 text-white ring-4 ring-brand-500/20'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                2
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Account Type</p>
                <p className="text-[11px] text-slate-400">Step 2 of 2</p>
              </div>
            </div>
          </div>

          {step === 1 ? (
            /* Step 1: Account Setup Form */
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Kofi Mensah"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Registered / Business Name *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Shoe Haven Ghana Ltd."
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
                    placeholder="kofi@shoenhaven.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all active:scale-[0.99]"
              >
                <span>Continue to Step 2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Step 2: Account Type Selection */
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
                  How will you use AgilePay?
                </label>

                <div className="space-y-3">
                  {/* Option 1: Developer */}
                  <label
                    onClick={() => setAccountType('developer')}
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      accountType === 'developer'
                        ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      checked={accountType === 'developer'}
                      onChange={() => setAccountType('developer')}
                      className="mt-1 text-brand-600 focus:ring-brand-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-brand-500" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Developer / Business Platform
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        3-Line SDK integration, API Keys, webhooks, and partner split fee engine.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Social Seller */}
                  <label
                    onClick={() => setAccountType('social_seller')}
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      accountType === 'social_seller'
                        ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      checked={accountType === 'social_seller'}
                      onChange={() => setAccountType('social_seller')}
                      className="mt-1 text-brand-600 focus:ring-brand-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-emerald-500" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Social Seller / Freelancer
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        No-Code payment links, WhatsApp bot commands, and instant MoMo off-ramps.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Terms of Service Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                    I agree to the{' '}
                    <a href="/terms" className="text-brand-600 dark:text-brand-400 underline">
                      AgilePay Terms of Service
                    </a>{' '}
                    and the Bank of Ghana regulatory sandbox compliance rules.
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all active:scale-[0.99]"
                >
                  <span>{isLoading ? 'Creating Account...' : 'Create AgilePay Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              href="/signin"
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400">
        AgilePay Invisible Rails · Ghana · Nigeria · Kenya · Global
      </div>
    </div>
  );
}
