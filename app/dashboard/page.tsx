'use client';

/* eslint-disable react-hooks/purity, react-hooks/set-state-in-effect */

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { 
  Profile, 
  Enrollment, 
  StudentProgress, 
  Certificate, 
  Course, 
  CourseStage 
} from '@/lib/db-store';
import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  User, 
  LogOut, 
  CheckCircle2, 
  Circle, 
  Lock, 
  ArrowRight, 
  Download, 
  UserCircle,
  GraduationCap,
  ChevronRight,
  Menu,
  X,
  Plus,
  Loader2,
  Calendar,
  KeyRound,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DelightBulbLogo from '@/components/public/DelightBulbLogo';

import aiCourseFlyer from '@/src/assets/images/aiweb_course_flyer_1781654534533.jpg';
import smartphoneCourseFlyer from '@/src/assets/images/smartphone_course_flyer_1781654557379.jpg';
import frontendCourseFlyer from '@/src/assets/images/frontend_course_flyer_1781654572643.jpg';

// Confetti particle helper
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  speed: number;
  size: number;
}

export default function StudentDashboard() {
  const { user, courses, categories, course_stages, logout, updateProfile, refreshCatalog } = useApp();
  const router = useRouter();

  // Sidebar navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'certificates' | 'profile'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active student state compiled on Client side
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Active course study view (null if in general tab)
  const [selectedStudyCourseId, setSelectedStudyCourseId] = useState<string | null>(null);

  // Profile forms
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPass, setNewPass] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Confetti particles state
  const [confetti, setConfetti] = useState<Particle[]>([]);

  // Auth guard: check user is authenticated student
  useEffect(() => {
    if (!user && !dashboardLoading) {
      router.push('/login');
    } else if (user && user.role !== 'student') {
      router.push('/admin'); // Redirect admin accounts to admin portal
    }
  }, [user, dashboardLoading, router]);

  // Load backend student metrics
  const fetchStudentDashboardData = async () => {
    try {
      setDashboardLoading(true);
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'student:get-dashboard-data' })
      });
      const data = await res.json();
      if (!data.error) {
        setEnrollments(data.enrollments || []);
        setProgress(data.progress || []);
        setCertificates(data.certificates || []);
      }
    } catch (e) {
      console.error('Error fetching dashboard indices:', e);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchStudentDashboardData();
    } else {
      setDashboardLoading(false);
    }
  }, [user]);

  // Sync profile details on user load
  useEffect(() => {
    if (user) {
      setNewName(user.full_name);
      setNewPhone(user.phone);
    }
  }, [user]);

  // Confetti animation loop
  useEffect(() => {
    if (confetti.length > 0) {
      const interval = setInterval(() => {
        setConfetti((prev) => 
          prev
            .map((p) => ({
              ...p,
              x: p.x + Math.cos(p.angle) * p.speed,
              y: p.y + Math.sin(p.angle) * p.speed + 0.8, // gravity pulls down
              speed: p.speed * 0.98, // slow down slightly
            }))
            .filter((p) => p.y < 500 && p.x > -100 && p.x < 1200) // prune out-of-bounds
        );
      }, 30);
      return () => clearInterval(interval);
    }
  }, [confetti]);

  const triggerConfetti = () => {
    const colors = ['#00D0D7', '#FFC430', '#FF4E88', '#86EFAC', '#A2DEFF'];
    const newParticles: Particle[] = [];
    for (let i = 0; i < 150; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: 450 + Math.random() * 200,
        y: 100 + Math.random() * 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        speed: 2 + Math.random() * 6,
        size: 3 + Math.random() * 6
      });
    }
    setConfetti(newParticles);
  };

  // Student enroll process (for free class or other classes on click)
  const handleEnroll = async (courseId: string) => {
    const alreadyEnrolled = enrollments.some(e => e.course_id === courseId);
    if (alreadyEnrolled) return;

    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'student:self-enroll',
          payload: { course_id: courseId }
        })
      });
      const data = await res.json();
      if (!data.error) {
        await fetchStudentDashboardData();
        setSelectedStudyCourseId(courseId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle stage completion and check graduation
  const handleToggleStageProgress = async (enrollmentId: string, stageId: string, currentlyCompleted: boolean) => {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'student:toggle-progress',
          payload: {
            enrollment_id: enrollmentId,
            stage_id: stageId,
            completed: !currentlyCompleted
          }
        })
      });
      const data = await res.json();
      
      if (!data.error) {
        // Trigger confetti pop if certificate was issued!
        if (data.certificateIssued) {
          triggerConfetti();
        }
        await fetchStudentDashboardData();
      }
    } catch (err) {
      console.error('Error toggling progress metrics:', err);
    }
  };

  // Edit user profile details
  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await updateProfile({
        full_name: newName,
        phone: newPhone,
        password: newPass || undefined
      });

      if (res.error) {
        setProfileError(res.error);
      } else {
        setProfileSuccess('Account credentials successfully modified!');
        setNewPass('');
      }
    } catch {
      setProfileError('Failed to save details. Retry in a bit.');
    }
  };

  // Download high-resolution PNG Certificate using Canvas API
  const handleDownloadCertificateCanvas = (certUniqueCode: string, courseTitle: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1120;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw dark navy wallpaper
    ctx.fillStyle = '#0A1228';
    ctx.fillRect(0, 0, 1120, 800);

    // Decorative outer border laurels
    ctx.strokeStyle = '#FFC430'; 
    ctx.lineWidth = 12;
    ctx.strokeRect(30, 30, 1060, 740);

    ctx.strokeStyle = '#00D0D7';
    ctx.lineWidth = 3;
    ctx.strokeRect(45, 45, 1030, 710);

    // Corner decorative frames
    ctx.fillStyle = '#FFC430';
    ctx.fillRect(25, 25, 60, 12);
    ctx.fillRect(25, 25, 12, 60);

    ctx.fillRect(1035, 25, 60, 12);
    ctx.fillRect(1083, 25, 12, 60);

    ctx.fillRect(25, 763, 60, 12);
    ctx.fillRect(25, 715, 12, 60);

    ctx.fillRect(1035, 763, 60, 12);
    ctx.fillRect(1083, 715, 12, 60);

    // Delight Tech Network watermark header logos
    ctx.fillStyle = '#111e40';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('DELIGHT TECH NETWORK ACADEMY', 320, 130);

    // Golden lighting star layout
    ctx.fillStyle = '#FFC430';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('LIGHTING THROUGH TECHNOLOGY', 430, 165);

    // Certificate text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '30px Georgia';
    ctx.fillText('CERTIFICATE OF ACADEMY GRADUATION', 285, 260);

    ctx.fillStyle = '#9ca3af';
    ctx.font = 'italic 16px sans-serif';
    ctx.fillText('This is to proudly certify and acknowledge that', 390, 320);

    // Full Name typography
    ctx.fillStyle = '#00D0D7';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText(user?.full_name?.toUpperCase() || 'DELIGHT STUDENT', 320, 390);

    // Undergraduate accomplishments path
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'italic 16px sans-serif';
    ctx.fillText('has successfully completed the physical syllabus training requirements for', 290, 440);

    // Dynamic Course
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(courseTitle, 350, 490);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px sans-serif';
    ctx.fillText('held physically at our central Dugbe headquarters in Ibadan, Oyo State, Nigeria.', 310, 530);

    // Date & Unique Code split cols
    ctx.fillStyle = '#FFC430';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`VERIFIABLE ID: ${certUniqueCode}`, 150, 650);

    const matchDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillText(`ISSUED DATE: ${matchDate}`, 720, 650);

    // Coach signatures layout
    ctx.fillStyle = '#9ca3af';
    ctx.font = '13px sans-serif';
    ctx.fillText('John Adeagbo, Founder & Tech Lead', 430, 700);

    ctx.strokeStyle = '#FFC430';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(430, 680);
    ctx.lineTo(650, 680);
    ctx.stroke();

    // Export Canvas triggering standard attachment
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `DelightAcademy_Certificate_${certUniqueCode}.png`;
    link.href = dataUrl;
    link.click();
  };

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-[#0A1228] flex items-center justify-center select-none text-white font-mono">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-400 mx-auto" />
          <p className="text-xs">Authenticating student terminal registries...</p>
        </div>
      </div>
    );
  }

  // Helper variables to fetch metrics
  const activeEnrolledCount = enrollments.filter(e => e.status === 'active').length;
  const completedCoursesCount = enrollments.filter(e => e.status === 'completed').length;
  const certsEarnedCount = certificates.length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0A1228] text-white">
      
      {/* Dynamic Confetti Pop overlay canvas container */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {confetti.map((p) => (
          <div 
            key={p.id}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.size % 2 === 0 ? '50%' : '2px',
              transform: `rotate(${p.angle}rad)`
            }}
          />
        ))}
      </div>

      {/* DASHBOARD HEADER HEADER */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#111e40] bg-[#0A1228] px-4 md:px-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          <Link href="/" className="flex items-center gap-1.5 group">
            <DelightBulbLogo size={22} className="text-cyan-400 group-hover:scale-105 transition-transform shrink-0" />
            <span className="font-sans text-base font-extrabold tracking-tight">
              Delight <span className="text-cyan-400">Tech</span>
            </span>
            <span className="text-[10px] text-gray-500 font-mono hidden sm:inline select-none">| Student Portal</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end text-xs font-mono select-none">
            <span className="text-cyan-400 font-semibold">{user?.full_name}</span>
            <span className="text-gray-500 text-[10px]">{user?.email}</span>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 font-medium cursor-pointer"
            title="Log out of system"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* SIDEBAR WRAPPER PANEL */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:block w-64 shrink-0 bg-[#050a18] border-r border-[#111e40] p-6 space-y-6">
          <div className="flex items-center gap-3 p-2 border-b border-[#111e40]/40 pb-4 select-none">
            <div className="h-10 w-10 rounded-full border border-cyan-400/20 bg-[#0A1228] flex items-center justify-center select-all">
              <UserCircle className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-gray-200">{user?.full_name}</span>
              <span className="text-[10px] text-cyan-400 font-mono uppercase">Student ID: ...{user?.id?.slice(-5)}</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveTab('overview'); setSelectedStudyCourseId(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'overview' && !selectedStudyCourseId
                  ? 'bg-cyan-400 text-[#0A1228]' 
                  : 'text-gray-400 hover:bg-[#111e40] hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />
              Portal Overview
            </button>
            <button
              onClick={() => { setActiveTab('courses'); setSelectedStudyCourseId(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'courses' || selectedStudyCourseId
                  ? 'bg-cyan-400 text-[#0A1228]' 
                  : 'text-gray-400 hover:bg-[#111e40] hover:text-white'
              }`}
            >
              <BookOpen className="h-4.5 w-4.5 shrink-0" />
              My Enrolled Courses ({enrollments.length})
            </button>
            <button
              onClick={() => { setActiveTab('certificates'); setSelectedStudyCourseId(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'certificates'
                  ? 'bg-cyan-400 text-[#0A1228]' 
                  : 'text-gray-400 hover:bg-[#111e40] hover:text-white'
              }`}
            >
              <Award className="h-4.5 w-4.5 shrink-0" />
              My Certificates ({certificates.length})
            </button>
            <button
              onClick={() => { setActiveTab('profile'); setSelectedStudyCourseId(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-cyan-400 text-[#0A1228]' 
                  : 'text-gray-400 hover:bg-[#111e40] hover:text-white'
              }`}
            >
              <User className="h-4.5 w-4.5 shrink-0" />
              Settings & Profile
            </button>
          </nav>

          <div className="pt-24 select-none">
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 space-y-1 text-center text-xs text-gray-400">
              <span className="font-bold text-white block">Stuck with a class?</span>
              <p>Ping coach John Adeagbo for solutions:</p>
              <a 
                href="https://wa.me/2347089627177" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#FFC430] hover:underline font-bold mt-1.5 block font-mono"
              >
                07089627177
              </a>
            </div>
          </div>
        </aside>

        {/* MOBILE SIDEBAR DROPDOWN */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="absolute inset-y-0 left-0 z-30 w-64 bg-[#050a18] border-r border-[#111e40] p-6 space-y-6 md:hidden"
            >
              <div className="flex gap-2 items-center justify-between pb-4 border-b border-[#111e40]/70 select-none">
                <span className="text-xs font-mono font-bold text-cyan-400">Academics Navigation</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                <button
                  onClick={() => { setActiveTab('overview'); setSelectedStudyCourseId(null); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl ${
                    activeTab === 'overview' && !selectedStudyCourseId ? 'bg-cyan-400 text-[#0A1228]' : 'text-gray-400'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Portal Overview
                </button>
                <button
                  onClick={() => { setActiveTab('courses'); setSelectedStudyCourseId(null); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl ${
                    activeTab === 'courses' || selectedStudyCourseId ? 'bg-cyan-400 text-[#0A1228]' : 'text-gray-400'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  My Enrolled Courses ({enrollments.length})
                </button>
                <button
                  onClick={() => { setActiveTab('certificates'); setSelectedStudyCourseId(null); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl ${
                    activeTab === 'certificates' ? 'bg-cyan-400 text-[#0A1228]' : 'text-gray-400'
                  }`}
                >
                  <Award className="h-4 w-4" />
                  My Certificates ({certificates.length})
                </button>
                <button
                  onClick={() => { setActiveTab('profile'); setSelectedStudyCourseId(null); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl ${
                    activeTab === 'profile' ? 'bg-cyan-400 text-[#0A1228]' : 'text-gray-400'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Settings & Profile
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN CONTAINER STREAM */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8" id="dashboard-main">
          
          {/* STUDY VIEW: INDIVIDUAL INTERACTIVE COURSE SYLLABUS DIRECT PATH */}
          {selectedStudyCourseId ? (() => {
            const courseObj = courses.find(c => c.id === selectedStudyCourseId);
            const enrollmentObj = enrollments.find(e => e.course_id === selectedStudyCourseId);
            if (!courseObj || !enrollmentObj) return null;

            const stagesMatch = course_stages.filter(s => s.course_id === selectedStudyCourseId);
            const progressMatch = progress.filter(p => p.enrollment_id === enrollmentObj.id);
            const doneStagesCount = progressMatch.filter(p => p.completed).length;
            const progressPercent = stagesMatch.length > 0 
              ? Math.round((doneStagesCount / stagesMatch.length) * 100) 
              : 0;

            const certificateObj = certificates.find(c => c.enrollment_id === enrollmentObj.id);

            return (
              <div className="space-y-8 select-none font-sans">
                {/* Header breadcrumb back */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <button 
                    onClick={() => setSelectedStudyCourseId(null)}
                    className="flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 hover:underline cursor-pointer"
                  >
                    ← Back to Enrols
                  </button>
                  {enrollmentObj.status === 'completed' && (
                    <span className="flex items-center gap-1 rounded bg-[#FFC430]/10 border border-[#FFC430]/20 px-3 py-1 text-xs font-bold text-[#FFC430] font-mono animate-bounce">
                      <Award className="h-4 w-4" />
                      Syllabus Competency Unlocked
                    </span>
                  )}
                </div>

                {/* Course Header Banner */}
                <div className="rounded-2xl border border-[#111e40] bg-gradient-to-r from-[#0c1630] to-[#0A1228] p-6 sm:p-8 relative overflow-hidden">
                  <div className="relative z-10 space-y-4">
                    <span className="text-[10px] bg-[#111e40] border border-cyan-400/20 text-cyan-400 rounded-md font-mono font-bold px-2.5 py-1 uppercase select-none">
                      Active Training Modules
                    </span>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">{courseObj.title}</h2>
                      <p className="text-xs text-[#FFC430] italic font-medium mt-1">{courseObj.subtitle}</p>
                    </div>

                    {/* Progress slider bar summary */}
                    <div className="space-y-1.5 max-w-md pt-2">
                      <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                        <span>Modules Progress: {doneStagesCount} / {stagesMatch.length} done</span>
                        <span className="text-cyan-400 font-bold">{progressPercent}%</span>
                      </div>
                      <div className="h-2 w-full bg-[#111e40] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400 transition-all duration-500 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* STAGES ACCORDION VIEW CHECKLIST */}
                <div className="space-y-4" id="stages-checklist">
                  <h3 className="text-sm font-bold text-gray-300 font-mono select-none">MODULES SYLLABUS DIRECTORIES</h3>
                  
                  <div className="space-y-3">
                    {stagesMatch.map((stage) => {
                      const matchProg = progressMatch.find(p => p.stage_id === stage.id);
                      const isDone = matchProg?.completed === true;

                      return (
                        <div 
                          key={stage.id}
                          className={`rounded-xl border p-5 flex flex-col sm:flex-row items-start justify-between gap-4 transition-all ${
                            isDone 
                              ? 'bg-cyan-400/5 border-cyan-400/20' 
                              : 'bg-[#0c1630] border-[#111e40] hover:border-[#111e40]/75'
                          }`}
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-extrabold text-cyan-400 uppercase bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded">
                                Item Index: #{stage.order_index}
                              </span>
                              <h4 className={`text-sm font-semibold ${isDone ? 'text-white' : 'text-gray-200'}`}>
                                {stage.title}
                              </h4>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
                              {stage.description}
                            </p>
                          </div>

                          <button 
                            onClick={() => handleToggleStageProgress(enrollmentObj.id, stage.id, isDone)}
                            className={`w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all border active:scale-95 cursor-pointer ${
                              isDone 
                                ? 'bg-cyan-400 border-transparent text-[#0A1228]' 
                                : 'bg-transparent border-[#111e40] text-gray-400 hover:text-white hover:border-gray-500'
                            }`}
                          >
                            {isDone ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                Marked Completed
                              </>
                            ) : (
                              <>
                                <Circle className="h-4 w-4 shrink-0" />
                                Mark as Complete
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Graduation certificate triggers */}
                {progressPercent === 100 && (
                  <div className="p-6 rounded-2xl border border-[#FFC430]/30 bg-gradient-to-r from-yellow-500/5 to-cyan-400/5 text-center space-y-4">
                    <Award className="h-14 w-14 text-yellow-400 mx-auto animate-bounce" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Congratulations, {user?.full_name}!</h3>
                      <p className="text-xs text-gray-450 max-w-md mx-auto leading-relaxed mt-1">
                        You have successfully completed every stage of your curriculum program. Your authenticated digital certificate has been issued below. Print or download it to share with clients!
                      </p>
                    </div>

                    {certificateObj ? (
                      <div className="pt-2">
                        <button
                          onClick={() => handleDownloadCertificateCanvas(certificateObj.unique_code, courseObj.title)}
                          className="mx-auto rounded-xl bg-cyan-400 px-6 py-3 text-xs font-bold text-[#0A1228] hover:bg-cyan-300 transition-all shadow-lg flex items-center gap-2 select-all cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          Download Certificate — {certificateObj.unique_code}
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">Wait, configuring certificate registry logs...</p>
                    )}
                  </div>
                )}

              </div>
            );
          })() : (
            // STANDARD DIRECT TABS
            <>
              {/* TAB 1: PORTAL OVERVIEW SUMMARY */}
              {activeTab === 'overview' && (
                <div className="space-y-8 select-none">
                  {/* Summary greeting banner */}
                  <div className="rounded-2xl border border-[#111e40] bg-gradient-to-r from-[#0c1630] to-[#0A1228] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-cyan-450 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                        <GraduationCap className="h-4 w-4" />
                        Academics Desk Active
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none">
                        Welcome back, {user?.full_name}!
                      </h2>
                      <p className="text-xs text-gray-400 max-w-md">
                        Check your physical schedule rosters at Dugbe cocoa house, check progress checkboxes, and claim graduations.
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => setActiveTab('courses')}
                      className="rounded-xl bg-cyan-400 px-5  py-3 text-xs font-bold text-[#0A1228] hover:bg-cyan-300 transition-all flex items-center gap-1.5 active:scale-95 self-start md:self-center cursor-pointer"
                    >
                      Go to Study Area
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* MINI COUNTERS RACK */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="overview-counter-rack">
                    <div className="p-5 rounded-xl border border-[#111e40] bg-[#0c1630] space-y-2">
                      <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider block">Course Enrollments</span>
                      <div className="text-3xl font-extrabold text-white leading-none font-mono">{enrollments.length}</div>
                      <span className="text-[10px] text-cyan-400 block font-bold font-mono">Academic log catalogs</span>
                    </div>

                    <div className="p-5 rounded-xl border border-[#111e40] bg-[#0c1630] space-y-2">
                      <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider block">Completed Programs</span>
                      <div className="text-3xl font-extrabold text-white leading-none font-mono">{completedCoursesCount}</div>
                      <span className="text-[10px] text-[#FFC430] block font-bold font-mono">Competencies reached</span>
                    </div>

                    <div className="p-5 rounded-xl border border-[#111e40] bg-[#0c1630] space-y-2">
                      <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider block">Certificates Earned</span>
                      <div className="text-3xl font-extrabold text-white leading-none font-mono">{certsEarnedCount}</div>
                      <span className="text-[10px] text-emerald-400 block font-bold font-mono">Verifiable qualifications</span>
                    </div>
                  </div>

                  {/* ACTIVE CLASSES ROSTER IN PROGRESS */}
                  <div className="space-y-4" id="recent-academics">
                    <h3 className="text-xs font-bold text-gray-400 font-mono">RECENT ENROLLMENTS</h3>
                    
                    {enrollments.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {enrollments.map((enrol) => {
                          const courseMatch = courses.find(c => c.id === enrol.course_id);
                          if (!courseMatch) return null;

                          const courseStagesLocal = course_stages.filter(s => s.course_id === enrol.course_id);
                          const progressMatchLocal = progress.filter(p => p.enrollment_id === enrol.id && p.completed);
                          const progressPercentValue = courseStagesLocal.length > 0 
                            ? Math.round((progressMatchLocal.length / courseStagesLocal.length) * 100) 
                            : 0;

                          return (
                            <div key={enrol.id} className="rounded-xl border border-[#111e40] bg-[#0c1630] p-5 space-y-4 flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-mono">
                                  <span className="text-gray-500">ENROLLED REGISTRY</span>
                                  <span className={`px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                                    enrol.status === 'completed' ? 'bg-[#FFC430]/10 text-[#FFC430]' : 'bg-cyan-400/10 text-cyan-400'
                                  }`}>
                                    {enrol.status}
                                  </span>
                                </div>
                                <h4 className="text-base font-bold text-white leading-tight">{courseMatch.title}</h4>
                                <p className="text-xs text-gray-400 leading-relaxed font-sans">{courseMatch.subtitle}</p>
                              </div>

                              <div className="space-y-3 pt-2">
                                {/* Progress slider */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[11px] font-mono text-gray-500">
                                    <span>Stages 완료: {progressMatchLocal.length}/{courseStagesLocal.length}</span>
                                    <span>{progressPercentValue}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-[#0A1228] rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-cyan-400 rounded-full" 
                                      style={{ width: `${progressPercentValue}%` }}
                                    />
                                  </div>
                                </div>

                                <button
                                  onClick={() => setSelectedStudyCourseId(courseMatch.id)}
                                  className="w-full flex items-center justify-center gap-1 bg-[#111e40] text-cyan-400 text-xs font-bold py-2.5 rounded-lg hover:bg-cyan-400 hover:text-[#0A1228] transition-all cursor-pointer"
                                >
                                  Continue Learning Module
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-16 rounded-xl border border-dashed border-[#111e40] bg-[#0c1630] space-y-4 font-sans">
                        <BookOpen className="h-12 w-12 text-gray-500 mx-auto" />
                        <div>
                          <h4 className="text-sm font-bold text-white">No active enrollments</h4>
                          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                            Go check the full catalog classes and enroll in any of our graphics design or coding curriculums.
                          </p>
                        </div>
                        <button 
                          onClick={() => setActiveTab('courses')}
                          className="rounded-lg bg-cyan-400 px-4 py-2 text-xs font-bold text-[#0A1228] hover:bg-cyan-300 transition-all cursor-pointer"
                        >
                          Show All Available Courses
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MY ENROLLED COURSES / ADD NEW ENROL */}
              {activeTab === 'courses' && (
                <div className="space-y-8 select-none">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">My Academic Course Portal</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Below are all technological classes you have active registers inside.</p>
                    </div>
                  </div>

                  {/* Grid displays */}
                  {enrollments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {enrollments.map((enrol) => {
                        const courseMatch = courses.find(c => c.id === enrol.course_id);
                        if (!courseMatch) return null;

                        const courseStagesLocal = course_stages.filter(s => s.course_id === enrol.course_id);
                        const progressMatchLocal = progress.filter(p => p.enrollment_id === enrol.id && p.completed);
                        const progressPercentValue = courseStagesLocal.length > 0 
                          ? Math.round((progressMatchLocal.length / courseStagesLocal.length) * 100) 
                          : 0;

                        // Custom high fidelity image mapping
                        let thumbnailSrc = courseMatch.thumbnail_url || 'https://picsum.photos/seed/dtn/500/300';
                        if (courseMatch.id === 'course-ai-web') {
                          thumbnailSrc = aiCourseFlyer.src;
                        } else if (courseMatch.id === 'course-smartphone-design') {
                          thumbnailSrc = smartphoneCourseFlyer.src;
                        } else if (courseMatch.id === 'course-frontend-dev') {
                          thumbnailSrc = frontendCourseFlyer.src;
                        }

                        return (
                          <div key={enrol.id} className="rounded-xl border border-[#111e40] bg-[#0c1630] overflow-hidden group hover:border-[#111e40]/70 transition-all flex flex-col justify-between">
                            <div>
                              <div className="relative h-32 w-full bg-[#0A1228]">
                                <img 
                                  src={thumbnailSrc} 
                                  alt={courseMatch.title}
                                  className="h-full w-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                                  referrerPolicy="no-referrer"
                                />
                                <span className={`absolute top-3 right-3 text-[10px] font-bold font-mono uppercase bg-black/80 px-2 py-0.5 rounded text-cyan-400 border border-cyan-400/20`}>
                                  {enrol.status}
                                </span>
                              </div>

                              <div className="p-5 space-y-1.5">
                                <h4 className="text-base font-bold text-white leading-tight">{courseMatch.title}</h4>
                                <p className="text-[11px] text-pink-400 font-semibold">{courseMatch.duration} duration</p>
                                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mt-1 font-sans">{courseMatch.description}</p>
                              </div>
                            </div>

                            <div className="p-5 pt-0 space-y-3">
                              <div className="space-y-1 border-t border-[#111e40]/40 pt-3">
                                <div className="flex justify-between text-[11px] font-mono text-gray-500">
                                  <span>Progress Complete</span>
                                  <span>{progressPercentValue}%</span>
                                </div>
                                <div className="h-1 w-full bg-[#0A1228] rounded-full overflow-hidden">
                                  <div className="h-full bg-cyan-400" style={{ width: `${progressPercentValue}%` }} />
                                </div>
                              </div>

                              <button
                                onClick={() => setSelectedStudyCourseId(courseMatch.id)}
                                className="w-full flex items-center justify-center gap-1 bg-[#111e40] text-cyan-400 text-xs font-mono font-bold py-2.5 rounded-lg hover:bg-cyan-400 hover:text-[#0A1228] transition-all cursor-pointer"
                              >
                                Launch Study Workspace →
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 rounded-xl border border-dashed border-[#111e40] bg-[#0c1630] space-y-4 italic font-sans text-gray-450">
                      We found zero registered courses. Launch registrations above to apply.
                    </div>
                  )}

                  {/* QUICK OTHER AVAILABLE SEEDS RECOMMENDATIONS */}
                  {courses.length > enrollments.length && (
                    <div className="space-y-4" id="available-classes-enroll-list">
                      <h3 className="text-xs font-bold text-gray-400 font-mono">EXPLORE COMPANION PATHS</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses
                          .filter(course => !enrollments.some(e => e.course_id === course.id))
                          .slice(0, 3)
                          .map((course) => (
                            <div key={course.id} className="p-5 rounded-xl border border-[#111e40] bg-[#0c1630]/50 space-y-4 flex flex-col justify-between hover:border-[#111e40] transition-colors">
                              <div className="space-y-1.5">
                                <span className="text-[10px] text-[#FFC430] font-mono font-bold bg-[#FFC430]/5 border border-[#FFC430]/10 px-2 py-0.5 rounded uppercase">
                                  {course.level}
                                </span>
                                <h4 className="text-sm font-bold text-gray-200 mt-1 lines-clamp-1">{course.title}</h4>
                                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 font-sans">{course.description}</p>
                              </div>

                              <button
                                onClick={() => handleEnroll(course.id)}
                                className="w-full text-center text-xs font-mono font-bold py-2 rounded-lg bg-cyan-400/5 hover:bg-cyan-400 text-cyan-400 hover:text-[#0A1228] transition-all border border-cyan-400/10 hover:border-transparent active:scale-95 cursor-pointer"
                              >
                                Quick Enroll ({course.price === 0 ? 'FREE' : 'PAID'})
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CERTIFICATES Earned */}
              {activeTab === 'certificates' && (
                <div className="space-y-8 select-none">
                  <div>
                    <h2 className="text-xl font-bold text-white">Earned Verifiable Qualifications</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Below are all certificates issued to you upon completed course curricula milestones.</p>
                  </div>

                  {certificates.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {certificates.map((cert) => {
                        const enrollmentMatch = enrollments.find(e => e.id === cert.enrollment_id);
                        const courseMatch = courses.find(c => c.id === enrollmentMatch?.course_id);
                        if (!courseMatch) return null;

                        return (
                          <div 
                            key={cert.id} 
                            className="rounded-xl border border-cyan-400/20 bg-gradient-to-r from-cyan-400/5 to-[#0c1630] p-6 space-y-4 flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-[#FFC430] font-bold tracking-wider">DTN RECOGNITION</span>
                                <span className="text-gray-500">Verifying code: {cert.unique_code}</span>
                              </div>
                              <h3 className="text-base font-bold text-white leading-tight">{courseMatch.title}</h3>
                              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                                Issued to <span className="text-white font-medium">{user?.full_name}</span> upon satisfying cocoa house offline practical graduation tests.
                              </p>
                            </div>

                            <div className="p-3 bg-[#0A1228] rounded-lg border border-[#111e40] text-[11px] font-mono text-gray-400 flex items-center justify-between">
                              <span>Issues date: {new Date(cert.issued_at).toLocaleDateString()}</span>
                              <span className="text-cyan-400 font-bold">Passed</span>
                            </div>

                            <button
                              onClick={() => handleDownloadCertificateCanvas(cert.unique_code, courseMatch.title)}
                              className="w-full flex items-center justify-center gap-1 bg-cyan-400 text-[#0A1228] font-bold text-xs py-2.5 rounded-lg hover:bg-cyan-350 transition-all select-all active:scale-[0.98] cursor-pointer"
                            >
                              <Download className="h-4 w-4 shrink-0" />
                              Download Physical Certificate (PNG)
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-20 rounded-xl border border-dashed border-[#111e40] bg-[#0c1630]">
                      <Award className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-white">No earned certificates yet</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                        To earn your digital certificate, launch study workspace cards from inside your Enrolled list and mark all 3 stages as complete!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SETTINGS & PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-8 select-none max-w-xl">
                  <div>
                    <h2 className="text-xl font-bold text-white">Student Profile Settings</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Modify your name, active WhatsApp phone and login account password details.</p>
                  </div>

                  <div className="p-6 rounded-xl border border-[#111e40] bg-[#0c1630]">
                    <form onSubmit={handleUpdateProfileSubmit} className="space-y-4" id="profile-update-form">
                      {profileSuccess && (
                        <div className="text-xs font-semibold p-3.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg flex items-center gap-2">
                          <CheckCircle2 className="h-4.5 w-4.5" />
                          {profileSuccess}
                        </div>
                      )}
                      {profileError && (
                        <div className="text-xs font-semibold p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
                          {profileError}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-gray-300 font-mono mb-1.5">
                          Registered Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 font-mono mb-1.5">
                            Admissions Email (Immutable)
                          </label>
                          <input
                            type="text"
                            disabled
                            value={user?.email || 'N/A'}
                            className="w-full rounded-lg bg-[#0A1228]/50 border border-[#111e40] p-3 text-sm text-gray-500 cursor-not-allowed select-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 font-mono mb-1.5">
                            Active WhatsApp Number *
                          </label>
                          <input
                            type="text"
                            required
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#111e40]/70">
                        <label className="block text-xs font-medium text-gray-300 font-mono mb-1.5">
                          Change Password (Leave blank to keep unchanged)
                        </label>
                        <input
                          type="password"
                          placeholder="Type new secure pass key..."
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          className="w-full rounded-lg bg-[#0A1228] border border-[#111e40] p-3 text-sm text-white focus:border-cyan-400 focus:outline-none placeholder-gray-600"
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          className="rounded-lg bg-cyan-400 px-6 py-2.5 text-xs font-bold text-[#0A1228] hover:bg-cyan-300 transition-all cursor-pointer"
                        >
                          Modify Account Details
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}
