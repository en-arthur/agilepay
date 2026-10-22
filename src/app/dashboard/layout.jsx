'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import PaymentDrawer from '@/components/PaymentDrawer'
import {
  Zap, LayoutDashboard, Link2, ArrowLeftRight, Code2, Settings,
  Sun, Moon, Bell, Plus, LogOut, ExternalLink, Menu, X, Smartphone,
  Wallet,
} from 'lucide-react'

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { session, merchant, loading, signOut } = useAuth()
  const { isSandbox, setIsSandbox, accountType } = useApp()
  const [drawerOpen, setDrawerOpen]           = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !session) {
      router.replace('/signin')
    }
  }, [loading, session, router])

  // Don't render the shell while auth is resolving
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#080B14]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white animate-pulse">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <p className="text-xs text-slate-400">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  if (!session) return null  // router.replace is in flight

  // ── Derive display info ───────────────────────────────────────────────────
  const displayName  = merchant?.business_name || merchant?.full_name || 'Merchant'
  const displayEmail = merchant?.email || session?.user?.email || ''
  const initials     = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  // ── Nav ───────────────────────────────────────────────────────────────────
  const allNavItems = [
    { label: 'Dashboard',       href: '/dashboard',              icon: LayoutDashboard },
    { label: 'Payment Links',   href: '/dashboard/links',        icon: Link2 },
    { label: 'Transactions',    href: '/dashboard/transactions', icon: ArrowLeftRight },
    { label: 'Developer Portal',href: '/dashboard/developers',   icon: Code2 },
    { label: 'Remittance',      href: '/dashboard/remittance',   icon: Wallet },
    { label: 'Settings',        href: '/dashboard/settings',     icon: Settings },
  ]

  // developer → hide Payment Links + Remittance
  // merchant  → hide Developer Portal + Remittance
  // individual → hide Developer Portal + Payment Links
  const navItems = allNavItems.filter(i => {
    if (accountType === 'developer')  return i.href !== '/dashboard/links' && i.href !== '/dashboard/remittance'
    if (accountType === 'individual') return i.href !== '/dashboard/developers' && i.href !== '/dashboard/links'
    return i.href !== '/dashboard/developers' && i.href !== '/dashboard/remittance'
  })

  const Sidebar = () => (
    <>
      <div>
        {/* Logo */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2.5 mb-4 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-glow-sm">
              <Zap className="w-4 h-4 fill-white stroke-none" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">AgilePay</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-400 -mt-1">Merchant Hub</span>
            </div>
          </Link>

          {/* Environment Toggle */}
          <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex items-center border border-slate-200/80 dark:border-slate-800 text-xs font-semibold">
            <button onClick={() => setIsSandbox(false)}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                !isSandbox ? 'bg-emerald-600 text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${!isSandbox ? 'bg-white' : 'bg-emerald-500'}`} />
              <span>Live</span>
            </button>
            <button onClick={() => setIsSandbox(true)}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                isSandbox ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSandbox ? 'bg-slate-950' : 'bg-amber-400'}`} />
              <span>Sandbox</span>
            </button>
          </div>
        </div>

        {/* Quick Action */}
        <div className="px-4 py-3">
          {accountType === 'developer' ? (
            <Link href="/dashboard/developers"
              className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all">
              <Code2 className="w-4 h-4" />
              <span>Developer Portal</span>
            </Link>
          ) : accountType === 'individual' ? (
            <Link href="/dashboard/remittance"
              className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all">
              <Wallet className="w-4 h-4" />
              <span>Send Money</span>
            </Link>
          ) : (
            <button onClick={() => setDrawerOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all">
              <Plus className="w-4 h-4" />
              <span>+ Create Payment Link</span>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white'
                }`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[110px]">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                {displayEmail}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={toggleTheme} aria-label="Toggle Theme"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={signOut} aria-label="Sign out"
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="h-screen overflow-hidden flex bg-slate-50 dark:bg-[#080B14] text-slate-900 dark:text-slate-100">
      <PaymentDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Desktop Sidebar — fixed height, never scrolls */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F1A] shrink-0 h-full z-30 overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Main area — fills remaining space, scrolls independently */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar — sticks to the top of the main column, not the page */}
        <header className="h-16 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0A0D16]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/30 text-xs font-bold">
              {accountType === 'developer' ? (
                <><Code2 className="w-3 h-3" /><span>Developer</span></>
              ) : (
                <><Smartphone className="w-3 h-3" /><span>Merchant</span></>
              )}
            </div>

            {isSandbox ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>SANDBOX MODE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setDrawerOpen(true)}
              className="sm:hidden p-2 rounded-xl bg-brand-600 text-white">
              <Plus className="w-4 h-4" />
            </button>

            <Link href="/pay/preview" target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-slate-700 dark:text-slate-300 transition-colors">
              <ExternalLink className="w-3.5 h-3.5 text-brand-500" />
              <span>Preview Checkout</span>
            </Link>

            <button className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-brand-500 absolute top-2 right-2" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-72 bg-white dark:bg-[#0B0F1A] h-full shadow-2xl flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                    <Zap className="w-4 h-4 fill-white" />
                  </div>
                  <span className="font-bold text-base">AgilePay</span>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1 rounded-lg text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-4 mt-4 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex items-center text-xs font-semibold mx-4">
                <button onClick={() => setIsSandbox(false)}
                  className={`flex-1 py-1 rounded-lg ${!isSandbox ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}>Live</button>
                <button onClick={() => setIsSandbox(true)}
                  className={`flex-1 py-1 rounded-lg ${isSandbox ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}>Sandbox</button>
              </div>

              <nav className="mt-4 px-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                        isActive ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-600 dark:text-slate-400'
                      }`}>
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <button onClick={signOut}
                className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
              <p className="text-xs text-slate-400 text-center truncate">{displayEmail}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
