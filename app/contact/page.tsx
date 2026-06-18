'use client';

import React, { useState } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { useApp } from '@/lib/AppContext';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ContactPage() {
  const { submitContact } = useApp();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await submitContact(formData);

    if (res.error) {
      setError(res.error);
    } else {
      setSubmitted(true);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-brand text-text-brand">
      <Navbar />

      <main className="flex-grow">
        {/* Header */}
        <section className="bg-bg-brand-darker border-b border-border-brand py-16 md:py-24 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-extrabold"
            >
              Get in <span className="text-cyan-400">Touch</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-lg text-text-brand-muted max-w-2xl mx-auto"
            >
              Have questions about our courses, schedule, or pricing? We&apos;re here to help you light your tech path.
            </motion.p>
          </div>
        </section>

        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-card-brand border border-border-brand rounded-3xl p-8 space-y-8">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-text-brand-muted uppercase tracking-widest mb-1">Phone</div>
                    <div className="font-bold">+234 903 807 0539</div>
                    <div className="text-sm text-text-brand-muted">Mon - Sat, 9am - 5pm</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-400 shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-text-brand-muted uppercase tracking-widest mb-1">Email</div>
                    <div className="font-bold">delighttechnetwork@gmail.com</div>
                    <div className="text-sm text-text-brand-muted">Typically replies within 24hrs</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-text-brand-muted uppercase tracking-widest mb-1">Academy Location</div>
                    <div className="font-bold">Cocoa House, Dugbe</div>
                    <div className="text-sm text-text-brand-muted">Ibadan, Oyo State, Nigeria</div>
                  </div>
                </div>
              </div>

              <div className="bg-card-brand border border-border-brand rounded-3xl p-8">
                <h3 className="font-bold mb-4">Follow Our Updates</h3>
                <div className="flex gap-4">
                  <a href="#" className="h-10 w-10 rounded-full bg-bg-brand border border-border-brand flex items-center justify-center text-text-brand-muted hover:text-cyan-400 hover:border-cyan-400/50 transition-all">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="h-10 w-10 rounded-full bg-bg-brand border border-border-brand flex items-center justify-center text-text-brand-muted hover:text-cyan-400 hover:border-cyan-400/50 transition-all">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="h-10 w-10 rounded-full bg-bg-brand border border-border-brand flex items-center justify-center text-text-brand-muted hover:text-cyan-400 hover:border-cyan-400/50 transition-all">
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-card-brand border border-border-brand rounded-3xl p-8 md:p-12">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-20"
                    >
                      <div className="h-20 w-20 bg-emerald-400/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10" />
                      </div>
                      <h2 className="text-3xl font-bold mb-4">Message Sent!</h2>
                      <p className="text-text-brand-muted max-w-md mx-auto mb-8">
                        Thank you for reaching out to Delight Tech Academy. Our team will review your inquiry and get back to you shortly.
                      </p>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="text-cyan-400 font-bold hover:underline"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-text-brand-muted uppercase tracking-widest">Full Name</label>
                          <input
                            required
                            type="text"
                            placeholder="e.g. John Doe"
                            value={formData.full_name}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            className="w-full bg-bg-brand border border-border-brand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-text-brand-muted uppercase tracking-widest">Email Address</label>
                          <input
                            required
                            type="email"
                            placeholder="e.g. john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-bg-brand border border-border-brand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-text-brand-muted uppercase tracking-widest">Phone Number</label>
                          <input
                            required
                            type="tel"
                            placeholder="e.g. 0903 000 0000"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-bg-brand border border-border-brand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-text-brand-muted uppercase tracking-widest">Inquiry Subject</label>
                          <select
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            className="w-full bg-bg-brand border border-border-brand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors appearance-none"
                          >
                            <option>General Inquiry</option>
                            <option>Course Admissions</option>
                            <option>Partnerships</option>
                            <option>Technical Support</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-mono text-text-brand-muted uppercase tracking-widest">Your Message</label>
                        <textarea
                          required
                          rows={6}
                          placeholder="Tell us how we can help you..."
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="w-full bg-bg-brand border border-border-brand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                        />
                      </div>

                      {error && (
                        <div className="text-red-400 text-sm font-medium p-4 bg-red-400/5 rounded-xl border border-red-400/20">
                          {error}
                        </div>
                      )}

                      <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-cyan-400 text-[#0A1228] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-300 transition-all disabled:opacity-50"
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                        <Send className="h-4 w-4" />
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="py-20 bg-bg-brand-darker">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-12">Common Questions</h2>
            <div className="space-y-4 text-left">
              {[
                { q: 'Where exactly in Cocoa House are you?', a: 'We are located on the 4th Floor of Cocoa House building, Heritage Mall side, Dugbe, Ibadan.' },
                { q: 'Do I need a laptop to start?', a: 'For Smartphone courses, only your phone is needed. For Frontend and Full Stack, a laptop is highly recommended, though we have workspace systems available.' },
                { q: 'Are your certificates recognized?', a: 'Yes, Delight Tech Academy certificates are recognized by local agencies and can be used to validate your skills for freelance contracts and job applications.' }
              ].map((faq, i) => (
                <div key={i} className="bg-bg-brand border border-border-brand p-6 rounded-2xl">
                  <h4 className="font-bold flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-cyan-400" />
                    {faq.q}
                  </h4>
                  <p className="text-sm text-text-brand-muted leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
