'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { Loader2, ArrowRight, Eye, EyeOff, ShieldAlert, GraduationCap } from 'lucide-react';
import DelightBulbLogo from '@/components/public/DelightBulbLogo';

export default function RegisterPage() {
  const { user, registerUser } = useApp();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto redirect if already authenticated
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

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg('Please supply all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must consist of at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('The matching passwords do not correspond.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await registerUser({
        email,
        password,
        full_name: fullName,
        phone
      });

      if (res?.error) {
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Access transmission failure. Please check your network connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A1228] select-none text-white relative">
      <div className="absolute top-1/3 left-1/3 h-72 w-72 rounded-full bg-cyan-400/5 blur-3xl" />
      <div className="absolute bottom-1/3 right-1/3 h-72 w-72 rounded-full bg-[#FFC430]/5 blur-3xl animate-pulse" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111e40] border border-cyan-400/20 group-hover:border-cyan-400/50 transition-colors">
              <DelightBulbLogo size={28} className="text-cyan-455 group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-sans text-lg font-extrabold tracking-tight text-white leading-none">
                Delight <span className="text-cyan-400 font-medium">Tech</span>
              </span>
              <span className="text-[8px] text-[#FFC430] uppercase tracking-wider font-semibold font-mono leading-none mt-0.5">
                Network Academy
              </span>
            </div>
          </Link>
          <div className="flex items-center justify-center gap-1.5 text-cyan-400 font-mono text-[9px] font-bold uppercase tracking-wider">
            <GraduationCap className="h-3.5 w-3.5 text-cyan-400" />
            Enroll as a Student Now
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white leading-tight">Create Study Account</h2>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Acquire physical coaching, interact with modules, trace progress, and download certs.
          </p>
        </div>

        {/* Form Container Card */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#111e40] bg-[#0c1630]">
          <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
            {errorMsg && (
              <div className="text-xs font-semibold p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-350 font-mono mb-1.5">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Oluwaseun Adesola"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white placeholder-gray-650 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-355 font-mono mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white placeholder-gray-650 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-355 font-mono mb-1.5">
                  WhatsApp/Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white placeholder-gray-650 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-350 font-mono mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="•••••••• (Min 6 letters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white placeholder-gray-650 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-350 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-350 font-mono mb-1.5">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white placeholder-gray-650 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3.5 text-sm font-bold text-[#0A1228] hover:bg-cyan-300 transition-all font-sans active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating study key...
                </>
              ) : (
                <>
                  Register Study Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Redirect toggle */}
        <p className="text-center text-xs text-gray-500 font-sans">
          Already registered a study account?{' '}
          <Link href="/login" className="text-cyan-400 font-semibold hover:underline">
            Log In Here →
          </Link>
        </p>

      </div>
    </div>
  );
}
