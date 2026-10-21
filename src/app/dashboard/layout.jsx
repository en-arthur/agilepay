'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import PaymentDrawer from '@/components/PaymentDrawer';
import {
  Zap,
  LayoutDashboard,
  Link2,
  ArrowLeftRight,
  Code2,
  Settings,
  Sun,
  Moon,
  ChevronDown,
  Bell,
  Plus,
  Shield,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Wallet,
  Smartphone,
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { isSandbox, setIsSandbox, accountType } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const allNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Payment Links', href: '/dashboard/links', icon: Link2 },
    { label: 'Transactions', href: '/dashboard/transactions', icon: ArrowLeftRight },
    { label: 'Developer Portal', href: '/dashboard/developers', icon: Code2 },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  // Developer dashboard: remove Payment Links
  // Social seller dashboard: remove Developer Portal
  const navItems =
    accountType === 'developer'
      ? allNavItems.filter((item) => item.href !== '/dashboard/links')
      : allNavItems.filter((item) => item.href !== '/dashboard/developers');

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#080B14] text-slate-900 dark:text-slate-100">
      {/* Payment Link Drawer Modal */}
      <PaymentDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F1A] shrink-0 sticky top-0 h-screen z-30">
        <div>
          {/* Logo & Environment Toggle */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-glow-sm">
                <Zap className="w-4 h-4 fill-white stroke-none" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  AgilePay
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-400 -mt-1">
                  Merchant Hub
                </span>
              </div>
            </Link>

            {/* Environment Toggle: Live vs Sandbox */}
            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex items-center border border-slate-200/80 dark:border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIsSandbox(false)}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                  !isSandbox
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${!isSandbox ? 'bg-white' : 'bg-emerald-500'}`} />
                <span>Live</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSandbox(true)}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                  isSandbox
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSandbox ? 'bg-slate-950' : 'bg-amber-400'}`} />
                <span>Sandbox</span>
              </button>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="px-4 py-3">
            {accountType === 'developer' ? (
              <Link
                href="/dashboard/developers"
                className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all"
              >
                <Code2 className="w-4 h-4" />
                <span>Developer Portal</span>
              </Link>
            ) : (
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Payment Link</span>
              </button>
            )}
          </div>

          {/* Nav Items */}
          <nav className="px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Avatar Bottom Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center">
                SH
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  Shoe Haven GH
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                  kofi@shoenhaven.com
                </span>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0A0D16]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Account Type Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/30 text-xs font-bold">
              {accountType === 'developer' ? (
                <>
                  <Code2 className="w-3 h-3" />
                  <span>Developer</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3 h-3" />
                  <span>Social Seller</span>
                </>
              )}
            </div>

            {/* Sandbox Notice Banner */}
            {isSandbox ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>SANDBOX SIMULATION MODE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE PRODUCTION RAILS</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="sm:hidden p-2 rounded-xl bg-brand-600 text-white"
            >
              <Plus className="w-4 h-4" />
            </button>

            <Link
              href="/pay/8492"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand-500" />
              <span>Preview Checkout</span>
            </Link>

            {/* Notifications */}
            <button className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-brand-500 absolute top-2 right-2" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 bg-white dark:bg-[#0B0F1A] h-full shadow-2xl p-5 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                    <Zap className="w-4 h-4 fill-white" />
                  </div>
                  <span className="font-bold text-base">AgilePay</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode toggle */}
              <div className="mt-4 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex items-center text-xs font-semibold">
                <button
                  onClick={() => setIsSandbox(false)}
                  className={`flex-1 py-1 rounded-lg ${!isSandbox ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  Live
                </button>
                <button
                  onClick={() => setIsSandbox(true)}
                  className={`flex-1 py-1 rounded-lg ${isSandbox ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Sandbox
                </button>
              </div>

              <nav className="mt-6 space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              {accountType === 'developer' ? (
                <Link
                  href="/dashboard/developers"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold mb-3 flex items-center justify-center gap-2"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Developer Portal</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    setDrawerOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold mb-3 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Payment Link</span>
                </button>
              )}
              <p className="text-xs text-slate-400 text-center">Shoe Haven Ghana</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
