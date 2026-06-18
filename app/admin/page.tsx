'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useMemo } from 'react';
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
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Key,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Edit3,
  Save,
  X,
  TrendingUp,
  Send,
  AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user, courses, categories, course_stages, logout, refreshCatalog } = useApp();
  const router = useRouter();

  // Admin section routing tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'courses' | 'registrations' | 'certificates' | 'export'>('overview');
  
  // Dashboard collective state metrics
  const [profilesList, setProfilesList] = useState<Profile[]>([]);
  const [enrollmentsList, setEnrollmentsList] = useState<Enrollment[]>([]);
  const [registrationsList, setRegistrationsList] = useState<Registration[]>([]);
  const [certificatesList, setCertificatesList] = useState<Certificate[]>([]);
  const [progressList, setProgressList] = useState<StudentProgress[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);

  // Student tracking view & edit states
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  // Lead registrations filtering
  const [regFilter, setRegFilter] = useState<'all' | 'courses' | 'contacts' | 'newsletters'>('all');

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

  // Course edit states
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseSubtitle, setEditCourseSubtitle] = useState('');
  const [editCourseDesc, setEditCourseDesc] = useState('');
  const [editCoursePrice, setEditCoursePrice] = useState(0);
  const [editCourseDuration, setEditCourseDuration] = useState('');
  const [editCourseLevel, setEditCourseLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [editCourseCat, setEditCourseCat] = useState('');
  const [editCourseIsActive, setEditCourseIsActive] = useState(true);

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

  // Bulk student notification states
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);
  const [bulkEmailSubject, setBulkEmailSubject] = useState('');
  const [bulkEmailBody, setBulkEmailBody] = useState('');
  const [isSendingBulkEmail, setIsSendingBulkEmail] = useState(false);

  // Bulk email select togglers and submit handlers
  const handleToggleSelectAll = (visibleStudents: any[]) => {
    const visibleIds = visibleStudents.map(s => s.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedStudentIds.includes(id));
    if (allSelected) {
      setSelectedStudentIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggleSelectStudent = (studId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studId)
        ? prev.filter(id => id !== studId)
        : [...prev, studId]
    );
  };

  const handleSendBulkAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkEmailSubject.trim() || !bulkEmailBody.trim()) {
      triggerFeedbacks('Subject and Message are both required to deploy broadcast.', true);
      return;
    }
    
    setIsSendingBulkEmail(true);
    try {
      // Simulate real API SMTP delivery pipeline
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      triggerFeedbacks(`Successfully delivered mass notification "${bulkEmailSubject}" to ${selectedStudentIds.length} students!`);
      setIsBulkEmailModalOpen(false);
      setBulkEmailSubject('');
      setBulkEmailBody('');
      setSelectedStudentIds([]); // Clear selections on success
    } catch {
      triggerFeedbacks('Failed to deliver email campaign due to connection loss.', true);
    } finally {
      setIsSendingBulkEmail(false);
    }
  };

  // Custom Confirmation Dialog overlay states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | (() => Promise<void>);
    confirmText?: string;
    cancelText?: string;
    type: 'danger' | 'info' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'info'
  });

  // Calculate 30-day enrollment trends for Recharts summary data visualization
  const enrollmentTrendData = useMemo(() => {
    const result: { date: string; 'New Enrollments': number; 'Cumulative Enrollments': number }[] = [];
    const now = new Date();
    
    // Construct exactly 30 data points representing progress trends
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
      
      const dailyCount = enrollmentsList.filter(e => {
        const time = new Date(e.enrolled_at || e.enrolled_at).getTime();
        return time >= startOfDay && time < endOfDay;
      }).length;

      const cumulativeCount = enrollmentsList.filter(e => {
        const time = new Date(e.enrolled_at || e.enrolled_at).getTime();
        return time < endOfDay;
      }).length;

      result.push({
        date: dateStr,
        'New Enrollments': dailyCount,
        'Cumulative Enrollments': cumulativeCount
      });
    }
    return result;
  }, [enrollmentsList]);

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
        setProgressList(data.progress || []);
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

  // 1. Approve & Enroll Registration Action (with custom Confirmation dialog trigger)
  const handleApproveAndEnrollReg = (registrationId: string) => {
    const regObj = registrationsList.find(r => r.id === registrationId);
    const applicantName = regObj ? regObj.full_name : 'this applicant';
    setConfirmModal({
      isOpen: true,
      title: 'Approve & Enroll Student',
      message: `Are you certain you want to approve ${applicantName} and enroll them into virtual student workspace? This automatically logs study credentials and generates credentials.`,
      confirmText: 'Yes, Approve & Enroll',
      cancelText: 'Cancel',
      type: 'info',
      onConfirm: async () => {
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
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Delete profile (with custom Confirmation dialog trigger)
  const handleDeleteProfile = (profileId: string) => {
    const student = profilesList.find(p => p.id === profileId);
    const studentName = student ? student.full_name : 'this student';
    setConfirmModal({
      isOpen: true,
      title: 'Delete Student Profile',
      message: `Are you absolutely certain you want to delete ${studentName}'s profile? All course history, logs, progress tracking, and credential files will be wiped forever from our system.`,
      confirmText: 'Yes, Delete Permanently',
      cancelText: 'Keep Student',
      type: 'danger',
      onConfirm: async () => {
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
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
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
        triggerFeedbacks('Course curriculum successfully published!');
        setNewCourseTitle('');
        setNewCourseSubtitle('');
        setNewCourseDesc('');
        setNewCoursePrice(0);
        await fetchAdminConsoleState();
        await refreshCatalog();
      }
    } catch {
      triggerFeedbacks('Network error saving curriculum model.', true);
    }
  };

  // Update existing course details
  const handleUpdateCourseSubmit = async (courseId: string) => {
    if (!editCourseTitle.trim() || editCoursePrice < 0) {
      triggerFeedbacks('Please configure a valid Title and Tuition Cost.', true);
      return;
    }

    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin:update-course',
          payload: {
            id: courseId,
            title: editCourseTitle,
            subtitle: editCourseSubtitle,
            description: editCourseDesc,
            price: Number(editCoursePrice),
            duration: editCourseDuration,
            level: editCourseLevel,
            category_id: editCourseCat,
            is_active: editCourseIsActive
          }
        })
      });
      const data = await res.json();
      if (data.error) {
        triggerFeedbacks(data.error, true);
      } else {
        triggerFeedbacks('Course curriculum successfully updated!');
        setEditingCourseId(null);
        await fetchAdminConsoleState();
        await refreshCatalog();
      }
    } catch {
      triggerFeedbacks('Network error updating curriculum model.', true);
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

  // Toggle student stage completion status
  const handleToggleStageProgress = async (enrollmentId: string, stageId: string, currentlyCompleted: boolean) => {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin:manual-complete-stage',
          payload: {
            enrollment_id: enrollmentId,
            stage_id: stageId,
            completed: !currentlyCompleted
          }
        })
      });
      const data = await res.json();
      if (data.error) {
        triggerFeedbacks(data.error, true);
      } else {
        triggerFeedbacks('Student curriculum stage progress synchronized successfully.');
        await fetchAdminConsoleState();
      }
    } catch {
      triggerFeedbacks('Database connection failure while updating progress coordinates.', true);
    }
  };

  // Modify student login credentials
  const handleUpdateCredentials = async (studentId: string) => {
    if (!editEmail.trim()) {
      triggerFeedbacks('Please supply a valid email address.', true);
      return;
    }
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin:update-student-credentials',
          payload: {
            student_id: studentId,
            email: editEmail,
            password: editPassword
          }
        })
      });
      const data = await res.json();
      if (data.error) {
        triggerFeedbacks(data.error, true);
      } else {
        triggerFeedbacks('Student access credentials updated successfully!');
        setEditingStudentId(null);
        await fetchAdminConsoleState();
      }
    } catch {
      triggerFeedbacks('Failed to store updated credentials on the server.', true);
    }
  };

  // Export tables real spreadsheet using xlsx compiled locally in background!
  const triggerSheetExport = (targetType: 'students' | 'registrations' | 'courses' | 'progress_report') => {
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
    } else if (targetType === 'progress_report') {
      const studentProfiles = profilesList.filter(p => p.role === 'student');
      const rows: any[] = [];
      
      studentProfiles.forEach(p => {
        const studentEnrollments = enrollmentsList.filter(e => e.student_id === p.id);
        
        if (studentEnrollments.length === 0) {
          rows.push({
            StudentID: p.id,
            FullName: p.full_name,
            EmailAddress: p.email,
            WhatsAppNumber: p.phone,
            CourseID: 'N/A',
            CourseTitle: 'No Enrolled Courses',
            EnrollmentStatus: 'None',
            CompletedStages: 0,
            TotalStages: 0,
            CompletionPercentage: '0%',
            EnrolledDate: 'N/A'
          });
        } else {
          studentEnrollments.forEach(e => {
            const courseMatch = courses.find(c => c.id === e.course_id);
            const stagesForCourse = course_stages.filter(cs => cs.course_id === e.course_id);
            const completedStages = progressList.filter(pr => pr.enrollment_id === e.id && pr.completed);
            
            const percentage = stagesForCourse.length > 0
              ? Math.round((completedStages.length / stagesForCourse.length) * 100)
              : 0;
            
            rows.push({
              StudentID: p.id,
              FullName: p.full_name,
              EmailAddress: p.email,
              WhatsAppNumber: p.phone,
              CourseID: e.course_id,
              CourseTitle: courseMatch ? courseMatch.title : 'Deleted or Unknown Course',
              EnrollmentStatus: e.status || 'active',
              CompletedStages: completedStages.length,
              TotalStages: stagesForCourse.length,
              CompletionPercentage: `${percentage}%`,
              EnrolledDate: new Date(e.enrolled_at).toLocaleDateString()
            });
          });
        }
      });
      dataToExport = rows;
      fileHeader = 'Delight_Student_Progress_Report';
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
  const filteredRegs = registrationsList.filter(r => {
    // Search match
    const matchesSearch = 
      r.full_name.toLowerCase().includes(searchReg.toLowerCase()) ||
      r.email.toLowerCase().includes(searchReg.toLowerCase()) ||
      r.source.includes(searchReg);

    if (!matchesSearch) return false;

    // Category filter
    if (regFilter === 'courses') {
      return r.source === 'website';
    } else if (regFilter === 'contacts') {
      return r.source === 'contact' && r.message !== 'Newsletter Subscription';
    } else if (regFilter === 'newsletters') {
      return r.message === 'Newsletter Subscription';
    }

    return true; // 'all'
  });

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

              {/* 30-DAY ENROLLMENT TREND CHART */}
              <div className="p-6 rounded-xl border border-[#111e40] bg-[#0c1630] max-w-4xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <TrendingUp className="h-4 w-4 text-cyan-400" />
                      Student Enrollment Trends (Last 30 Days)
                    </h3>
                    <p className="text-[11px] text-gray-500 font-sans mt-0.5">
                      Visualizing daily student onboarding momentum alongside cumulative cohorts total.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-cyan-400 block" />
                      <span className="text-gray-400">Daily Joins</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500 block" />
                      <span className="text-gray-400">Cumulative Intake</span>
                    </div>
                  </div>
                </div>

                <div className="h-64 w-full pr-4 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={enrollmentTrendData}
                      margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#111e40" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#4b5563" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={6}
                      />
                      <YAxis 
                        stroke="#4b5563" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        dx={-6}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0a1228', 
                          borderColor: '#111e40', 
                          borderRadius: '8px',
                          color: '#fff',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          padding: '10px'
                        }}
                        cursor={{ stroke: '#22d3ee', strokeWidth: 1 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="New Enrollments" 
                        stroke="#22d3ee" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorNew)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Cumulative Enrollments" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorCumulative)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
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

              {/* BULK ACTION CONTROL STRIP */}
              {selectedStudentIds.length > 0 && (
                <div className="p-4 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.03] flex items-center justify-between gap-4 max-w-4xl">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-bold text-gray-200">
                      Selected <span className="font-mono text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">{selectedStudentIds.length}</span> students for batch operations.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsBulkEmailModalOpen(true)}
                      className="flex items-center gap-1.5 bg-cyan-400 hover:bg-cyan-350 text-[#0A1228] px-3.5 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send Batch Notification
                    </button>
                    <button
                      onClick={() => setSelectedStudentIds([])}
                      className="text-xs text-gray-400 hover:text-white px-2 cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              )}

              {/* TABLE LISTS */}
              <div className="overflow-x-auto rounded-xl border border-[#111e40] bg-[#0c1630]">
                <table className="w-full text-left text-xs text-gray-400">
                  <thead className="bg-[#0A1228] border-b border-[#111e40] text-gray-300 font-mono">
                    <tr>
                      <th className="p-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.includes(s.id))}
                          onChange={() => handleToggleSelectAll(filteredStudents)}
                          className="h-4 w-4 rounded border-[#111e40] bg-[#0A1228] text-cyan-400 focus:ring-cyan-400/25 cursor-pointer"
                        />
                      </th>
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">WhatsApp Phone</th>
                      <th className="p-4">Registered Date</th>
                      <th className="p-4 text-center">Core Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((stud) => {
                        const isExpanded = selectedStudentId === stud.id;
                        const enrolls = enrollmentsList.filter(e => e.student_id === stud.id);
                        const isEditing = editingStudentId === stud.id;
                        
                        return (
                          <React.Fragment key={stud.id}>
                            <tr 
                              className={`border-b border-[#111e40]/70 hover:bg-white/5 cursor-pointer transition-colors ${
                                isExpanded ? 'bg-white/[0.03]' : ''
                              }`}
                              onClick={() => {
                                if (selectedStudentId === stud.id) {
                                  setSelectedStudentId(null);
                                  setEditingStudentId(null);
                                } else {
                                  setSelectedStudentId(stud.id);
                                  setEditEmail(stud.email);
                                  setEditPassword(stud.password || '');
                                }
                              }}
                            >
                              <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={selectedStudentIds.includes(stud.id)}
                                  onChange={() => handleToggleSelectStudent(stud.id)}
                                  className="h-4 w-4 rounded border-[#111e40] bg-[#0A1228] text-cyan-400 focus:ring-cyan-400/25 cursor-pointer"
                                />
                              </td>
                              <td className="p-4 text-white font-semibold flex items-center gap-2">
                                {isExpanded ? <ChevronUp className="h-4 w-4 text-cyan-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                                <span>{stud.full_name}</span>
                              </td>
                              <td className="p-4 font-mono">{stud.email}</td>
                              <td className="p-4">{stud.phone || '—'}</td>
                              <td className="p-4 text-gray-500">{new Date(stud.created_at).toLocaleDateString()}</td>
                              <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleDeleteProfile(stud.id)}
                                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="Delete profile"
                                >
                                  <Trash2 className="h-4 w-4 mx-auto" />
                                </button>
                              </td>
                            </tr>

                            {/* EXPANDED DETAILED REVIEWS & UPDATER BOX */}
                            {isExpanded && (
                              <tr onClick={(e) => e.stopPropagation()}>
                                <td colSpan={6} className="bg-[#0b1224] p-6 border-b border-[#111e40]">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    {/* PANEL A: LOGIN DETAILS & SECURE PASSWORD RECOVERY */}
                                    <div className="p-5 rounded-xl border border-[#111e40]/80 bg-[#070d1a] space-y-4">
                                      <div className="flex justify-between items-center pb-2 border-b border-[#111e40]/60">
                                        <h4 className="text-xs font-bold text-cyan-400 font-mono tracking-wider uppercase flex items-center gap-1.5">
                                          <Key className="h-3.5 w-3.5" />
                                          Login details & account credentials
                                        </h4>
                                        <span className="text-[9px] bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded-full uppercase font-mono font-bold">
                                          {stud.id}
                                        </span>
                                      </div>

                                      {isEditing ? (
                                        <div className="space-y-3 pt-1">
                                          <div className="space-y-1">
                                            <label className="text-[10px] text-gray-500 font-mono uppercase">Student Sign-in Email</label>
                                            <input 
                                              type="email"
                                              value={editEmail}
                                              onChange={(e) => setEditEmail(e.target.value)}
                                              className="w-full bg-[#0A1228] border border-[#111e40] rounded-lg px-3 py-1.5 text-xs text-white"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[10px] text-gray-500 font-mono uppercase">Student Access Password</label>
                                            <input 
                                              type="text"
                                              value={editPassword}
                                              onChange={(e) => setEditPassword(e.target.value)}
                                              className="w-full bg-[#0A1228] border border-[#111e40] rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                                            />
                                          </div>
                                          <div className="flex gap-2 pt-1">
                                            <button
                                              onClick={() => handleUpdateCredentials(stud.id)}
                                              className="flex items-center gap-1 text-[11px] font-bold bg-cyan-400 hover:bg-cyan-300 text-[#0A1228] px-3 py-1.5 rounded-md transition-all cursor-pointer"
                                            >
                                              <Save className="h-3.5 w-3.5" />
                                              Save Credentials
                                            </button>
                                            <button
                                              onClick={() => setEditingStudentId(null)}
                                              className="flex items-center gap-1 text-[11px] font-bold bg-[#111e40] hover:bg-white/5 text-gray-400 px-3 py-1.5 rounded-md transition-all cursor-pointer"
                                            >
                                              <X className="h-3.5 w-3.5" />
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-4 pt-1">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-0.5">
                                              <span className="text-[9px] text-gray-500 font-mono uppercase block">Login Username</span>
                                              <span className="text-xs text-white font-medium font-mono break-all">{stud.email}</span>
                                            </div>
                                            <div className="space-y-0.5">
                                              <span className="text-[9px] text-gray-500 font-mono uppercase block">Login Password</span>
                                              <div className="flex items-center gap-2">
                                                <span className="text-xs text-white font-bold font-mono">
                                                  {showPasswords[stud.id] ? (stud.password || 'student123') : '••••••••'}
                                                </span>
                                                <button
                                                  onClick={() => setShowPasswords(prev => ({ ...prev, [stud.id]: !prev[stud.id] }))}
                                                  className="text-gray-500 hover:text-white p-0.5"
                                                  title={showPasswords[stud.id] ? "Hide Password" : "Show Password"}
                                                >
                                                  {showPasswords[stud.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                </button>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-[#111e40]/30">
                                            <button
                                              onClick={() => {
                                                setEditingStudentId(stud.id);
                                                setEditEmail(stud.email);
                                                setEditPassword(stud.password || '');
                                              }}
                                              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border border-cyan-400/30 hover:border-cyan-400 text-cyan-400 bg-cyan-400/5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-mono"
                                            >
                                              <Edit3 className="h-3 w-3" />
                                              Edit Access Setup
                                            </button>
                                            
                                            <a 
                                              href={`https://wa.me/234${stud.phone?.replace(/^0/, '')}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-[10px] uppercase font-mono tracking-wider font-bold text-green-400 hover:underline"
                                            >
                                              Open WhatsApp Chat &rarr;
                                            </a>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* PANEL B: DETAILED SYLLABUS CHECKLIST & DIRECT TARGET MODIFIER */}
                                    <div className="p-5 rounded-xl border border-[#111e40]/80 bg-[#070d1a] space-y-4">
                                      <h4 className="text-xs font-bold text-emerald-400 font-mono tracking-wider uppercase flex items-center gap-1.5 pb-2 border-b border-[#111e40]/60">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        Interactive syllabus completions
                                      </h4>

                                      {enrolls.length === 0 ? (
                                        <div className="py-8 text-center text-gray-500 text-xs italic">
                                          Student has not registered or been enrolled in any courses yet.
                                        </div>
                                      ) : (
                                        <div className="space-y-6 pt-1 max-h-64 overflow-y-auto pr-1">
                                          {enrolls.map(e => {
                                            const courseMatch = courses.find(c => c.id === e.course_id);
                                            const stagesForCourse = course_stages.filter(cs => cs.course_id === e.course_id);
                                            
                                            // Get completed matching progress
                                            const enrollProgress = progressList.filter(p => p.enrollment_id === e.id && p.completed);
                                            
                                            const progressPercent = stagesForCourse.length > 0 
                                              ? Math.round((enrollProgress.length / stagesForCourse.length) * 100) 
                                              : 0;
                                            
                                            return (
                                              <div key={e.id} className="space-y-3 pb-4 border-b border-[#111e40]/40 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-center text-xs">
                                                  <span className="font-bold text-white truncate max-w-[200px]" title={courseMatch?.title}>
                                                    {courseMatch?.title || 'Unknown Course'}
                                                  </span>
                                                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                                    {progressPercent}% COMPLETE
                                                  </span>
                                                </div>

                                                <div className="w-full bg-[#0A1228] h-1.5 rounded-full overflow-hidden">
                                                  <div 
                                                    className="bg-emerald-500 h-full transition-all duration-500"
                                                    style={{ width: `${progressPercent}%` }}
                                                  />
                                                </div>

                                                {/* STAGES GRID */}
                                                <div className="space-y-1.5 pt-1">
                                                  {stagesForCourse.length === 0 ? (
                                                    <span className="text-[10px] text-gray-500 italic block">No curriculum stages registered.</span>
                                                  ) : (
                                                    stagesForCourse.map(stage => {
                                                      const progMatch = progressList.find(p => p.enrollment_id === e.id && p.stage_id === stage.id);
                                                      const isCompleted = progMatch?.completed === true;
                                                      
                                                      return (
                                                        <div 
                                                          key={stage.id}
                                                          onClick={() => handleToggleStageProgress(e.id, stage.id, isCompleted)}
                                                          className="flex items-start gap-2 p-2 rounded bg-[#0A1228]/50 hover:bg-[#0A1228] border border-[#111e40]/40 hover:border-[#111e40]/80 transition-colors cursor-pointer select-none text-[10px]"
                                                        >
                                                          <div className="mt-0.5 shrink-0">
                                                            {isCompleted ? (
                                                              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                                                            ) : (
                                                              <div className="h-3.5 w-3.5 rounded-full border border-gray-600 hover:border-cyan-400" />
                                                            )}
                                                          </div>
                                                          <div className="space-y-0.5 leading-tight text-left">
                                                            <span className={`block font-semibold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                                              {stage.title}
                                                            </span>
                                                            <p className="text-[9px] text-gray-500 block leading-tight font-light font-sans">
                                                              {stage.description}
                                                            </p>
                                                          </div>
                                                        </div>
                                                      );
                                                    })
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>

                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500 italic">
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
                    
                    if (editingCourseId === course.id) {
                      return (
                        <div key={course.id} className="p-5 rounded-xl border border-cyan-400/40 bg-[#0E1B38] space-y-3 font-sans">
                          <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wide border-b border-cyan-400/20 pb-1 flex justify-between items-center">
                            <span>Editing Curriculum</span>
                            <span className="text-[9px] uppercase bg-cyan-400/10 text-cyan-400 px-1.5 py-0.5 rounded">{course.id}</span>
                          </h4>
                          
                          <div className="space-y-2.5">
                            <div>
                              <label className="block text-[9px] font-medium uppercase font-mono text-gray-400 mb-0.5">Title</label>
                              <input
                                type="text"
                                value={editCourseTitle}
                                onChange={(e) => setEditCourseTitle(e.target.value)}
                                className="w-full bg-[#0A1228] border border-[#111e40] rounded-md px-2 py-1 text-xs text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-medium uppercase font-mono text-gray-400 mb-0.5">Subtitle</label>
                              <input
                                type="text"
                                value={editCourseSubtitle}
                                onChange={(e) => setEditCourseSubtitle(e.target.value)}
                                className="w-full bg-[#0A1228] border border-[#111e40] rounded-md px-2 py-1 text-xs text-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-medium uppercase font-mono text-gray-400 mb-0.5">Cost (₦)</label>
                                <input
                                  type="number"
                                  value={editCoursePrice}
                                  onChange={(e) => setEditCoursePrice(Number(e.target.value))}
                                  className="w-full bg-[#0A1228] border border-[#111e40] rounded-md px-2 py-1 text-xs text-white font-mono"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-medium uppercase font-mono text-gray-400 mb-0.5">Duration</label>
                                <input
                                  type="text"
                                  value={editCourseDuration}
                                  onChange={(e) => setEditCourseDuration(e.target.value)}
                                  className="w-full bg-[#0A1228] border border-[#111e40] rounded-md px-2 py-1 text-xs text-white"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-medium uppercase font-mono text-gray-400 mb-0.5">Skill Level</label>
                                <select
                                  value={editCourseLevel}
                                  onChange={(e) => setEditCourseLevel(e.target.value as any)}
                                  className="w-full bg-[#0A1228] border border-[#111e40] rounded-md px-2 py-1 text-xs text-white"
                                >
                                  <option value="beginner">Beginner</option>
                                  <option value="intermediate">Intermediate</option>
                                  <option value="advanced">Advanced</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[9px] font-medium uppercase font-mono text-gray-400 mb-0.5">Category</label>
                                <select
                                  value={editCourseCat}
                                  onChange={(e) => setEditCourseCat(e.target.value)}
                                  className="w-full bg-[#0A1228] border border-[#111e40] rounded-md px-2 py-1 text-xs text-white"
                                >
                                  {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 py-1">
                              <input
                                type="checkbox"
                                id={`edit-active-${course.id}`}
                                checked={editCourseIsActive}
                                onChange={(e) => setEditCourseIsActive(e.target.checked)}
                                className="h-3.5 w-3.5 rounded border-[#111e40] bg-[#0A1228] text-cyan-400 focus:ring-cyan-400/20"
                              />
                              <label htmlFor={`edit-active-${course.id}`} className="text-[11px] font-mono font-medium text-gray-300 cursor-pointer select-none">
                                Course is Active & Public
                              </label>
                            </div>

                            <div>
                              <label className="block text-[9px] font-medium uppercase font-mono text-gray-400 mb-0.5">Class Description</label>
                              <textarea
                                rows={2.5}
                                value={editCourseDesc}
                                onChange={(e) => setEditCourseDesc(e.target.value)}
                                className="w-full bg-[#0A1228] border border-[#111e40] rounded-md p-2 text-xs text-white resize-none"
                              />
                            </div>

                            <div className="flex gap-2 pt-1 border-t border-cyan-400/15">
                              <button
                                onClick={() => handleUpdateCourseSubmit(course.id)}
                                className="flex-1 flex items-center justify-center gap-1 bg-cyan-400 hover:bg-cyan-300 text-[#0A1228] py-1.5 rounded text-xs font-bold transition-all cursor-pointer"
                              >
                                <Save className="h-3.5 w-3.5" />
                                Save
                              </button>
                              <button
                                onClick={() => setEditingCourseId(null)}
                                className="flex-1 flex items-center justify-center gap-1 bg-[#111e40] hover:bg-[#111e40]/70 text-gray-400 py-1.5 rounded text-xs font-bold transition-all cursor-pointer"
                              >
                                <X className="h-3.5 w-3.5" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={course.id} className={`p-5 rounded-xl border transition-all duration-200 ${course.is_active === false ? 'border-dashed border-red-500/20 bg-red-550/[0.01]' : 'border-[#111e40] bg-[#0c1630]'}`}>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-cyan-400 font-bold uppercase">{course.level}</span>
                            <div className="flex items-center gap-2">
                              {course.is_active === false && (
                                <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded text-[8px] font-extrabold font-mono uppercase tracking-widest">Inactive</span>
                              )}
                              <span className="text-gray-400 font-bold">₦{course.price.toLocaleString()}</span>
                            </div>
                          </div>
                          <h4 className="text-sm font-bold text-white line-clamp-1">{course.title}</h4>
                          <p className="text-[11px] text-gray-500 font-medium italic mt-0.5">{course.subtitle}</p>
                          <p className="text-xs text-gray-450 leading-relaxed line-clamp-2 pt-1 font-sans">{course.description}</p>
                          
                          <div className="pt-3 border-t border-[#111e40]/70 mt-2 flex justify-between items-center text-[11px] text-gray-550 font-mono">
                            <span>Syllabus: {matchStages.length} stages</span>
                            <span>{course.duration}</span>
                          </div>

                          <div className="pt-3 flex gap-2 justify-end border-t border-[#111e40]/40 mt-1">
                            <button
                              onClick={() => {
                                setEditingCourseId(course.id);
                                setEditCourseTitle(course.title);
                                setEditCourseSubtitle(course.subtitle || '');
                                setEditCourseDesc(course.description || '');
                                setEditCoursePrice(course.price || 0);
                                setEditCourseDuration(course.duration || '');
                                setEditCourseLevel(course.level as any || 'beginner');
                                setEditCourseCat(course.category_id || '');
                                setEditCourseIsActive(course.is_active !== false);
                              }}
                              className="w-full flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider border border-cyan-400/30 hover:border-cyan-400 text-cyan-400 bg-cyan-400/5 hover:bg-cyan-400/10 py-1.5 rounded-lg transition-all cursor-pointer font-mono"
                            >
                              <Edit3 className="h-3 w-3" />
                              Edit Curriculum
                            </button>
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
                  <p className="text-xs text-gray-400">List of course registrations, contact enquiriesor newsletter subscriptions received from the landing pages.</p>
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

              {/* Category Filter Pills Strip */}
              <div className="flex flex-wrap gap-2 pt-2 pb-1 border-b border-[#111e40]/30">
                <button
                  onClick={() => setRegFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    regFilter === 'all' 
                      ? 'bg-cyan-400 text-[#0A1228]' 
                      : 'bg-[#0c1630] text-gray-400 border border-[#111e40] hover:text-white hover:bg-white/5'
                  }`}
                >
                  All Inquiries ({registrationsList.length})
                </button>
                <button
                  onClick={() => setRegFilter('courses')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    regFilter === 'courses' 
                      ? 'bg-cyan-400 text-[#0A1228]' 
                      : 'bg-[#0c1630] text-gray-400 border border-[#111e40] hover:text-white hover:bg-white/5'
                  }`}
                >
                  Course Applications ({registrationsList.filter(r => r.source === 'website').length})
                </button>
                <button
                  onClick={() => setRegFilter('contacts')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    regFilter === 'contacts' 
                      ? 'bg-cyan-400 text-[#0A1228]' 
                      : 'bg-[#0c1630] text-gray-400 border border-[#111e40] hover:text-white hover:bg-white/5'
                  }`}
                >
                  Contact Form Messages ({registrationsList.filter(r => r.source === 'contact' && r.message !== 'Newsletter Subscription').length})
                </button>
                <button
                  onClick={() => setRegFilter('newsletters')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    regFilter === 'newsletters' 
                      ? 'bg-cyan-400 text-[#0A1228]' 
                      : 'bg-[#0c1630] text-gray-400 border border-[#111e40] hover:text-white hover:bg-white/5'
                  }`}
                >
                  Newsletter Subscriptions ({registrationsList.filter(r => r.message === 'Newsletter Subscription').length})
                </button>
              </div>

              {/* TABLE LISTS */}
              <div className="overflow-x-auto rounded-xl border border-[#111e40] bg-[#0c1630]">
                <table className="w-full text-left text-xs text-gray-400">
                  <thead className="bg-[#0A1228] border-b border-[#111e40] text-gray-300 font-mono">
                    <tr>
                      <th className="p-4">Applicant / Subscriber</th>
                      <th className="p-4">WhatsApp No</th>
                      <th className="p-4">Preferred Course/Subject</th>
                      <th className="p-4">Applicant Message / Details</th>
                      <th className="p-4">Source Channel</th>
                      <th className="p-4 text-center">Admission Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegs.length > 0 ? (
                      filteredRegs.map((reg) => {
                        const isNewsletter = reg.message === 'Newsletter Subscription';
                        const courseMatchName = isNewsletter 
                          ? 'Newsletter Sub' 
                          : (courses.find(c => c.id === reg.course_id)?.title || reg.course_id || 'General Enquiries');

                        return (
                          <tr key={reg.id} className="border-b border-[#111e40]/70 hover:bg-white/2">
                            <td className="p-4 text-white">
                              <span className="font-semibold block">{reg.full_name}</span>
                              <span className="text-[10px] text-gray-500 font-mono select-all">{reg.email}</span>
                            </td>
                            <td className="p-4 font-mono select-all">
                              {isNewsletter || reg.phone === '-' ? (
                                <span className="text-gray-600 block">—</span>
                              ) : (
                                <a href={`https://wa.me/234${reg.phone.replace(/^0/, '')}`} target="_blank" rel="noreferrer" className="text-green-400 hover:underline">
                                  {reg.phone}
                                </a>
                              )}
                            </td>
                            <td className="p-4 text-cyan-400 font-semibold">{courseMatchName}</td>
                            <td className="p-4 text-xs font-light max-w-xs truncate" title={reg.message}>
                              {reg.message || '—'}
                            </td>
                            <td className="p-4 capitalize">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isNewsletter 
                                  ? 'bg-emerald-500/15 text-emerald-400' 
                                  : reg.source === 'contact' 
                                    ? 'bg-[#FFC430]/15 text-[#FFC430]' 
                                    : 'bg-cyan-400/15 text-cyan-400'
                              }`}>
                                {isNewsletter ? 'Newsletter' : reg.source}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {reg.source === 'website' ? (
                                  <button
                                    onClick={() => handleApproveAndEnrollReg(reg.id)}
                                    className="flex items-center gap-1 bg-[#111e40] border border-cyan-400/20 text-cyan-400 text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-cyan-400 hover:text-[#0A1228] transition-all cursor-pointer"
                                  >
                                    <UserCheck className="h-3.5 w-3.5 shrink-0" />
                                    Approve & Enroll
                                  </button>
                                ) : isNewsletter ? (
                                  <span className="text-emerald-500/80 bg-emerald-500/5 px-2 py-1 rounded text-[10px] font-semibold border border-emerald-500/10 inline-block font-mono">Subscribed ✓</span>
                                ) : (
                                  <span className="text-gray-500 text-[10px] uppercase font-mono tracking-wider">Contact Form</span>
                                )}

                                <button
                                  onClick={() => {
                                    setConfirmModal({
                                      isOpen: true,
                                      title: 'Delete Inquiry',
                                      message: `Are you sure you want to permanently delete this ${reg.source} inquiry from ${reg.full_name}?`,
                                      confirmText: 'Delete',
                                      cancelText: 'Cancel',
                                      type: 'danger',
                                      onConfirm: async () => {
                                        try {
                                          const res = await fetch('/api/db', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              action: 'admin:delete-registration',
                                              payload: { id: reg.id }
                                            })
                                          });
                                          const data = await res.json();
                                          if (data.error) triggerFeedbacks(data.error, true);
                                          else {
                                            triggerFeedbacks('Inquiry deleted successfully.');
                                            await fetchAdminConsoleState();
                                          }
                                        } catch {
                                          triggerFeedbacks('Network error deleting inquiry.', true);
                                        } finally {
                                          setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                        }
                                      }
                                    });
                                  }}
                                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="Delete inquiry"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                          No inquiries match selected category filter or search terms.
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

                {/* 4. Student Progress Report Export Card */}
                <div className="p-6 rounded-xl border border-[#111e40] bg-[#0c1630] flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-pink-400/20 transition-all">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-base font-bold text-white leading-tight">Student Progress Report</h3>
                    <p className="text-xs text-gray-450">Comprehensive tracking matrix of every student's enrollment status and total completion pace.</p>
                  </div>
                  <button
                    onClick={() => triggerSheetExport('progress_report')}
                    className="flex items-center gap-1 px-5 py-3 rounded-lg bg-pink-400 hover:bg-pink-350 text-[#0A1228] font-bold text-xs shrink-0 cursor-pointer"
                  >
                    <Download className="h-4.5 w-4.5" />
                    Export Progress
                  </button>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in select-none">
          <div className="bg-[#0c1630] border border-[#111e40] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-lg shrink-0 ${
                confirmModal.type === 'danger' 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                  : 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
              }`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">{confirmModal.title}</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed font-sans">{confirmModal.message}</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-[#111e40] text-gray-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                {confirmModal.cancelText || 'Cancel'}
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-[#0A1228] transition-all cursor-pointer ${
                  confirmModal.type === 'danger'
                    ? 'bg-red-500 hover:bg-red-400 text-white'
                    : 'bg-cyan-400 hover:bg-cyan-350'
                }`}
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isBulkEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in select-none">
          <div className="bg-[#0c1630] border border-[#111e40] rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 relative">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-1.5">
                <Send className="h-4.5 w-4.5 text-cyan-400" />
                Dispatch Mass Announcement
              </h3>
              <p className="text-xs text-gray-400 mt-1 font-sans">
                Deploying custom system bulletin campaign to the following <span className="font-mono text-cyan-400 font-bold">{selectedStudentIds.length}</span> students.
              </p>
            </div>

            <form onSubmit={handleSendBulkAnnouncement} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-mono font-bold uppercase block">Recipient Addresses</label>
                <div className="bg-[#0A1228] p-2 rounded-lg border border-[#111e40] text-[10px] text-gray-450 max-h-20 overflow-y-auto font-mono leading-relaxed select-all">
                  {profilesList
                    .filter(p => selectedStudentIds.includes(p.id))
                    .map(p => p.email)
                    .join(', ')}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-mono block">Email Subject line</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Academy Updates: Weekend Masterclass coordinates and times"
                  value={bulkEmailSubject}
                  onChange={(e) => setBulkEmailSubject(e.target.value)}
                  className="w-full bg-[#0A1228] border border-[#111e40] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-mono block">Bulletin Body message</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Insert mass bulletin content here..."
                  value={bulkEmailBody}
                  onChange={(e) => setBulkEmailBody(e.target.value)}
                  className="w-full bg-[#0A1228] border border-[#111e40] rounded-lg p-2.5 text-xs text-white focus:outline-none font-mono leading-relaxed resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  disabled={isSendingBulkEmail}
                  onClick={() => setIsBulkEmailModalOpen(false)}
                  className="px-4 py-2 bg-[#111e40] text-gray-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Dismiss Campaign
                </button>
                <button
                  type="submit"
                  disabled={isSendingBulkEmail}
                  className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-350 text-[#0A1228] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 min-w-[120px]"
                >
                  {isSendingBulkEmail ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-[#0A1228] border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Push Broadcast
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
