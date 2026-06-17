'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { Menu, X, GraduationCap, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DelightBulbLogo from '@/components/public/DelightBulbLogo';

export default function Navbar() {
  const { user, openRegModal, logout, theme, toggleTheme } = useApp();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Our Courses', href: '/courses' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  const handleToggle = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-brand bg-bg-brand/95 backdrop-blur-md transition-colors duration-300">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group" id="logo-link">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-card-brand border border-border-brand group-hover:border-cyan-400/50 transition-colors">
            <DelightBulbLogo size={28} className="text-cyan-450 group-hover:scale-105 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-xl font-extrabold tracking-tight text-text-brand leading-none">
              Delight <span className="text-cyan-400 font-medium text-lg font-bold">Tech</span>
            </span>
            <span className="text-[9px] text-[#FFC430] uppercase tracking-wider font-semibold font-mono leading-none mt-1">
              Network Academy
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex gap-8 items-center" id="desktop-nav">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`text-[15px] font-medium tracking-wide transition-colors hover:text-cyan-400 ${
                  isActive ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-1' : 'text-text-brand-muted hover:text-text-brand'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Auth CTAs */}
        <div className="hidden md:flex items-center gap-4" id="desktop-auth-ctas">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-brand bg-card-brand text-text-brand hover:border-cyan-400/30 transition-all cursor-pointer mr-2"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-400 animate-pulse" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-600" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-xs text-cyan-400 font-mono font-medium capitalize select-none">
                  Logged in as {user.role}
                </span>
                <span className="text-sm text-text-brand font-medium select-none max-w-[120px] truncate">
                  {user.full_name}
                </span>
              </div>
              <Link 
                href={user.role === 'admin' ? '/admin' : '/dashboard'} 
                className="flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-[#0A1228] transition-all hover:bg-cyan-300 shadow-lg shadow-cyan-400/10 active:scale-95"
              >
                {user.role === 'admin' ? 'Admin Panel' : 'My Portal'}
                <GraduationCap className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-sm font-semibold text-text-brand-muted hover:text-text-brand transition-colors"
              >
                Sign In
              </Link>
              <button 
                onClick={() => openRegModal()}
                className="rounded-lg bg-gradient-to-r from-cyan-400 to-[#009ca2] px-5 py-2.5 text-sm font-semibold text-[#0A1228] transition-all hover:brightness-110 shadow-lg shadow-cyan-400/20 active:scale-95 cursor-pointer"
              >
                Register Now
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-3">
          {/* Theme Toggle Button Mobile */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-brand bg-card-brand text-text-brand transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4.5 w-4.5 text-yellow-400" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-slate-700" />
            )}
          </button>
          
          <button 
            onClick={handleToggle}
            className="text-text-brand-muted hover:text-text-brand focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border-brand bg-bg-brand"
            id="mobile-drawer"
          >
            <div className="space-y-1.5 px-4 pb-6 pt-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-md px-3 py-2 text-base font-medium ${
                      isActive 
                        ? 'bg-border-brand text-cyan-400 font-semibold' 
                        : 'text-text-brand-muted hover:bg-card-brand hover:text-text-brand'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t border-border-brand mt-4 flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="px-3 py-1 flex flex-col">
                      <span className="text-xs text-cyan-400 font-mono capitalize">
                        Role: {user.role}
                      </span>
                      <span className="text-sm text-text-brand font-medium">
                        {user.full_name}
                      </span>
                    </div>
                    <Link
                      href={user.role === 'admin' ? '/admin' : '/dashboard'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-lg bg-cyan-400 py-3 text-base font-semibold text-[#0A1228] w-full text-center"
                    >
                      {user.role === 'admin' ? 'Admin Panel' : 'My Portal'}
                      <GraduationCap className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="text-sm text-text-brand-muted text-center hover:text-red-400 py-1 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-center rounded-lg border border-border-brand bg-card-brand py-3 text-base font-medium text-text-brand-muted hover:text-text-brand"
                    >
                      Log In
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openRegModal();
                      }}
                      className="rounded-lg bg-cyan-400 py-3 text-base font-semibold text-[#0A1228] text-center w-full shadow-lg cursor-pointer"
                    >
                      Register Now
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
