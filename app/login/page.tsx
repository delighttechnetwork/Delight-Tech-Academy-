'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { Loader2, ArrowRight, Eye, EyeOff, ShieldAlert, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import DelightBulbLogo from '@/components/public/DelightBulbLogo';

export default function LoginPage() {
  const { user, login } = useApp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please supply both your email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(email, password);
      if (res?.error) {
        setErrorMsg(res.error);
      }
      // If success, the useEffect above will trigger the routing redirection automatically
    } catch (err: any) {
      setErrorMsg(err?.message || 'Access transmission error. Please check your internet connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A1228] select-none text-white relative">
      {/* Background glow flares */}
      <div className="absolute top-1/3 left-1/3 h-72 w-72 rounded-full bg-cyan-400/5 blur-3xl" />
      <div className="absolute bottom-1/3 right-1/3 h-72 w-72 rounded-full bg-[#FFC430]/5 blur-3xl animate-pulse" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Top brand header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#111e40] border border-cyan-400/20 group-hover:border-cyan-400/50 transition-colors">
              <DelightBulbLogo size={30} className="text-cyan-450 group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-sans text-xl font-extrabold tracking-tight text-white leading-none">
                Delight <span className="text-cyan-400 font-medium text-lg">Tech</span>
              </span>
              <span className="text-[9px] text-[#FFC430] uppercase tracking-wider font-semibold font-mono leading-none mt-1">
                Network Academy
              </span>
            </div>
          </Link>
          <div className="flex items-center justify-center gap-1.5 text-[#FFC430] font-mono text-[10px] font-bold uppercase tracking-wider">
            <Lock className="h-3 w-3 text-yellow-500" />
            Member Access Gate
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back!</h2>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Log in to continue your modules, access your grades, and download certificates.
          </p>
        </div>

        {/* Login box */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#111e40] bg-[#0c1630]/90 shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            {errorMsg && (
              <div className="text-xs font-semibold p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-300 font-mono mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="delighttechnetwork@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white placeholder-gray-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-gray-300 font-mono">
                  Your Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] text-cyan-400/80 hover:text-cyan-400 font-semibold"
                >
                  Forgot limits?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white placeholder-gray-650 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3.5 text-sm font-bold text-[#0A1228] hover:bg-cyan-300 transition-all font-sans active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Granting gate entry...
                </>
              ) : (
                <>
                  Access Portal
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Info Credentials for demo logins */}
          <div className="mt-6 pt-5 border-t border-[#111e40]/50 space-y-2 text-[11px] font-mono select-none">
            <span className="text-gray-500 block text-center">DEMO PORTAL CREDENTIALS</span>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded bg-[#0A1228] border border-cyan-400/10">
                <span className="text-cyan-400 block font-semibold leading-none mb-1">Student Account</span>
                <p className="text-gray-400 truncate">Email: student1@delight.com</p>
                <p className="text-gray-400">Pass: student123</p>
              </div>
              <div className="p-2.5 rounded bg-[#0A1228] border border-yellow-500/15">
                <span className="text-[#FFC430] block font-semibold leading-none mb-1">Admin Account</span>
                <p className="text-gray-400 truncate">Email: delighttechnetwork@gmail.com</p>
                <p className="text-gray-400">Pass: delightadmin123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Redirect sign up */}
        <p className="text-center text-xs text-gray-500 font-sans">
          {"Don't have a portal study key? "}
          <Link href="/register" className="text-cyan-400 font-semibold hover:underline">
            Register Study Account →
          </Link>
        </p>

      </div>
    </div>
  );
}
