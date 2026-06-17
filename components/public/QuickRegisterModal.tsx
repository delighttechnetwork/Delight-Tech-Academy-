'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/AppContext';
import { X, CheckCircle, Award, Loader2, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function QuickRegisterModal() {
  const { 
    isRegModalOpen, 
    closeRegModal, 
    selectedRegCourseId, 
    courses, 
    submitRegistration 
  } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [courseId, setCourseId] = useState('');
  const [message, setMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync modal pre-filled state
  useEffect(() => {
    if (isRegModalOpen) {
      setCourseId(selectedRegCourseId || (courses[0]?.id || ''));
      setFullName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setErrorMsg('');
      setSuccess(false);
    }
  }, [isRegModalOpen, selectedRegCourseId, courses]);

  if (!isRegModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !courseId) {
      setErrorMsg('Please supply all required fields marked with *');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitRegistration({
        full_name: fullName,
        email,
        phone,
        course_id: courseId,
        message
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccess(true);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Server connection timed out. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCourseObj = courses.find(c => c.id === courseId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1228]/85 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#111e40] bg-[#0c1630] p-6 sm:p-8 shadow-2xl shadow-cyan-400/10"
        >
          {/* Close Trigger */}
          <button
            onClick={closeRegModal}
            className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-[#111e40] hover:text-white transition-all cursor-pointer"
            aria-label="Close modal dialog"
          >
            <X className="h-6 w-6" />
          </button>

          {!success ? (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-1.5 text-[#FFC430] font-mono text-xs font-semibold uppercase tracking-wider mb-1">
                  <GraduationCap className="h-4 w-4 text-yellow-500" />
                  Apply Today
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Join Delight Academy
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {"Ibadan's 100% practical technology school. Build real hands-on projects."}
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 text-xs font-semibold p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" id="quick-register-form">
                <div>
                  <label className="block text-xs font-medium text-gray-300 font-mono mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adebayo Ibrahim"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
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
                      className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 font-mono mb-1.5">
                      WhatsApp/Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 07089627177"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 font-mono mb-1.5">
                    Select Your Curriculum *
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id} className="text-gray-200">
                        {course.title} — {course.price === 0 ? 'FREE' : `₦${course.price.toLocaleString()}`}
                      </option>
                    ))}
                  </select>
                </div>

                {activeCourseObj && (
                  <div className="p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/10 text-xs text-cyan-300 flex justify-between gap-4 font-mono">
                    <span>Duration: {activeCourseObj.duration}</span>
                    <span className="capitalize">Level: {activeCourseObj.level}</span>
                    <span className="font-bold text-[#FFC430]">
                      Price: {activeCourseObj.price === 0 ? 'FREE' : `₦${activeCourseObj.price.toLocaleString()}`}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-300 font-mono mb-1.5">
                    Any Message or Inquiries? (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tell us about your background or ask questions..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3.5 text-sm font-bold text-[#0A1228] hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-400/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Transmitting registration...
                      </>
                    ) : (
                      'Submit Registration'
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-cyan-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Registration Received!
              </h2>
              <div className="text-sm text-gray-400 space-y-2 max-w-sm mx-auto mb-6">
                <p>
                  Excellent choice, <span className="text-white font-medium">{fullName}</span>! You have successfully pre-registered for:
                </p>
                <div className="p-3 bg-[#0A1228] border border-cyan-400/15 rounded-lg text-xs font-semibold text-cyan-300 font-mono">
                  {activeCourseObj?.title}
                </div>
                <p>
                  Our Delight admissions desk will reach out to you via WhatsApp at <span className="text-white font-semibold font-mono">{phone}</span> within 24 hours to finalize your physical workspace activation.
                </p>
              </div>

              <button
                onClick={closeRegModal}
                className="rounded-xl border border-cyan-400 text-cyan-400 px-6 py-2.5 text-sm font-semibold hover:bg-cyan-400 hover:text-[#0A1228] transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
