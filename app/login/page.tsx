'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DelightBulbLogo from '@/components/public/DelightBulbLogo';

export default function LoginPage() {
  const { login, user, isLoading } = useApp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') router.push('/admin');
      else router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    const res = await login(email, password);

    if (res.error) {
      setError(res.error);
      setFormLoading(false);
    } else {
      // Success - useEffect will handle redirect
    }
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-bg-brand flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-brand flex flex-col md:flex-row overflow-hidden">
      {/* Left side: Branding/Visual */}
      <div className="hidden md:flex md:w-1/2 bg-bg-brand-darker relative items-center justify-center p-12 border-r border-border-brand">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/5 to-transparent pointer-events-none" />

        <div className="max-w-md relative z-10 space-y-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="h-14 w-14 rounded-2xl bg-card-brand border border-border-brand flex items-center justify-center group-hover:border-cyan-400/30 transition-all">
              <DelightBulbLogo size={36} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-text-brand">Delight <span className="text-cyan-400">Academy</span></h1>
              <p className="text-[10px] text-[#FFC430] uppercase tracking-[0.2em] font-bold font-mono">Lighting Through Technology</p>
            </div>
          </Link>

          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold leading-tight">Welcome Back to your <span className="text-cyan-400">Digital Journey.</span></h2>
            <p className="text-lg text-text-brand-muted font-light leading-relaxed">
              Log in to access your courses, track your progress, and download your earned certificates from the Delight Tech Network.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-8">
            <div className="flex items-center gap-4 bg-card-brand border border-border-brand p-4 rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Secure student & admin authentication</span>
            </div>
            <div className="flex items-center gap-4 bg-card-brand border border-border-brand p-4 rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Centralized learning portal access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-grow flex items-center justify-center p-6 md:p-12 relative">
        {/* Mobile Header */}
        <div className="absolute top-8 left-8 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <DelightBulbLogo size={28} className="text-cyan-400" />
            <span className="font-bold">Delight Academy</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="space-y-2">
            <h3 className="text-3xl font-bold">Sign In</h3>
            <p className="text-text-brand-muted text-sm">Enter your credentials to access your portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-mono text-text-brand-muted uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-brand-muted" />
                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-card-brand border border-border-brand rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-text-brand-muted uppercase tracking-widest">Password</label>
                <Link href="#" className="text-xs font-bold text-cyan-400 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-brand-muted" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-card-brand border border-border-brand rounded-xl pl-12 pr-12 py-3.5 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-brand-muted hover:text-text-brand"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-4 rounded-xl bg-red-400/5 border border-red-400/20 text-red-400 text-sm font-medium"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              disabled={formLoading}
              type="submit"
              className="w-full bg-cyan-400 text-[#0A1228] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-350 transition-all active:scale-98 disabled:opacity-50"
            >
              {formLoading ? (
                <div className="h-5 w-5 border-2 border-[#0A1228]/20 border-t-[#0A1228] rounded-full animate-spin" />
              ) : (
                <>
                  Access Portal
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-border-brand text-center space-y-4">
            <p className="text-sm text-text-brand-muted">
              {"Don't have an account yet?"}
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:underline"
            >
              Browse Courses to Register
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="pt-8 text-center">
            <p className="text-[10px] text-text-brand-muted-darker font-mono uppercase tracking-widest">
              Secured by Delight Tech Network
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
