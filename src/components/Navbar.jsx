'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import {
  Sun,
  Moon,
  Zap,
  Code2,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md transition-colors">
      <div className="nav px-6 sm:px-8 md:grid md:grid-cols-[1fr_auto_1fr] items-center">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group justify-self-start">
          <div className="w-8 h-8 rounded-[var(--r-md)] bg-[var(--accent)] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Zap className="w-4 h-4 fill-white stroke-none" />
          </div>
          <span className="font-medium text-lg tracking-tight text-[var(--text)]">
            AgilePay
          </span>
        </Link>

        {/* Desktop Navigation Links (Centered via 3-column grid) */}
        <nav className="hidden md:flex items-center justify-center gap-7 text-[var(--fs-nav)] font-medium text-[var(--text-body)] justify-self-center">
          <Link
            href="/#features"
            className="hover:text-[var(--text)] transition-colors"
          >
            Features
          </Link>
          <Link
            href="/dashboard/developers"
            className="flex items-center gap-1.5 hover:text-[var(--text)] transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Developers</span>
          </Link>
          <Link
            href="/#calculator"
            className="hover:text-[var(--text)] transition-colors"
          >
            Fee Calculator
          </Link>
          <Link
            href="/pay/8492"
            className="hover:text-[var(--text)] transition-colors"
          >
            Hosted Checkout
          </Link>
        </nav>

        {/* Action Buttons & Theme Toggle */}
        <div className="hidden md:flex items-center justify-end gap-3 justify-self-end">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-[var(--r-md)] text-[var(--text-faint)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border)] transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          <Link
            href="/signin"
            className="btn btn--secondary"
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="btn btn--primary"
          >
            <span>Start Building</span>
            <span className="caret" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-[var(--text-body)]"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-[var(--r-md)] text-[var(--text)]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border)] bg-[var(--bg-subtle)] px-6 py-6 space-y-4">
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[var(--text)]"
          >
            Features
          </Link>
          <Link
            href="/dashboard/developers"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[var(--text)]"
          >
            Developers
          </Link>
          <Link
            href="/#calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[var(--text)]"
          >
            Fee Calculator
          </Link>
          <Link
            href="/pay/8492"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[var(--text)]"
          >
            Hosted Checkout
          </Link>
          <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-2.5">
            <Link
              href="/signin"
              className="btn btn--secondary w-full text-center"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn btn--primary w-full text-center"
            >
              <span>Start Building</span>
              <span className="caret" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
