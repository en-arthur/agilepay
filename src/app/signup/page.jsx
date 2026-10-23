'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import {
  Zap, Lock, Mail, User, Building, ArrowRight, Sun, Moon,
  Code2, Smartphone, Check, Wallet,
} from 'lucide-react'

const REDIRECT_MAP = {
  DEVELOPER:  '/dashboard/developers',
  MERCHANT:   '/dashboard/links',
  INDIVIDUAL: '/dashboard',
}

export default function SignUpPage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { signUp, signIn } = useAuth()
  const { showToast } = useApp()

  const [step, setStep] = useState(1)
  const [fullName, setFullName]         = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  // Map UI labels → backend account_type values
  const [accountType, setAccountType]   = useState('DEVELOPER') // DEVELOPER | MERCHANT | INDIVIDUAL
  const [taxId,       setTaxId]         = useState('')
  const [birthDate,   setBirthDate]     = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isLoading, setIsLoading]       = useState(false)
  const [error, setError]               = useState('')

  const handleNextStep = (e) => {
    e.preventDefault()
    if (!fullName || !email || !password) {
      setError('Please fill out all required fields')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setError('')
    setStep(2)
  }

  const handleFinalSubmit = async (e) => {
    e.preventDefault()
    if (!acceptedTerms) {
      setError('Please accept the Terms of Service to continue')
      return
    }
    if (!taxId.trim() || !birthDate) {
      setError('Tax ID and date of birth are required for identity verification')
      return
    }
    setIsLoading(true)
    setError('')

    try {
      // 1. Create account via FastAPI (creates Supabase user + Lumx customer)
      const result = await signUp({
        email,
        password,
        full_name:     fullName,
        business_name: businessName || fullName,
        business_type: 'INDIVIDUAL',
        country:       'GH',
        account_type:  accountType,
        // Required by Lumx for every customer (KYC)
        tax_id:     taxId,
        birth_date: birthDate,
      })

      showToast(`Welcome to AgilePay, ${fullName}! Signing you in…`)

      // 2. Auto sign-in after successful account creation
      await signIn(email, password)

      // 3. If Lumx returned a KYC link, open it in a new tab so user can start immediately
      if (result.kyc_link) {
        window.open(result.kyc_link, '_blank', 'noopener,noreferrer')
      }

      // 4. Redirect to the right dashboard section
      router.push(result.redirect_to || REDIRECT_MAP[accountType] || '/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-glow-sm">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <span className="font-extrabold text-xl text-slate-900 dark:text-white">AgilePay</span>
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
            {[{n:1, label:'Account Details'}, {n:2, label:'Account Type'}].map((s, i) => (
              <React.Fragment key={s.n}>
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step > s.n ? 'bg-emerald-500 text-white'
                    : step === s.n ? 'bg-brand-600 text-white ring-4 ring-brand-500/20'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {step > s.n ? <Check className="w-4 h-4 stroke-[3]" /> : s.n}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{s.label}</p>
                    <p className="text-[11px] text-slate-400">Step {s.n} of 2</p>
                  </div>
                </div>
                {i === 0 && <div className="h-0.5 w-12 bg-slate-200 dark:bg-slate-800" />}
              </React.Fragment>
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm font-medium">
              {error}
            </div>
          )}

          {step === 1 ? (
            /* ── Step 1: Account Setup ── */
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input type="text" required value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Kofi Mensah"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Business / Trading Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input type="text" value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Shoe Haven Ghana Ltd. (optional)"
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
                  <input type="email" required autoComplete="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kofi@shoenhaven.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Password * (min 8 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input type="password" required autoComplete="new-password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <button type="submit"
                className="w-full mt-4 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all active:scale-[0.99]">
                <span>Continue to Step 2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* ── Step 2: Account Type ── */
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
                  How will you use AgilePay?
                </label>

                <div className="space-y-3">
                  {[
                    {
                      value: 'DEVELOPER',
                      icon:  Code2,
                      iconColor: 'text-brand-500',
                      title: 'Developer / Business Platform',
                      desc:  'API Keys, SDK integration, and webhooks.',
                    },
                    {
                      value: 'MERCHANT',
                      icon:  Smartphone,
                      iconColor: 'text-emerald-500',
                      title: 'Social Seller / Freelancer',
                      desc:  'No-code payment links, instant settlement, zero integration needed.',
                    },
                    {
                      value: 'INDIVIDUAL',
                      icon:  Wallet,
                      iconColor: 'text-violet-500',
                      title: 'Individual / Remittance',
                      desc:  'Fund your wallet and send money to family or friends worldwide.',
                    },
                  ].map((opt) => (
                    <label key={opt.value}
                      onClick={() => setAccountType(opt.value)}
                      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        accountType === opt.value
                          ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}>
                      <input type="radio" name="accountType" readOnly
                        checked={accountType === opt.value}
                        className="mt-1 text-brand-600 focus:ring-brand-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <opt.icon className={`w-4 h-4 ${opt.iconColor}`} />
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{opt.title}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Identity verification — required for every account type */}
              <div className="space-y-3 p-4 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800">
                  <p className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider">
                    Identity Verification (required)
                  </p>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Tax ID / National ID *
                    </label>
                    <input type="text" required
                      value={taxId} onChange={e => setTaxId(e.target.value)}
                      placeholder="e.g. SSN, CPF, or national ID number"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Date of Birth *
                    </label>
                    <input type="date" required
                      value={birthDate} onChange={e => setBirthDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

              <label className="flex items-start gap-3 cursor-pointer pt-2">
                <input type="checkbox" checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  I agree to the{' '}
                  <a href="/terms" className="text-brand-600 dark:text-brand-400 underline">AgilePay Terms of Service</a>
                  {' '}and the Bank of Ghana regulatory sandbox compliance rules.
                </span>
              </label>

              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => { setStep(1); setError('') }}
                  className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Back
                </button>
                <button type="submit" disabled={isLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all active:scale-[0.99] disabled:opacity-60">
                  <span>{isLoading ? 'Creating Account…' : 'Create AgilePay Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/signin" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400">
        AgilePay · Ghana · Nigeria · Kenya · Global
      </div>
    </div>
  )
}
