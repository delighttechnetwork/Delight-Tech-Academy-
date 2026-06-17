'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { MapPin, Phone, Mail, Globe, Zap, Facebook, Instagram, Linkedin } from 'lucide-react';
import DelightBulbLogo from '@/components/public/DelightBulbLogo';

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'website:subscribe-newsletter',
          payload: { email }
        })
      });
      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
        return;
      }

      const savedSubs = JSON.parse(localStorage.getItem('dta_newsletter_subs') || '[]');
      if (!savedSubs.includes(email)) {
        savedSubs.push(email);
        localStorage.setItem('dta_newsletter_subs', JSON.stringify(savedSubs));
      }
      setSubmitted(true);
      setEmail('');
    } catch {
      setErrorMsg('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-emerald-500 font-sans text-sm animate-pulse bg-emerald-500/5 px-4 py-2.5 rounded-xl border border-emerald-500/25">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
        Thank you! You have successfully subscribed to Delight Tech.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 shrink-0 relative">
      <div className="relative">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMsg) setErrorMsg('');
          }}
          className="w-full sm:w-64 md:w-80 rounded-xl border border-border-brand bg-card-brand px-4 py-3.5 text-sm text-text-brand placeholder:text-text-brand-muted focus:border-cyan-400/50 focus:outline-none transition-colors"
          required
        />
        {errorMsg && (
          <p className="absolute left-1 -bottom-5 text-[11px] text-red-500 font-medium">{errorMsg}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-[#0A1228] hover:bg-cyan-350 transition-colors cursor-pointer disabled:opacity-50"
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  );
}

export default function Footer() {
  const { openRegModal } = useApp();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-brand-darker border-t border-border-brand pt-16 pb-8 transition-colors duration-300" id="site-footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Subscription row */}
        <div className="border-b border-border-brand pb-10 mb-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <h3 className="text-lg font-bold text-text-brand flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#FFC430]" />
              Stay Lighted on Tech Updates
            </h3>
            <p className="text-sm text-text-brand-muted">
              Subscribe to the Delight Academy newsletter for future course opportunities, batch listings, and invite-only tech masterclasses.
            </p>
          </div>
          <NewsletterForm />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Grid Column */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card-brand border border-border-brand group-hover:border-cyan-400/50 transition-colors">
                <DelightBulbLogo size={28} className="text-cyan-450 group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-lg font-extrabold tracking-tight text-text-brand leading-none">
                  Delight <span className="text-cyan-400 font-medium">Tech</span>
                </span>
                <span className="text-[8px] text-[#FFC430] uppercase tracking-wider font-semibold font-mono mt-0.5">
                  Network Academy
                </span>
              </div>
            </Link>
            <p className="text-sm text-text-brand-muted leading-relaxed font-sans">
              {"\"Lighting Through Technology\""}<br/>
              {"Nigeria's premier tech and digital training school based in Ibadan, dedicated to empowering students with fully practical physical skills."}
            </p>
            <div className="flex gap-2.5 pt-2 flex-wrap text-text-brand-muted">
              {/* Social links */}
              <a 
                href="https://wa.me/2347089627177" 
                target="_blank" 
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-card-brand text-text-brand-muted hover:bg-emerald-500 hover:text-[#0A1228] border border-border-brand transition-all duration-300 transform hover:scale-105"
                title="WhatsApp Direct Link"
              >
                <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.705 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/john_adeagbo?igsh=em5zZ2ZrMnB1MWd2" 
                target="_blank" 
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-card-brand text-text-brand-muted hover:bg-[#E1306C] hover:text-white border border-border-brand transition-all duration-300 transform hover:scale-105"
                title="Instagram Profile"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61586658868551" 
                target="_blank" 
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-card-brand text-text-brand-muted hover:bg-[#1877F2] hover:text-white border border-border-brand transition-all duration-300 transform hover:scale-105"
                title="Facebook Profile"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://www.tiktok.com/@john.adeagbo?_r=1&_t=ZS-96dikz6ULh7" 
                target="_blank" 
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-card-brand text-text-brand-muted hover:bg-black hover:text-white border border-border-brand transition-all duration-300 transform hover:scale-105"
                title="TikTok Profile"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.81-.74-3.92-1.72-.11-.1-.2-.2-.3-.31v5.89c.07 2.1-.5 4.31-2.04 5.81-1.61 1.63-4.05 2.37-6.29 1.94-2.33-.41-4.43-2.18-5.12-4.47-.78-2.48-.12-5.42 1.73-7.24 1.56-1.57 3.93-2.23 6.09-1.75v4.13c-1.25-.32-2.65-.05-3.6 1.05-.23.27-.41.59-.52.94-.48 1.42.23 3.12 1.63 3.65 1.1.43 2.45.02 3-.98.11-.21.16-.45.17-.69l-.02-12.2V.02z"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/in/john-adeagbo-85182325a?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
                target="_blank" 
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-card-brand text-text-brand-muted hover:bg-[#0077B5] hover:text-white border border-border-brand transition-all duration-300 transform hover:scale-105"
                title="LinkedIn Profile"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-cyan-400 font-mono font-bold">
              Academy Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-text-brand-muted hover:text-text-brand transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-sm text-text-brand-muted hover:text-text-brand transition-colors">
                  Explore Courses
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-text-brand-muted hover:text-text-brand transition-colors">
                  About Delight Tech
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-text-brand-muted hover:text-text-brand transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => openRegModal()}
                  className="text-sm text-cyan-400 hover:text-cyan-400 transition-colors text-left font-medium cursor-pointer"
                >
                  Apply Online Now →
                </button>
              </li>
            </ul>
          </div>

          {/* Core Classes Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-cyan-400 font-mono font-bold">
              Core Curriculums
            </h3>
            <ul className="space-y-2 text-sm text-text-brand-muted">
              <li>Web Development (HTML/CSS & Frontend)</li>
              <li>Full-Stack Software Engineering</li>
              <li>Smartphone Video & Graphics Design</li>
              <li>AI Vibe Coding & Production</li>
              <li>Prompt Engineering Mastery</li>
              <li>Cyber Security Foundation</li>
            </ul>
          </div>

          {/* Contacts Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-cyan-400 font-mono font-bold">
              Ibadan Headquarters
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-text-brand-muted">
                <MapPin className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Heritage Mall, Cocoa House,<br/>
                  Dugbe, Ibadan, Oyo State, Nigeria.
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-text-brand-muted">
                <Phone className="h-4 w-4 text-cyan-400 shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:+2349038070539" className="hover:text-text-brand transition-colors">09038070539</a>
                  <a href="https://wa.me/2347089627177" className="text-xs text-green-500 flex items-center gap-1 hover:brightness-110">
                    WhatsApp: 07089627177
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-text-brand-muted">
                <Mail className="h-4 w-4 text-cyan-400 shrink-0" />
                <a href="mailto:delighttechnetwork@gmail.com" className="hover:text-text-brand transition-colors truncate">
                  delighttechnetwork@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-text-brand-muted">
                <Globe className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>delightacademy.vercel.app</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border-brand pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-text-brand-muted-darker font-mono">
          <p>© {currentYear} Delight Tech Network. All rights reserved.</p>
          <p className="mt-2 md:mt-0 text-cyan-400/80 hover:text-cyan-400 transition-colors pb-1">
            Lighting Through Technology — Ibadan Nigeria.
          </p>
        </div>
      </div>
    </footer>
  );
}
