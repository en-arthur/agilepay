'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import {
  Sun,
  Moon,
  Zap,
  ArrowRight,
  Code2,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090D16]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-violet-400 flex items-center justify-center text-white shadow-glow-sm group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-white stroke-none" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              AgilePay
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-600 dark:text-brand-400 -mt-1">
              Invisible Rails
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            href="/#features"
            className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            Features
          </Link>
          <Link
            href="/dashboard/developers"
            className="flex items-center gap-1.5 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <Code2 className="w-4 h-4 text-brand-500" />
            <span>Developers</span>
          </Link>
          <Link
            href="/#calculator"
            className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            Calculator
          </Link>
          <Link
            href="/pay/8492"
            className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            Demo Checkout
          </Link>
        </nav>

        {/* Action Buttons & Theme Toggle */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          <Link
            href="/signin"
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 transition-colors"
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-glow-sm hover:shadow-glow transition-all active:scale-95"
          >
            <span>Start Building</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D111C] px-6 py-6 space-y-4">
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 dark:text-slate-200"
          >
            Features
          </Link>
          <Link
            href="/dashboard/developers"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 dark:text-slate-200"
          >
            Developer SDK
          </Link>
          <Link
            href="/#calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 dark:text-slate-200"
          >
            Fee Savings Calculator
          </Link>
          <Link
            href="/pay/8492"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-brand-600 dark:text-brand-400"
          >
            Explore Demo Checkout
          </Link>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            <Link
              href="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-medium text-sm text-slate-800 dark:text-slate-200"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 font-medium text-sm text-white"
            >
              Start Building Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
