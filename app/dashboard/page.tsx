'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { useApp } from '@/lib/AppContext';
import {
  BookOpen,
  GraduationCap,
  Award,
  Clock,
  CheckCircle2,
  ArrowRight,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Download,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function StudentDashboard() {
  const { user, logout, isLoading } = useApp();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'certificates' | 'settings'>('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'student:get-dashboard-data' })
        });
        const data = await res.json();
        if (!data.error) {
          setDashboardData(data);
        }
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setDataLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-bg-brand flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  const { enrollments = [], certificates = [] } = dashboardData || {};

  return (
    <div className="min-h-screen flex flex-col bg-bg-brand text-text-brand">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-card-brand border border-border-brand rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-400 font-bold border border-cyan-400/20">
                  {user.full_name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold truncate max-w-[140px]">{user.full_name}</h2>
                  <p className="text-xs text-text-brand-muted font-mono uppercase tracking-wider">Student ID: {user.id.split('-')[1] || '001'}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {[
                  { id: 'overview', name: 'Dashboard Overview', icon: BookOpen },
                  { id: 'courses', name: 'My Courses', icon: GraduationCap },
                  { id: 'certificates', name: 'Certificates', icon: Award },
                  { id: 'settings', name: 'Account Settings', icon: Settings },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? 'bg-cyan-400 text-[#0A1228]'
                        : 'text-text-brand-muted hover:bg-card-brand-hover hover:text-text-brand'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </button>
                ))}
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/5 transition-all mt-4"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </nav>
            </div>

            <div className="bg-gradient-to-br from-cyan-400/10 to-transparent border border-cyan-400/20 rounded-2xl p-6 hidden lg:block">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                <Award className="h-4 w-4 text-cyan-400" />
                DTA Excellence
              </h3>
              <p className="text-xs text-text-brand-muted leading-relaxed">
                Complete your course modules to earn official Delight Tech Academy certification and unlock career opportunities.
              </p>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h1 className="text-3xl font-bold">Hello, {user.full_name.split(' ')[0]}!</h1>
                      <p className="text-text-brand-muted mt-1">Welcome back to your learning dashboard.</p>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card-brand border border-border-brand p-6 rounded-2xl space-y-4">
                      <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{enrollments.length}</div>
                        <div className="text-xs text-text-brand-muted font-mono uppercase tracking-widest mt-1">Enrolled Courses</div>
                      </div>
                    </div>
                    <div className="bg-card-brand border border-border-brand p-6 rounded-2xl space-y-4">
                      <div className="h-10 w-10 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{enrollments.filter((e: any) => e.status === 'completed').length}</div>
                        <div className="text-xs text-text-brand-muted font-mono uppercase tracking-widest mt-1">Completed</div>
                      </div>
                    </div>
                    <div className="bg-card-brand border border-border-brand p-6 rounded-2xl space-y-4">
                      <div className="h-10 w-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{certificates.length}</div>
                        <div className="text-xs text-text-brand-muted font-mono uppercase tracking-widest mt-1">Certificates</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity / Enrolled List */}
                  <div className="bg-card-brand border border-border-brand rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-border-brand flex justify-between items-center">
                      <h3 className="font-bold">Active Programs</h3>
                      <button onClick={() => setActiveTab('courses')} className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                        View All <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>

                    {dataLoading ? (
                      <div className="p-20 flex justify-center">
                        <div className="h-8 w-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
                      </div>
                    ) : enrollments.length > 0 ? (
                      <div className="divide-y divide-border-brand">
                        {enrollments.map((enroll: any) => (
                          <div key={enroll.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-card-brand-hover transition-colors">
                            <div className="flex gap-4 items-center">
                              <div className="h-12 w-12 rounded-xl bg-bg-brand border border-border-brand flex items-center justify-center text-cyan-400">
                                <BookOpen className="h-6 w-6" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm md:text-base">{enroll.course_id.replace('course-', '').split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                    enroll.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-cyan-400/10 text-cyan-400'
                                  }`}>
                                    {enroll.status}
                                  </span>
                                  <span className="text-[10px] text-text-brand-muted font-mono">Enrolled {new Date(enroll.enrolled_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <button className="text-xs font-bold bg-bg-brand border border-border-brand px-4 py-2 rounded-lg hover:bg-cyan-400 hover:text-[#0A1228] transition-all flex items-center gap-2">
                                Resume Module <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <p className="text-text-brand-muted mb-6">You are not enrolled in any courses yet.</p>
                        <button
                          onClick={() => router.push('/courses')}
                          className="bg-cyan-400 text-[#0A1228] font-bold px-6 py-2.5 rounded-xl text-sm"
                        >
                          Browse Catalog
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'courses' && (
                <motion.div
                  key="courses"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold">My Courses</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enrollments.map((enroll: any) => (
                      <div key={enroll.id} className="bg-card-brand border border-border-brand rounded-2xl overflow-hidden flex flex-col hover:border-cyan-400/30 transition-all">
                        <div className="h-32 bg-bg-brand-darker flex items-center justify-center border-b border-border-brand">
                          <BookOpen className="h-10 w-10 text-cyan-400/30" />
                        </div>
                        <div className="p-6 space-y-4">
                          <div>
                            <h3 className="font-bold leading-tight">{enroll.course_id.replace('course-', '').split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}</h3>
                            <p className="text-xs text-text-brand-muted mt-1 uppercase font-mono tracking-widest">Enrolled on {new Date(enroll.enrolled_at).toLocaleDateString()}</p>
                          </div>
                          <div className="pt-4 border-t border-border-brand flex justify-between items-center">
                             <span className={`text-xs font-bold ${enroll.status === 'completed' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                               {enroll.status.toUpperCase()}
                             </span>
                             <button className="text-xs font-bold flex items-center gap-1 hover:text-cyan-400 transition-colors">
                               Go to Classroom <ExternalLink className="h-3 w-3" />
                             </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'certificates' && (
                <motion.div
                  key="certificates"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold">Earned Certificates</h2>
                  {certificates.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {certificates.map((cert: any) => (
                        <div key={cert.id} className="bg-card-brand border border-border-brand rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex gap-4 items-center">
                            <div className="h-12 w-12 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-500">
                              <Award className="h-7 w-7" />
                            </div>
                            <div>
                              <h4 className="font-bold">Certificate of Completion</h4>
                              <p className="text-xs text-text-brand-muted font-mono mt-1">Serial: {cert.unique_code}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 bg-bg-brand border border-border-brand px-4 py-2 rounded-xl text-xs font-bold hover:bg-card-brand-hover transition-all">
                              <Download className="h-3.5 w-3.5" /> Download PDF
                            </button>
                            <button className="flex items-center gap-2 bg-cyan-400 text-[#0A1228] px-4 py-2 rounded-xl text-xs font-bold hover:bg-cyan-300 transition-all">
                               Verify Link
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-card-brand border border-dashed border-border-brand rounded-3xl p-20 text-center">
                      <Award className="h-12 w-12 text-text-brand-muted mx-auto mb-4 opacity-30" />
                      <p className="text-text-brand-muted">Complete a course to earn your first certificate.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold">Profile Settings</h2>
                  <div className="bg-card-brand border border-border-brand rounded-3xl p-8 max-w-2xl">
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-text-brand-muted uppercase tracking-widest">Full Name</label>
                          <input type="text" defaultValue={user.full_name} className="w-full bg-bg-brand border border-border-brand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-text-brand-muted uppercase tracking-widest">Email Address</label>
                          <input type="email" readOnly defaultValue={user.email} className="w-full bg-bg-brand border border-border-brand rounded-xl px-4 py-3 text-sm opacity-50 cursor-not-allowed" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-text-brand-muted uppercase tracking-widest">Phone Number</label>
                        <input type="tel" defaultValue={user.phone} className="w-full bg-bg-brand border border-border-brand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors" />
                      </div>
                      <div className="pt-4">
                        <button type="button" className="bg-cyan-400 text-[#0A1228] font-bold px-8 py-3 rounded-xl text-sm hover:bg-cyan-300 transition-all">
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
