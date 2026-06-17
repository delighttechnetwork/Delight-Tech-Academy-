import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loadDb, saveDb, Profile, Enrollment, StudentProgress, Certificate, Registration, Course, CourseStage, Category } from '@/lib/db-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    const db = loadDb();

    // Helper: get logged in user profile synchronously from request cookies
    const getSessionUser = (): Profile | null => {
      try {
        const sessionId = req.cookies.get('delight_user_id')?.value;
        if (!sessionId) return null;
        return db.profiles.find(p => p.id === sessionId) || null;
      } catch (e) {
        console.error('Error reading registration session cookies:', e);
        return null;
      }
    };

    switch (action) {
      // --- AUTH ACTIONS ---
      case 'auth:login': {
        const { email, password } = payload;
        const profile = db.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
        
        if (!profile || profile.password !== password) {
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
        }

        // Set session cookie
        const loginStore = await cookies();
        loginStore.set('delight_user_id', profile.id, {
          path: '/',
          httpOnly: true,
          secure: true,
          maxAge: 60 * 60 * 24 * 7, // 1 week
          sameSite: 'strict',
        });

        // Strip password before returning
        const { password: _, ...safeProfile } = profile as any;
        return NextResponse.json({ user: safeProfile });
      }

      case 'auth:register': {
        const { email, password, full_name, phone } = payload;
        const exists = db.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
        
        if (exists) {
          return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
        }

        const newProfile: Profile = {
          id: `user-${Date.now()}`,
          full_name,
          email,
          phone,
          role: 'student', // Register defaults to student
          password,
          created_at: new Date().toISOString()
        };

        db.profiles.push(newProfile);
        saveDb(db);

        // Auto login
        const registerStore = await cookies();
        registerStore.set('delight_user_id', newProfile.id, {
          path: '/',
          httpOnly: true,
          secure: true,
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'strict',
        });

        const { password: _, ...safeProfile } = newProfile as any;
        return NextResponse.json({ user: safeProfile });
      }

      case 'auth:me': {
        const user = getSessionUser();
        if (!user) {
          return NextResponse.json({ user: null });
        }
        const { password: _, ...safeProfile } = user as any;
        return NextResponse.json({ user: safeProfile });
      }

      case 'auth:logout': {
        const logoutStore = await cookies();
        logoutStore.set('delight_user_id', '', { path: '/', maxAge: 0 });
        return NextResponse.json({ success: true });
      }

      case 'auth:update-profile': {
        const user = getSessionUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { full_name, phone, password, avatar_url } = payload;
        const match = db.profiles.find(p => p.id === user.id);
        
        if (match) {
          if (full_name) match.full_name = full_name;
          if (phone) match.phone = phone;
          if (password) match.password = password;
          if (avatar_url) match.avatar_url = avatar_url;
          saveDb(db);
        }

        const { password: _, ...safeProfile } = match as any;
        return NextResponse.json({ user: safeProfile });
      }

      // --- PUBLIC / WEBSITE WORKFLOWS ---
      case 'website:register-course': {
        const { full_name, email, phone, course_id, message } = payload;
        const newReg: Registration = {
          id: `reg-${Date.now()}`,
          full_name,
          email,
          phone,
          course_id,
          message,
          source: 'website',
          status: 'new',
          submitted_at: new Date().toISOString()
        };

        db.registrations.unshift(newReg);
        saveDb(db);

        // Fetch course title for rich email insights
        const course = db.courses?.find(c => c.id === course_id);
        const courseTitle = course ? course.title : (course_id || 'General Admission / Custom Bundle');

        // Trigger automated mock email notification block
        console.log(`
================================================================================
📧 [AUTOMATED MOCK EMAIL NOTIFICATION FOR ADMIN]
TO: admin@delighttechnetwork.com
SUBJECT: Alert: New Student Course Registration - ${full_name}
TIMESTAMP: ${newReg.submitted_at}
--------------------------------------------------------------------------------
Hello Admin,

A digital enrollment request has been logged via the Delight Tech Landing Page.

APPLICANT REGISTRATION RECORD:
- Full Name:    ${full_name}
- Email Contact: ${email}
- Phone Mobile:  ${phone}
- Core Program:  ${courseTitle}
- Extra Notes:   ${message || 'No custom statement provided.'}

To process or assign a batch cohort for this applicant, log into your 
Delight Tech Administrative Panel:
https://delightacademy.vercel.app/admin

Best regards,
Delight Tech Network Automation Webhook
================================================================================
        `);

        return NextResponse.json({ success: true, registration: newReg });
      }

      case 'website:send-contact': {
        const { full_name, email, phone, message, subject } = payload;
        
        // Save contact message inside registrations table with source = 'contact'
        const newReg: Registration = {
          id: `reg-${Date.now()}`,
          full_name,
          email,
          phone,
          course_id: '', // Blank or general
          message: `Subject: ${subject} | Message: ${message}`,
          source: 'contact',
          status: 'new',
          submitted_at: new Date().toISOString()
        };

        db.registrations.unshift(newReg);
        saveDb(db);
        return NextResponse.json({ success: true, message: newReg });
      }

      // --- GET INITIAL CONTENT (Courses & Categories) ---
      case 'content:get-catalog': {
        return NextResponse.json({
          categories: db.categories,
          courses: db.courses,
          course_stages: db.course_stages
        });
      }

      // --- STUDENT DASHBOARD ACTIONS ---
      case 'student:get-dashboard-data': {
        const user = getSessionUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Get student's enrollments
        const enrollments = db.enrollments.filter(e => e.student_id === user.id);
        
        // Progress logs
        const enrollmentIds = enrollments.map(e => e.id);
        const progress = db.progress.filter(p => enrollmentIds.includes(p.enrollment_id));

        // Earned certificates
        const certificates = db.certificates.filter(c => enrollmentIds.includes(c.enrollment_id));

        return NextResponse.json({
          enrollments,
          progress,
          certificates
        });
      }

      case 'student:self-enroll': {
        const user = getSessionUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { course_id } = payload;

        // Verify not already enrolled
        const exists = db.enrollments.find(e => e.student_id === user.id && e.course_id === course_id);
        if (exists) {
          return NextResponse.json({ error: 'Already enrolled' });
        }

        const course = db.courses.find(c => c.id === course_id);
        if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

        const isFree = course.price === 0;
        const enrollmentId = `enroll-${Date.now()}`;
        const newEnrollment: Enrollment = {
          id: enrollmentId,
          student_id: user.id,
          course_id,
          status: 'active',
          payment_status: isFree ? 'free' : 'pending',
          enrolled_at: new Date().toISOString()
        };

        db.enrollments.push(newEnrollment);

        // Pre-create progress records for each stage in the course as uncompleted
        const stages = db.course_stages.filter(s => s.course_id === course_id);
        stages.forEach(stage => {
          db.progress.push({
            id: `prog-${Date.now()}-${stage.id}`,
            enrollment_id: enrollmentId,
            stage_id: stage.id,
            completed: false
          });
        });

        saveDb(db);
        return NextResponse.json({ enrollment: newEnrollment });
      }

      case 'student:toggle-progress': {
        const user = getSessionUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { enrollment_id, stage_id, completed } = payload;

        // Verify student owns enrollment
        const enroll = db.enrollments.find(e => e.id === enrollment_id && e.student_id === user.id);
        if (!enroll) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });

        // Update progress item
        const prog = db.progress.find(p => p.enrollment_id === enrollment_id && p.stage_id === stage_id);
        const nowStr = new Date().toISOString();

        if (prog) {
          prog.completed = completed;
          prog.completed_at = completed ? nowStr : undefined;
        } else {
          // Fallback create progress if missing
          db.progress.push({
            id: `prog-${Date.now()}`,
            enrollment_id,
            stage_id,
            completed,
            completed_at: completed ? nowStr : undefined
          });
        }

        // CHECK IF ALL STAGES OF THIS COURSE ARE COMPLETED
        const courseStages = db.course_stages.filter(s => s.course_id === enroll.course_id);
        const studentProgress = db.progress.filter(p => p.enrollment_id === enrollment_id);

        const allCompleted = courseStages.every(stage => {
          const matchProg = studentProgress.find(p => p.stage_id === stage.id);
          return matchProg?.completed === true;
        });

        let newlyCompletedCert = null;

        if (allCompleted && enroll.status === 'active') {
          // Check if certificate already exists
          const certExists = db.certificates.find(c => c.enrollment_id === enrollment_id);
          if (!certExists) {
            // Generate Certificate!
            const yearStr = new Date().getFullYear();
            // Count total issued to generate serial
            const serialNum = String(db.certificates.length + 124).padStart(5, '0');
            const uniqueCode = `DTN-${yearStr}-${serialNum}`;

            const newCert: Certificate = {
              id: `cert-${Date.now()}`,
              enrollment_id,
              issued_at: nowStr,
              unique_code: uniqueCode
            };

            db.certificates.push(newCert);
            newlyCompletedCert = newCert;

            // Mark enrollment completed
            enroll.status = 'completed';
            enroll.completed_at = nowStr;
          }
        } else if (!allCompleted && enroll.status === 'completed') {
          // Revoke status if uncompleted a module, delete matching certificate to remain correct
          enroll.status = 'active';
          enroll.completed_at = undefined;
          db.certificates = db.certificates.filter(c => c.enrollment_id !== enrollment_id);
        }

        saveDb(db);
        return NextResponse.json({
          success: true,
          enrollmentStatus: enroll.status,
          certificateIssued: newlyCompletedCert
        });
      }

      // --- ADMIN PANEL ACTIONS (GUARDED WITH ROLE ADMIN) ---
      case 'admin:get-dashboard-stats': {
        const user = getSessionUser();
        if (!user || user.role !== 'admin') {
          return NextResponse.json({ error: 'Access Denied. Admins only.' }, { status: 403 });
        }

        const totalStudents = db.profiles.filter(p => p.role === 'student').length;
        const totalEnrollments = db.enrollments.length;
        const pendingRegistrations = db.registrations.filter(r => r.status === 'new').length;
        const certificatesIssued = db.certificates.length;

        // Get list of last 10 registrations
        const recentRegistrations = db.registrations.slice(0, 10);

        // Chart 1: Enrollments per Course
        const courseEnrollmentCounts = db.courses.map(course => {
          const enrollmentCount = db.enrollments.filter(e => e.course_id === course.id).length;
          return {
            name: course.title,
            students: enrollmentCount
          };
        }).filter(item => item.students > 0 || db.courses.indexOf(db.courses.find(c => c.title === item.name)!) < 4); // Include some default courses to look nice even with low data

        // Chart 2: Registration status trends
        const registrationTrends = [
          { status: 'New', count: db.registrations.filter(r => r.status === 'new').length },
          { status: 'Contacted', count: db.registrations.filter(r => r.status === 'contacted').length },
          { status: 'Enrolled', count: db.registrations.filter(r => r.status === 'enrolled').length },
          { status: 'Rejected', count: db.registrations.filter(r => r.status === 'rejected').length }
        ];

        return NextResponse.json({
          stats: {
            totalStudents,
            totalEnrollments,
            pendingRegistrations,
            certificatesIssued
          },
          recentRegistrations,
          charts: {
            courseEnrollments: courseEnrollmentCounts,
            registrationTrends
          }
        });
      }

      case 'admin:get-students-data': {
        const user = getSessionUser();
        if (!user || user.role !== 'admin') {
          return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
        }

        // Return list of all student accounts
        const students = db.profiles.filter(p => p.role === 'student');
        
        // Compile matching details: enrollments, progress, and certificates per student
        const studentsWithDetails = students.map(student => {
          const enrollments = db.enrollments.filter(e => e.student_id === student.id).map(enroll => {
            const course = db.courses.find(c => c.id === enroll.course_id);
            const stagesForCourse = db.course_stages.filter(s => s.course_id === enroll.course_id);
            const doneProgress = db.progress.filter(p => p.enrollment_id === enroll.id && p.completed);
            
            const progressPercent = stagesForCourse.length > 0 
              ? Math.round((doneProgress.length / stagesForCourse.length) * 100) 
              : 0;

            const cert = db.certificates.find(c => c.enrollment_id === enroll.id);

            return {
              ...enroll,
              course_title: course?.title || 'Unknown Course',
              price: course?.price || 0,
              progress_percent: progressPercent,
              certificate_code: cert?.unique_code
            };
          });

          return {
            ...student,
            enrollments
          };
        });

        return NextResponse.json({ students: studentsWithDetails });
      }

      case 'admin:toggle-student-status': {
        const user = getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { student_id, actionType } = payload; // actionType: 'suspend' | 'activate'
        
        const enrolls = db.enrollments.filter(e => e.student_id === student_id);
        enrolls.forEach(e => {
          if (actionType === 'suspend') {
            e.status = 'suspended';
          } else {
            e.status = 'active';
          }
        });

        saveDb(db);
        return NextResponse.json({ success: true });
      }

      case 'admin:manual-complete-stage': {
        const user = getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { enrollment_id, stage_id, completed } = payload;
        const nowStr = new Date().toISOString();

        // 1. Get or create progress check
        const progIndex = db.progress.findIndex(p => p.enrollment_id === enrollment_id && p.stage_id === stage_id);
        if (progIndex > -1) {
          db.progress[progIndex].completed = completed;
          db.progress[progIndex].completed_at = completed ? nowStr : undefined;
        } else {
          db.progress.push({
            id: `prog-${Date.now()}`,
            enrollment_id,
            stage_id,
            completed,
            completed_at: completed ? nowStr : undefined
          });
        }

        // 2. Check if all courses completed
        const enroll = db.enrollments.find(e => e.id === enrollment_id);
        if (enroll) {
          const courseStages = db.course_stages.filter(s => s.course_id === enroll.course_id);
          const studentProgress = db.progress.filter(p => p.enrollment_id === enrollment_id);

          const allCompleted = courseStages.every(stage => {
            const matchProg = studentProgress.find(p => p.stage_id === stage.id);
            return matchProg?.completed === true;
          });

          if (allCompleted && enroll.status !== 'completed') {
            const yearStr = new Date().getFullYear();
            const serialNum = String(db.certificates.length + 124).padStart(5, '0');
            const uniqueCode = `DTN-${yearStr}-${serialNum}`;

            db.certificates.push({
              id: `cert-${Date.now()}`,
              enrollment_id,
              issued_at: nowStr,
              unique_code: uniqueCode
            });

            enroll.status = 'completed';
            enroll.completed_at = nowStr;
          } else if (!allCompleted && enroll.status === 'completed') {
            enroll.status = 'active';
            enroll.completed_at = undefined;
            db.certificates = db.certificates.filter(c => c.enrollment_id !== enrollment_id);
          }
        }

        saveDb(db);
        return NextResponse.json({ success: true });
      }

      case 'admin:manual-issue-certificate': {
        const user = getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { enrollment_id } = payload;
        const enroll = db.enrollments.find(e => e.id === enrollment_id);
        
        if (!enroll) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });

        // Check already issued
        const certExists = db.certificates.find(c => c.enrollment_id === enrollment_id);
        if (certExists) return NextResponse.json({ error: 'Certificate already issued for this course enrollment.' });

        const yearStr = new Date().getFullYear();
        const serialNum = String(db.certificates.length + 124).padStart(5, '0');
        const uniqueCode = `DTN-${yearStr}-${serialNum}`;

        const newCert: Certificate = {
          id: `cert-${Date.now()}`,
          enrollment_id,
          issued_at: new Date().toISOString(),
          unique_code: uniqueCode
        };

        db.certificates.push(newCert);

        // Auto mark all stages as complete to align database progress state
        const stages = db.course_stages.filter(s => s.course_id === enroll.course_id);
        stages.forEach(stage => {
          const prog = db.progress.find(p => p.enrollment_id === enrollment_id && p.stage_id === stage.id);
          if (prog) {
            prog.completed = true;
            prog.completed_at = new Date().toISOString();
          } else {
            db.progress.push({
              id: `prog-${Date.now()}-${stage.id}`,
              enrollment_id,
              stage_id: stage.id,
              completed: true,
              completed_at: new Date().toISOString()
            });
          }
        });

        enroll.status = 'completed';
        enroll.completed_at = new Date().toISOString();

        saveDb(db);
        return NextResponse.json({ success: true, certificateCode: uniqueCode });
      }

      case 'admin:revoke-certificate': {
        const user = getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { certificate_id } = payload;
        const cert = db.certificates.find(c => c.id === certificate_id);
        if (!cert) return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });

        // Downgrade matching enrollment back to active
        const enroll = db.enrollments.find(e => e.id === cert.enrollment_id);
        if (enroll) {
          enroll.status = 'active';
          enroll.completed_at = undefined;
        }

        db.certificates = db.certificates.filter(c => c.id !== certificate_id);
        saveDb(db);

        return NextResponse.json({ success: true });
      }

      case 'admin:get-registrations': {
        const user = getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        return NextResponse.json({ registrations: db.registrations });
      }

      case 'admin:update-registration-status': {
        const user = getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { id, status } = payload;
        const reg = db.registrations.find(r => r.id === id);
        
        if (reg) {
          reg.status = status;
          saveDb(db);
        }

        return NextResponse.json({ success: true, registration: reg });
      }

      case 'admin:convert-to-student': {
        const user = getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { registration_id } = payload;
        const reg = db.registrations.find(r => r.id === registration_id);
        
        if (!reg) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });

        // Check if student profile already exists with this email
        let studentProfile = db.profiles.find(p => p.email.toLowerCase() === reg.email.toLowerCase());
        
        if (!studentProfile) {
          // Create student profile
          studentProfile = {
            id: `user-${Date.now()}`,
            full_name: reg.full_name,
            email: reg.email,
            phone: reg.phone,
            role: 'student',
            password: 'student123', // Default credentials
            created_at: new Date().toISOString()
          };
          db.profiles.push(studentProfile);
        }

        // Enroll in course if specified
        if (reg.course_id) {
          const course = db.courses.find(c => c.id === reg.course_id);
          const alreadyEnrolled = db.enrollments.find(e => e.student_id === studentProfile.id && e.course_id === reg.course_id);

          if (!alreadyEnrolled) {
            const enrollmentId = `enroll-${Date.now()}`;
            db.enrollments.push({
              id: enrollmentId,
              student_id: studentProfile.id,
              course_id: reg.course_id,
              status: 'active',
              payment_status: course?.price === 0 ? 'free' : 'paid',
              enrolled_at: new Date().toISOString()
            });

            // Pre-seed stages
            const stages = db.course_stages.filter(s => s.course_id === reg.course_id);
            stages.forEach(stage => {
              db.progress.push({
                id: `prog-${Date.now()}-${stage.id}`,
                enrollment_id: enrollmentId,
                stage_id: stage.id,
                completed: false
              });
            });
          }
        }

        reg.status = 'enrolled';
        saveDb(db);

        return NextResponse.json({ success: true, studentEmail: reg.email });
      }

      case 'admin:delete-registration': {
        const user = getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { id } = payload;
        db.registrations = db.registrations.filter(r => r.id !== id);
        saveDb(db);

        return NextResponse.json({ success: true });
      }

      case 'admin:create-course': {
        const user = getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { title, subtitle, description, price, duration, level, category_id, thumbnail_url } = payload;
        const newCourseId = `course-${Date.now()}`;
        
        const newCourse: Course = {
          id: newCourseId,
          category_id,
          title,
          subtitle,
          description,
          price: Number(price),
          duration,
          level,
          is_active: true,
          thumbnail_url: thumbnail_url || 'https://picsum.photos/seed/delightcourse/600/400',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        db.courses.push(newCourse);

        // Prepopulate course with three standard stages/modules
        db.course_stages.push(
          {
            id: `stage-${newCourseId}-1`,
            course_id: newCourseId,
            title: 'Module 1: General Core Essentials',
            description: 'Essential layout tools, frameworks, and theoretical fundamentals.',
            order_index: 1,
            created_at: new Date().toISOString()
          },
          {
            id: `stage-${newCourseId}-2`,
            course_id: newCourseId,
            title: 'Module 2: Practical Implementation Cases',
            description: 'Hands-on projects and workflows built based on client and brand briefs.',
            order_index: 2,
            created_at: new Date().toISOString()
          },
          {
            id: `stage-${newCourseId}-3`,
            course_id: newCourseId,
            title: 'Module 3: Portfolio Showcase & Capstone Assessment',
            description: 'Combine everything together and prepare for expert-level graduations.',
            order_index: 3,
            created_at: new Date().toISOString()
          }
        );

        saveDb(db);
        return NextResponse.json({ success: true, course: newCourse });
      }

      case 'admin:update-course': {
        const user = getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { id, title, subtitle, description, price, duration, level, category_id, thumbnail_url, is_active } = payload;
        const match = db.courses.find(c => c.id === id);

        if (match) {
          if (title !== undefined) match.title = title;
          if (subtitle !== undefined) match.subtitle = subtitle;
          if (description !== undefined) match.description = description;
          if (price !== undefined) match.price = Number(price);
          if (duration !== undefined) match.duration = duration;
          if (level !== undefined) match.level = level;
          if (category_id !== undefined) match.category_id = category_id;
          if (thumbnail_url !== undefined) match.thumbnail_url = thumbnail_url;
          if (is_active !== undefined) match.is_active = is_active;
          
          match.updated_at = new Date().toISOString();
          saveDb(db);
        }

        return NextResponse.json({ success: true, course: match });
      }

      case 'admin:create-category': {
        const user = getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { name, description, icon } = payload;
        const newCat: Category = {
          id: `cat-${Date.now()}`,
          name,
          description,
          icon: icon || 'Code',
          created_at: new Date().toISOString()
        };

        db.categories.push(newCat);
        saveDb(db);

        return NextResponse.json({ success: true, category: newCat });
      }

      case 'admin:get-certificates-report': {
        const user = getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const certificatesExtended = db.certificates.map(cert => {
          const enroll = db.enrollments.find(e => e.id === cert.enrollment_id);
          const student = db.profiles.find(p => p.id === enroll?.student_id);
          const course = db.courses.find(c => c.id === enroll?.course_id);

          return {
            ...cert,
            student_name: student?.full_name || 'Deleted Student',
            student_email: student?.email || 'N/A',
            course_title: course?.title || 'Deleted Course'
          };
        });

        return NextResponse.json({ certificates: certificatesExtended });
      }

      // --- STAGE LEVEL MANIPULATIONS ---
      case 'admin:add-stage': {
        const user = getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { course_id, title, description } = payload;
        const courseStages = db.course_stages.filter(s => s.course_id === course_id);
        const order_index = courseStages.length + 1;

        const newStage: CourseStage = {
          id: `stage-${course_id}-${Date.now()}`,
          course_id,
          title,
          description,
          order_index,
          created_at: new Date().toISOString()
        };

        db.course_stages.push(newStage);
        saveDb(db);

        return NextResponse.json({ success: true, stage: newStage });
      }

      case 'admin:delete-stage': {
        const user = getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { id } = payload;
        db.course_stages = db.course_stages.filter(s => s.id !== id);
        
        // delete progress associated with it
        db.progress = db.progress.filter(p => p.stage_id !== id);
        saveDb(db);

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API Router Error: ', error);
    return NextResponse.json({ error: error?.message || 'Server side error occurred' }, { status: 500 });
  }
}
