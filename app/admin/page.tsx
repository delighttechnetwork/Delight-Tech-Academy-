'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { 
  Profile, 
  Enrollment, 
  StudentProgress, 
  Certificate, 
  Course, 
  CourseStage, 
  Registration 
} from '@/lib/db-store';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  Award, 
  Download, 
  Plus, 
  Trash2, 
  UserCheck, 
  FileSpreadsheet, 
  CheckCircle, 
  Search, 
  Settings, 
  ClipboardList,
  GraduationCap
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminDashboard() {
  const { user, courses, categories, course_stages, logout } = useApp();
  const router = useRouter();

  // Admin section routing tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'courses' | 'registrations' | 'certificates' | 'export'>('overview');
  
  // Dashboard collective state metrics
  const [profilesList, setProfilesList] = useState<Profile[]>([]);
  const [enrollmentsList, setEnrollmentsList] = useState<Enrollment[]>([]);
  const [registrationsList, setRegistrationsList] = useState<Registration[]>([]);
  const [certificatesList, setCertificatesList] = useState<Certificate[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);

  // Search parameters per section
  const [searchStudent, setSearchStudent] = useState('');
  const [searchCourse, setSearchCourse] = useState('');
  const [searchReg, setSearchReg] = useState('');

  // Course Creator Inputs
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseSubtitle, setNewCourseSubtitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState(0);
  const [newCourseDuration, setNewCourseDuration] = useState('4 Weeks');
  const [newCourseLevel, setNewCourseLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [newCourseCat, setNewCourseCat] = useState('cat-webdev');
  const [courseStageTemplate, setCourseStageTemplate] = useState('No automatic stage');

  // Stage adding form (for courses)
  const [selectedCourseIdForStage, setSelectedCourseIdForStage] = useState('');
  const [newStageTitle, setNewStageTitle] = useState('');
  const [newStageDesc, setNewStageDesc] = useState('');
  
  // Manual Certificate Generator Form
  const [certStudentId, setCertStudentId] = useState('');
  const [certCourseId, setCertCourseId] = useState('');

  // Action status indicators
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Manual enrollment form
  const [manualProfileId, setManualProfileId] = useState('');
  const [manualCourseId, setManualCourseId] = useState('');

  // Guard access checking
  useEffect(() => {
    if (!user && !adminLoading) {
      router.push('/login');
    } else if (user && user.role !== 'admin') {
      router.push('/dashboard'); // Kick ordinary students to study panel
    }
  }, [user, adminLoading, router]);

  // General retrieval for admin indexes
  const fetchAdminConsoleState = async () => {
    try {
      setAdminLoading(true);
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'admin:get-overall-state' })
      });
      const data = await res.json();
      if (!data.error) {
        setProfilesList(data.profiles || []);
        setEnrollmentsList(data.enrollments || []);
        setRegistrationsList(data.registrations || []);
        setCertificatesList(data.certificates || []);
      }
    } catch (e) {
      console.error('Error fetching admin state registries:', e);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminConsoleState();
  }, []);

  // Display alerts duration timeout helper
  const triggerFeedbacks = (msg: string, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(''), 4500);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(''), 4500);
    }
  };

  // 1. Approve & Enroll Registration Action
  const handleApproveAndEnrollReg = async (registrationId: string) => {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin:approve-registration',
          payload: { registration_id: registrationId }
        })
      });
      const data = await res.json();
      
      if (data.error) {
        triggerFeedbacks(data.error, true);
      } else {
        triggerFeedbacks('Registration approved! Student credentials generated. Email: ' + data.generatedEmail);
        await fetchAdminConsoleState();
      }
    } catch {
      triggerFeedbacks('Network error on registration pipeline approval.', true);
    }
  };

  // Delete profile
  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you absolutely certain you want to delete this profile? All progress and enrollments will be wiped.')) return;
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin:delete-profile',
          payload: { profile_id: profileId }
        })
      });
      const data = await res.json();
      if (data.error) {
        triggerFeedbacks(data.error, true);
      } else {
        triggerFeedbacks('Profile successfully deleted.');
        await fetchAdminConsoleState();
      }
    } catch {
      triggerFeedbacks('Failure to delete profile registry.', true);
    }
  };

  // Create new active course
  const handleCreateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim() || !newCoursePrice) {
      triggerFeedbacks('Please configure a Title and Cost pricing range.', true);
      return;
    }

    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin:create-course',
          payload: {
            title: newCourseTitle,
            subtitle: newCourseSubtitle,
            description: newCourseDesc,
            price: Number(newCoursePrice),
            duration: newCourseDuration,
            level: newCourseLevel,
            category_id: newCourseCat,
            stage_template: courseStageTemplate
          }
        })
      });
      const data = await res.json();
      if (data.error) {
        triggerFeedbacks(data.error, true);
      } else {
        triggerFeedbacks('Course curriculum successfully published! Please refresh homepage catalog.');
        setNewCourseTitle('');
        setNewCourseSubtitle('');
        setNewCourseDesc('');
        setNewCoursePrice(0);
        await fetchAdminConsoleState();
      }
    } catch {
      triggerFeedbacks('Network error saving curriculum model.', true);
    }
  };

  // Add custom stage to course
  const handleAddCourseStageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseIdForStage || !newStageTitle.trim() || !newStageDesc.trim()) {
      triggerFeedbacks('Please fill out all stage parameters.', true);
      return;
    }

    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin:create-stage',
          payload: {
            course_id: selectedCourseIdForStage,
            title: newStageTitle,
            description: newStageDesc
          }
        })
      });
      const data = await res.json();
      if (data.error) {
        triggerFeedbacks(data.error, true);
      } else {
        triggerFeedbacks('New course syllabus stage created successfully!');
        setNewStageTitle('');
        setNewStageDesc('');
        await fetchAdminConsoleState();
      }
    } catch {
      triggerFeedbacks('Error posting syllabus stage item.', true);
    }
  };

  // Manual Certificate deployment
  const handleIssueManualCertificateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certStudentId || !certCourseId) {
      triggerFeedbacks('Please select a student and target course curriculum.', true);
      return;
    }

    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin:issue-certificate',
          payload: {
            student_id: certStudentId,
            course_id: certCourseId
          }
        })
      });
      const data = await res.json();
      if (data.error) {
        triggerFeedbacks(data.error, true);
      } else {
        triggerFeedbacks(`Verifiable certificate successfully created! Serial: ${data.unique_code}`);
        await fetchAdminConsoleState();
      }
    } catch {
      triggerFeedbacks('Network error publishing manual certificate credentials.', true);
    }
  };

  // Manual course enrollment
  const handleManualEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualProfileId || !manualCourseId) {
      triggerFeedbacks('Please supply both target student and course index.', true);
      return;
    }

    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'student:self-enroll',
          payload: {
            student_id: manualProfileId,
            course_id: manualCourseId
          }
        })
      });
      const data = await res.json();
      if (data.error) {
        triggerFeedbacks(data.error, true);
      } else {
        triggerFeedbacks('Student successfully enrolled into curriculum.');
        await fetchAdminConsoleState();
      }
    } catch {
      triggerFeedbacks('Error handling manual student course enrollment.', true);
    }
  };

  // Export tables real spreadsheet using xlsx compiled locally in background!
  const triggerSheetExport = (targetType: 'students' | 'registrations' | 'courses') => {
    let dataToExport: any[] = [];
    let fileHeader = '';

    if (targetType === 'students') {
      const studentProfiles = profilesList.filter(p => p.role === 'student');
      dataToExport = studentProfiles.map(p => ({
        StudentID: p.id,
        FullName: p.full_name,
        EmailAddress: p.email,
        WhatsAppNumber: p.phone,
        CreatedTimestamp: new Date(p.created_at).toLocaleString()
      }));
      fileHeader = 'Delight_Academy_Students';
    } else if (targetType === 'registrations') {
      dataToExport = registrationsList.map(r => ({
        RegID: r.id,
        FullName: r.full_name,
        Email: r.email,
        Phone: r.phone,
        PreferredCourseID: r.course_id,
        MessageInquiry: r.message,
        AdmissionSource: r.source,
        CreatedTimestamp: new Date(r.submitted_at).toLocaleString()
      }));
      fileHeader = 'Delight_Academy_Registrations';
    } else if (targetType === 'courses') {
      dataToExport = courses.map(c => ({
        CourseID: c.id,
        Title: c.title,
        Subtitle: c.subtitle,
        PricingNGN: c.price,
        DurationLength: c.duration,
        StudyLevel: c.level
      }));
      fileHeader = 'Delight_Academy_Curriculums';
    }

    if (dataToExport.length === 0) {
      triggerFeedbacks('No data coordinates available for ' + targetType + ' export.', true);
      return;
    }

    // Call XLSX native library to build workbook
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DelightReports');
    XLSX.writeFile(workbook, `${fileHeader}_${Date.now()}.xlsx`);
    triggerFeedbacks(`Exported ${dataToExport.length} logs inside Excel spreadsheet download!`);
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-[#0A1228] flex items-center justify-center text-white font-mono select-none">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin border-4 border-cyan-400 border-t-transparent rounded-full mx-auto" />
          <p className="text-xs">Connecting administrator console terminals...</p>
        </div>
      </div>
    );
  }

  // Filter students
  const filteredStudents = profilesList
    .filter(p => p.role === 'student')
    .filter(p => 
      p.full_name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      p.email.toLowerCase().includes(searchStudent.toLowerCase()) ||
      p.phone.includes(searchStudent)
    );

  // Filter active registration submissions
  const filteredRegs = registrationsList.filter(r => 
    r.full_name.toLowerCase().includes(searchReg.toLowerCase()) ||
    r.email.toLowerCase().includes(searchReg.toLowerCase()) ||
    r.source.includes(searchReg)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0A1228] text-white">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#111e40] bg-[#0A1228] px-6 select-none">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-yellow-400/10 border border-yellow-400/20">
            <Settings className="h-5 w-5 text-yellow-400" />
          </div>
          <span className="font-sans text-base font-extrabold tracking-tight">
            Delight <span className="text-cyan-400">Tech</span> — Administrative Control Tower
          </span>
        </div>

        <button 
          onClick={logout}
          className="text-xs font-mono font-bold text-red-400 border border-red-500/10 px-3.5 py-2 rounded-lg hover:bg-red-500/10"
        >
          Logout Tower
        </button>
      </header>

      {/* DASH BOARD CONTAINER GRID */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDE BAR CONTROL PANELS */}
        <aside className="w-64 shrink-0 bg-[#050a18] border-r border-[#111e40] p-6 space-y-6 hidden md:block">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 font-mono font-bold block uppercase tracking-wider select-none">Tower Operator</span>
            <span className="text-sm font-bold text-gray-200 block truncate">{user?.full_name}</span>
            <span className="text-[10px] text-[#FFC430] font-mono block">Status: Master Root Admin</span>
          </div>

          <nav className="space-y-1.5 pt-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'overview' ? 'bg-cyan-400 text-[#0A1228]' : 'text-gray-400 hover:bg-[#111e40] hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              Overview Matrix
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'students' ? 'bg-cyan-400 text-[#0A1228]' : 'text-gray-400 hover:bg-[#111e40] hover:text-white'
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              Student Catalog ({profilesList.filter(p => p.role === 'student').length})
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'courses' ? 'bg-cyan-400 text-[#0A1228]' : 'text-gray-400 hover:bg-[#111e40] hover:text-white'
              }`}
            >
              <BookOpen className="h-4.5 w-4.5" />
              Course Curriculum
            </button>

            <button
              onClick={() => setActiveTab('registrations')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'registrations' ? 'bg-cyan-400 text-[#0A1228]' : 'text-gray-400 hover:bg-[#111e40] hover:text-white'
              }`}
            >
              <ClipboardList className="h-4.5 w-4.5" />
              Inquiries & Recruits ({registrationsList.length})
            </button>

            <button
              onClick={() => setActiveTab('certificates')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'certificates' ? 'bg-cyan-400 text-[#0A1228]' : 'text-gray-400 hover:bg-[#111e40] hover:text-white'
              }`}
            >
              <Award className="h-4.5 w-4.5" />
              Issued Certificates ({certificatesList.length})
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'export' ? 'bg-cyan-400 text-[#0A1228]' : 'text-gray-400 hover:bg-[#111e40] hover:text-white'
              }`}
            >
              <FileSpreadsheet className="h-4.5 w-4.5" />
              Export Excel Sheets
            </button>
          </nav>
        </aside>

        {/* CORE WORK AREA STREAM */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8" id="admin-main">
          
          {/* Status logs */}
          {actionSuccess && (
            <div className="mb-6 text-xs font-semibold p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
              {actionSuccess}
            </div>
          )}
          {actionError && (
            <div className="mb-6 text-xs font-semibold p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
              {actionError}
            </div>
          )}

          {/* ADMIN TAB 1: DASHBOARD OVERVIEW MATRIX */}
          {activeTab === 'overview' && (
            <div className="space-y-8 select-none">
              
              <div className="rounded-2xl border border-yellow-500/25 bg-gradient-to-r from-[#0c1630] to-[#0A1228] p-6 max-w-4xl relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-1 text-[#FFC430] font-mono text-[10px] font-bold uppercase tracking-wider">
                    <ClipboardList className="h-4 w-4 text-[#FFC430]" />
                    Central Console Logs
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">Delight Academy Operating Metrics</h2>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-sm font-sans">
                    Monitor student metrics, dynamic syllabus additions, physical Cocoa House enrollment codes, and issue diplomas.
                  </p>
                </div>
              </div>

              {/* RACK STATS */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-6xl">
                <div className="p-5 rounded-xl border border-[#111e40] bg-[#0c1630] space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Active Students</span>
                  <div className="text-3xl font-extrabold font-mono text-cyan-400">{profilesList.filter(p => p.role === 'student').length}</div>
                </div>
                <div className="p-5 rounded-xl border border-[#111e40] bg-[#0c1630] space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Inquiries Submissions</span>
                  <div className="text-3xl font-extrabold font-mono text-[#FFC430]">{registrationsList.length}</div>
                </div>
                <div className="p-5 rounded-xl border border-[#111e40] bg-[#0c1630] space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Unique Courses</span>
                  <div className="text-3xl font-extrabold font-mono text-emerald-400">{courses.length}</div>
                </div>
                <div className="p-5 rounded-xl border border-[#111e40] bg-[#0c1630] space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Diplomas Issued</span>
                  <div className="text-3xl font-extrabold font-mono text-pink-400">{certificatesList.length}</div>
                </div>
              </div>

              {/* QUICK MANUAL ENROLL DIRECT BLOCK */}
              <div className="p-6 rounded-xl border border-[#111e40] bg-[#0c1630] max-w-2xl space-y-4">
                <h3 className="text-sm font-mono font-bold text-gray-300">QUICK STUDENT MANUAL ENROLLMENT</h3>
                
                <form onSubmit={handleManualEnrollSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <select
                    value={manualProfileId}
                    onChange={(e) => setManualProfileId(e.target.value)}
                    className="rounded-lg bg-[#0A1228] border border-[#111e40] p-2.5 text-xs text-white"
                  >
                    <option value="">-- Choose Student --</option>
                    {profilesList.filter(p => p.role === 'student').map(p => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>

                  <select
                    value={manualCourseId}
                    onChange={(e) => setManualCourseId(e.target.value)}
                    className="rounded-lg bg-[#0A1228] border border-[#111e40] p-2.5 text-xs text-white"
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="rounded-lg bg-cyan-400 py-2.5 text-xs font-bold text-[#0A1228] hover:bg-cyan-300 transition-colors cursor-pointer"
                  >
                    Enroll Student
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* ADMIN TAB 2: STUDENT MANAGEMENT */}
          {activeTab === 'students' && (
            <div className="space-y-6 select-none font-sans">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white uppercase font-mono text-cyan-400">STUDENT DIRECTORIES</h2>
                  <p className="text-xs text-gray-400">Inspect registered student roster list coordinates within Ibadan offline class centers.</p>
                </div>
                
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search student names, emails..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="w-full bg-[#0c1630] border border-[#111e40] rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* TABLE LISTS */}
              <div className="overflow-x-auto rounded-xl border border-[#111e40] bg-[#0c1630]">
                <table className="w-full text-left text-xs text-gray-400">
                  <thead className="bg-[#0A1228] border-b border-[#111e40] text-gray-300 font-mono">
                    <tr>
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">WhatsApp Phone</th>
                      <th className="p-4">Registered Date</th>
                      <th className="p-4 text-center">Core Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((stud) => (
                        <tr key={stud.id} className="border-b border-[#111e40]/70 hover:bg-white/2">
                          <td className="p-4 text-white font-semibold">{stud.full_name}</td>
                          <td className="p-4 font-mono">{stud.email}</td>
                          <td className="p-4">{stud.phone}</td>
                          <td className="p-4 text-gray-500">{new Date(stud.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteProfile(stud.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete profile"
                            >
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                          No student records match query search parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMIN TAB 3: COURSE & STAGES MANAGEMENT */}
          {activeTab === 'courses' && (
            <div className="space-y-10 select-none font-sans">
              
              {/* Creator split grids */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* LHS: COURSE PUBLISHER FORM */}
                <div className="p-6 rounded-2xl border border-[#111e40] bg-[#0c1630] space-y-4">
                  <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase">PUBLISH NEW CURRICULUM</h3>
                  
                  <form onSubmit={handleCreateCourseSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-medium uppercase font-mono text-gray-400 mb-1">Class Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Prompt Engineering & LLM Orchestration"
                        value={newCourseTitle}
                        onChange={(e) => setNewCourseTitle(e.target.value)}
                        className="w-full bg-[#0A1228] border border-[#111e40] rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium uppercase font-mono text-gray-400 mb-1">Class Subtitle *</label>
                      <input
                        type="text"
                        placeholder="e.g. Master the art of vibe coding to launch apps in hours"
                        value={newCourseSubtitle}
                        onChange={(e) => setNewCourseSubtitle(e.target.value)}
                        className="w-full bg-[#0A1228] border border-[#111e40] rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-medium uppercase font-mono text-gray-400 mb-1">Tuition Cost (₦ NGN) *</label>
                        <input
                          type="number"
                          required
                          value={newCoursePrice}
                          onChange={(e) => setNewCoursePrice(Number(e.target.value))}
                          className="w-full bg-[#0A1228] border border-[#111e40] rounded-lg p-2 text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium uppercase font-mono text-gray-400 mb-1">Length / Duration *</label>
                        <input
                          type="text"
                          required
                          value={newCourseDuration}
                          onChange={(e) => setNewCourseDuration(e.target.value)}
                          className="w-full bg-[#0A1228] border border-[#111e40] rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-medium uppercase font-mono text-gray-400 mb-1">Skill Class Level *</label>
                        <select
                          value={newCourseLevel}
                          onChange={(e) => setNewCourseLevel(e.target.value as any)}
                          className="w-full bg-[#0A1228]/80 border border-[#111e40] rounded-lg p-2 text-xs text-white"
                        >
                          <option value="beginner">Beginner Level</option>
                          <option value="intermediate">Intermediate Level</option>
                          <option value="advanced">Advanced Specialist</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium uppercase font-mono text-gray-400 mb-1">Academy Category *</label>
                        <select
                          value={newCourseCat}
                          onChange={(e) => setNewCourseCat(e.target.value)}
                          className="w-full bg-[#0A1228]/80 border border-[#111e40] rounded-lg p-2 text-xs text-white"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium uppercase font-mono text-gray-400 mb-1">Automatic Content Template</label>
                      <select
                        value={courseStageTemplate}
                        onChange={(e) => setCourseStageTemplate(e.target.value)}
                        className="w-full bg-[#0A1228] border border-[#111e40] rounded-lg p-2 text-xs text-white"
                      >
                        <option value="Create automatic 3 stages template">Generate Standard 3-Stage Progress Checklist</option>
                        <option value="No automatic stage">Keep blank syllabus roadmap (manual addition)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium uppercase font-mono text-gray-400 mb-1">Curriculum Outline Description *</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Detail the hand-on outputs graduates will construct..."
                        value={newCourseDesc}
                        onChange={(e) => setNewCourseDesc(e.target.value)}
                        className="w-full bg-[#0A1228] border border-[#111e40] rounded-lg p-2.5 text-xs text-white resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-cyan-400 py-3 text-xs font-bold text-[#0A1228] hover:bg-cyan-300 transition-colors cursor-pointer"
                    >
                      Publish Course Curriculum
                    </button>
                  </form>
                </div>

                {/* RHS: MODULE PROGRESS STAGE CREATOR FORM */}
                <div className="p-6 rounded-2xl border border-[#111e40] bg-[#0c1630] space-y-4">
                  <h3 className="text-sm font-mono font-bold text-yellow-400 uppercase">ADD CUSTOM MODULE PROGRESS CHECKLIST</h3>
                  
                  <form onSubmit={handleAddCourseStageSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-medium uppercase font-mono text-gray-400 mb-1">Select Target Curriculum *</label>
                      <select
                        value={selectedCourseIdForStage}
                        onChange={(e) => setSelectedCourseIdForStage(e.target.value)}
                        className="w-full bg-[#0A1228] border border-[#111e40] rounded-lg p-2.5 text-xs text-white"
                      >
                        <option value="">-- Choose Curriculum --</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium uppercase font-mono text-gray-400 mb-1">Stage Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Stage 1: Local Server Setup & HTML Boilerplate"
                        value={newStageTitle}
                        onChange={(e) => setNewStageTitle(e.target.value)}
                        className="w-full bg-[#0A1228] border border-[#111e40] rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium uppercase font-mono text-gray-400 mb-1">Stage Descriptions / Core Outcomes *</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Explain specifically what portfolio milestone satisfies completion (e.g. Write a login route)..."
                        value={newStageDesc}
                        onChange={(e) => setNewStageDesc(e.target.value)}
                        className="w-full bg-[#0A1228] border border-[#111e40] rounded-lg p-2.5 text-xs text-white resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold text-[#0A1228] hover:bg-yellow-350 transition-colors cursor-pointer"
                    >
                      Publish Module Stage Checklist
                    </button>
                  </form>
                </div>

              </div>

              {/* LIST OF PUBLISHED CURRICULUMS */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-300 font-mono uppercase">PUBLISHED CATALOG DIRECTORY ({courses.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => {
                    const matchStages = course_stages.filter(s => s.course_id === course.id);
                    return (
                      <div key={course.id} className="p-5 rounded-xl border border-[#111e40] bg-[#0c1630]">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-cyan-400 font-bold uppercase">{course.level}</span>
                            <span className="text-gray-500 font-bold">₦{course.price.toLocaleString()}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white line-clamp-1">{course.title}</h4>
                          <p className="text-[11px] text-gray-500 font-medium italic mt-0.5">{course.subtitle}</p>
                          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 pt-1 font-sans">{course.description}</p>
                          
                          <div className="pt-3 border-t border-[#111e40]/70 mt-2 flex justify-between items-center text-[11px] text-gray-550 font-mono">
                            <span>Syllabus Stages: {matchStages.length} logs</span>
                            <span>{course.duration}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ADMIN TAB 4: INQUIRIES & RECRUITS registrations */}
          {activeTab === 'registrations' && (
            <div className="space-y-6 select-none font-sans">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white uppercase font-mono text-cyan-400">INQUIRIES & RECRUITS</h2>
                  <p className="text-xs text-gray-400">List of course registrations or contact forms received from the landing pages.</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search query names..."
                    value={searchReg}
                    onChange={(e) => setSearchReg(e.target.value)}
                    className="w-full bg-[#0c1630] border border-[#111e40] rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* TABLE LISTS */}
              <div className="overflow-x-auto rounded-xl border border-[#111e40] bg-[#0c1630]">
                <table className="w-full text-left text-xs text-gray-400">
                  <thead className="bg-[#0A1228] border-b border-[#111e40] text-gray-300 font-mono">
                    <tr>
                      <th className="p-4">Applicant</th>
                      <th className="p-4">WhatsApp No</th>
                      <th className="p-4">Preferred Course/Subject</th>
                      <th className="p-4">Applicant message</th>
                      <th className="p-4">Source Channel</th>
                      <th className="p-4 text-center">Admission Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegs.length > 0 ? (
                      filteredRegs.map((reg) => {
                        const courseMatchName = courses.find(c => c.id === reg.course_id)?.title || reg.course_id || 'Delight Course';
                        return (
                          <tr key={reg.id} className="border-b border-[#111e40]/70 hover:bg-white/2">
                            <td className="p-4 text-white">
                              <span className="font-semibold block">{reg.full_name}</span>
                              <span className="text-[10px] text-gray-500 font-mono">{reg.email}</span>
                            </td>
                            <td className="p-4 font-mono select-all">
                              <a href={`https://wa.me/234${reg.phone.replace(/^0/, '')}`} target="_blank" rel="noreferrer" className="text-green-400 hover:underline">
                                {reg.phone}
                              </a>
                            </td>
                            <td className="p-4 text-cyan-400 font-semibold">{courseMatchName}</td>
                            <td className="p-4 text-xs font-light max-w-xs truncate" title={reg.message}>
                              {reg.message || '—'}
                            </td>
                            <td className="p-4 capitalize">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                reg.source === 'contact' ? 'bg-[#FFC430]/15 text-[#FFC430]' : 'bg-cyan-400/15 text-cyan-405'
                              }`}>
                                {reg.source}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {reg.source === 'website' ? (
                                <button
                                  onClick={() => handleApproveAndEnrollReg(reg.id)}
                                  className="mx-auto flex items-center gap-1 bg-[#111e40] border border-cyan-400/20 text-cyan-400 text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-cyan-400 hover:text-[#0A1228] transition-all cursor-pointer"
                                >
                                  <UserCheck className="h-3.5 w-3.5 shrink-0" />
                                  Approve & Enroll
                                </button>
                              ) : (
                                <span className="text-gray-600 block">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                          No registration inquiries received.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMIN TAB 5: MANUAL CERTIFICATES GEN */}
          {activeTab === 'certificates' && (
            <div className="space-y-6 select-none font-sans">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* MANUAL ISSUER FORM */}
                <div className="lg:col-span-1 p-6 rounded-2xl border border-[#111e40] bg-[#0c1630] space-y-4 self-start">
                  <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase">MANUALLY ISSUE GRADUATION DIPLOMA</h3>
                  
                  <form onSubmit={handleIssueManualCertificateSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-medium uppercase font-mono text-gray-400 mb-1">Select Student Profile *</label>
                      <select
                        value={certStudentId}
                        onChange={(e) => setCertStudentId(e.target.value)}
                        className="w-full bg-[#0A1228] border border-[#111e40] rounded-lg p-3 text-xs text-white"
                      >
                        <option value="">-- Choose student --</option>
                        {profilesList.filter(p => p.role === 'student').map(p => (
                          <option key={p.id} value={p.id}>{p.full_name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium uppercase font-mono text-gray-400 mb-1">Select Course Compliances *</label>
                      <select
                        value={certCourseId}
                        onChange={(e) => setCertCourseId(e.target.value)}
                        className="w-full bg-[#0A1228] border border-[#111e40] rounded-lg p-3 text-xs text-white"
                      >
                        <option value="">-- Choose curriculum --</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-normal font-sans">
                      Manually creating a certification overrides other stages validators, instantly setting enrollment progress to 100% completed status and creating a unique credentials key.
                    </p>

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-cyan-400 py-3 text-xs font-bold text-[#0A1228] hover:bg-cyan-350 transition-all cursor-pointer"
                    >
                      Issue Verifiable Certificate
                    </button>
                  </form>
                </div>

                {/* ACTIVE ISSUED TABLE INDEX (LHS 2 columns) */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold text-gray-300 font-mono uppercase">ISSUED CERTIFICATES ROSTER</h3>
                  
                  <div className="overflow-x-auto rounded-xl border border-[#111e40] bg-[#0c1630]">
                    <table className="w-full text-left text-xs text-gray-400">
                      <thead className="bg-[#0A1228] border-b border-[#111e40] text-gray-300 font-mono">
                        <tr>
                          <th className="p-4">Certificate Serial ID</th>
                          <th className="p-4">Graduating Graduate</th>
                          <th className="p-4">Course Title</th>
                          <th className="p-4">Verifiable Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {certificatesList.length > 0 ? (
                          certificatesList.map((cert) => {
                            const enrolMatch = enrollmentsList.find(e => e.id === cert.enrollment_id);
                            const studProfile = enrolMatch ? profilesList.find(p => p.id === enrolMatch.student_id) : null;
                            const courseMatch = courses.find(c => c.id === enrolMatch?.course_id || c.id === cert.unique_code.slice(13)); // Fallback path

                            return (
                              <tr key={cert.id} className="border-b border-[#111e40]/70 hover:bg-white/2">
                                <td className="p-4 font-mono font-bold text-cyan-400 select-all">{cert.unique_code}</td>
                                <td className="p-4 text-white font-semibold">{studProfile?.full_name || 'System Student'}</td>
                                <td className="p-4">{courseMatch?.title || 'System Curriculum'}</td>
                                <td className="p-4 text-gray-400">{new Date(cert.issued_at).toLocaleDateString()}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                              No graduation diplomas have been logged.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ADMIN TAB 6: EXPORT CENTER EXCEL */}
          {activeTab === 'export' && (
            <div className="space-y-8 select-none max-w-xl font-sans">
              <div>
                <h2 className="text-lg font-bold text-white uppercase font-mono text-cyan-400">SPREADSHEET EXPORT CENTER</h2>
                <p className="text-xs text-gray-400 mt-0.5">Download database registries directly inside Excel (.xlsx) spreadsheets instantly.</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                
                {/* 1. Student Export card */}
                <div className="p-6 rounded-xl border border-[#111e40] bg-[#0c1630] flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-cyan-400/20 transition-all">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-base font-bold text-white leading-tight">Student Roster Database</h3>
                    <p className="text-xs text-gray-450">Active profiles holding email keys, phone coordinates, and created logs.</p>
                  </div>
                  <button
                    onClick={() => triggerSheetExport('students')}
                    className="flex items-center gap-1 px-5 py-3 rounded-lg bg-cyan-400 hover:bg-cyan-350 text-[#0A1228] font-bold text-xs shrink-0 cursor-pointer"
                  >
                    <Download className="h-4.5 w-4.5" />
                    Export Students
                  </button>
                </div>

                {/* 2. Registrations Export card */}
                <div className="p-6 rounded-xl border border-[#111e40] bg-[#0c1630] flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-yellow-400/20 transition-all">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-base font-bold text-white leading-tight">Inquiries & Leads Master List</h3>
                    <p className="text-xs text-gray-450">Forms contacts, messages from applicants, and custom WhatsApp references.</p>
                  </div>
                  <button
                    onClick={() => triggerSheetExport('registrations')}
                    className="flex items-center gap-1 px-5 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-350 text-[#0A1228] font-bold text-xs shrink-0 cursor-pointer"
                  >
                    <Download className="h-4.5 w-4.5" />
                    Export Inquiries
                  </button>
                </div>

                {/* 3. Courses Export card */}
                <div className="p-6 rounded-xl border border-[#111e40] bg-[#0c1630] flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-emerald-400/20 transition-all">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-base font-bold text-white leading-tight">Published Curriculums Overview</h3>
                    <p className="text-xs text-gray-450">Catalog definitions containing durations indexes, level badges, and tuition costs.</p>
                  </div>
                  <button
                    onClick={() => triggerSheetExport('courses')}
                    className="flex items-center gap-1 px-5 py-3 rounded-lg bg-emerald-400 hover:bg-emerald-350 text-[#0A1228] font-bold text-xs shrink-0 cursor-pointer"
                  >
                    <Download className="h-4.5 w-4.5" />
                    Export Curriculums
                  </button>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
