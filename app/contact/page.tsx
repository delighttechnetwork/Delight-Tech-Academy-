'use client';

import React, { useState } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import QuickRegisterModal from '@/components/public/QuickRegisterModal';
import { useApp } from '@/lib/AppContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Loader2, 
  CheckCircle, 
  Send,
  Building
} from 'lucide-react';

export default function ContactPage() {
  const { submitContact } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setErrorMsg('Please supply all required fields *');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitContact({
        full_name: fullName,
        email,
        phone,
        subject,
        message
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccess(true);
        // Clear out
        setFullName('');
        setEmail('');
        setPhone('');
        setMessage('');
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Server timeout error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A1228] text-white select-none">
      <Navbar />

      {/* HEADER SECTION */}
      <section className="relative overflow-hidden py-16 md:py-20 bg-[#050a18] border-b border-[#111e40] text-center" id="contact-header">
        <div className="absolute inset-0 bg-[#00d0d7]/3 blur-3xl animate-pulse-glow" />
        <div className="relative max-w-5xl mx-auto px-4 z-10 space-y-2">
          <span className="text-[#FFC430] font-mono text-xs font-semibold uppercase tracking-wider">Get in Touch</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-1">
            Let's Start a Conversation
          </h1>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
            Have questions about physical class hours, curriculum structures, corporate coaching, or custom partnerships? Put your references below.
          </p>
        </div>
      </section>

      {/* THREE DIVISION PANEL */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Quick contact profiles (LHS 5 Columns) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <span className="text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">Direct Channels</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Academy Connections</h2>
              <p className="text-sm text-gray-400 leading-relaxed font-sans">
                You can reach John Adeagbo or the admissions administrators directly using our phone, email, or direct WhatsApp support buttons.
              </p>
            </div>

            <div className="space-y-4">
              {/* WhatsApp Card */}
              <a 
                href="https://wa.me/2347089627177" 
                target="_blank" 
                rel="noreferrer"
                className="block p-5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 hover:bg-cyan-400/10 transition-all cursor-pointer group"
              >
                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-green-500/15 text-green-400 shrink-0">
                    <MessageSquare className="h-5 w-5 fill-green-400/10" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">WhatsApp Support</h3>
                    <p className="text-xs text-green-400 font-mono font-bold mt-1">07089627177</p>
                    <p className="text-xs text-gray-500 mt-1 select-none font-sans">Click to launch direct chat conversation</p>
                  </div>
                </div>
              </a>

              {/* General Tel Card */}
              <div className="p-5 rounded-xl border border-[#111e40] bg-[#0c1630]">
                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#0A1228] border border-[#111e40] text-cyan-400 shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Call Admissions</h3>
                    <p className="text-xs text-gray-300 font-mono font-bold mt-1">09038070539</p>
                    <p className="text-xs text-gray-500 mt-1 font-sans">Physical hotline during Cocoa House study hours</p>
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div className="p-5 rounded-xl border border-[#111e40] bg-[#0c1630]">
                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#0A1228] border border-[#111e40] text-yellow-400 shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Email Address</h3>
                    <p className="text-xs text-gray-305 font-mono select-all mt-1">delighttechnetwork@gmail.com</p>
                    <p className="text-xs text-gray-504 mt-1 font-sans font-medium">Partnership inquiries and invoice receipts</p>
                  </div>
                </div>
              </div>

              {/* Map Address Pin */}
              <div className="p-5 rounded-xl border border-[#111e40]">
                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#111e40] text-emerald-400 shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Location HQ</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Heritage Mall, Cocoa House,<br/>
                      Dugbe, Ibadan, Oyo State, Nigeria.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Form Panel (RHS 7 Columns) */}
          <div className="lg:col-span-7 bg-[#0c1630] border border-[#111e40] rounded-2xl p-6 sm:p-8 shadow-xl relative">
            <div className="absolute top-4 right-4 flex h-8 items-center gap-1.5 px-3 rounded-full bg-[#0A1228] border border-[#111e40] text-[10px] font-mono text-cyan-400 select-none">
              <Building className="h-3.5 w-3.5" />
              Ibadan Workspace
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Send Us a Direct Message</h2>
              <p className="text-xs text-gray-400 mt-1">We respond to custom inquiries inside WhatsApp or email logs within 12 hours.</p>
            </div>

            {success ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle className="h-14 w-14 text-cyan-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Message Transmitted!</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed font-sans">
                  Hello! Your ticket has been logged inside our admissions database. John Adeagbo or the support team will call or ping your coordinates immediately.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="rounded-xl border border-cyan-400 text-cyan-400 px-6 py-2 text-xs font-semibold hover:bg-cyan-400 hover:text-[#0A1228] transition-all cursor-pointer"
                >
                  Create Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" id="contact-form">
                {errorMsg && (
                  <div className="text-xs font-semibold p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-300 font-mono mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Adebayo Ibrahim"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white placeholder-gray-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors animate-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 font-mono mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="adebayo@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white placeholder-gray-650 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 font-mono mb-1.5">
                      WhatsApp or Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 07089627177"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white placeholder-gray-650 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 font-mono mb-1.5">
                    Subject / Topic Category *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="General Inquiry">General Inquiry / Cocoa House Directions</option>
                    <option value="Course Registration">Apply to a Custom Course</option>
                    <option value="Partnership">Corporate Workspace & Partnerships</option>
                    <option value="Other">Other Particular Reason</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 font-mono mb-1.5">
                    Detailed Message Coordinates *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Explain your goals or ask questions about classes..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white placeholder-gray-650 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3.5 text-sm font-bold text-[#0A1228] hover:bg-cyan-350 transition-all font-sans active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Transmitting message details...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Inbox Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

      <Footer />
      <QuickRegisterModal />
    </div>
  );
}
