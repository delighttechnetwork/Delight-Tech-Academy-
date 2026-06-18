export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { createSession, getSessionUserId, deleteSession } from '@/lib/auth-utils';
import {
  Profile,
  Enrollment,
  StudentProgress,
  Certificate,
  Registration,
  Course,
  CourseStage,
  Category
} from '@/lib/db-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    // Helper: get logged in user profile from Supabase
    const getSessionUser = async (): Promise<Profile | null> => {
      try {
        const userId = await getSessionUserId();
        if (!userId) return null;

        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error || !data) return null;
        return data as Profile;
      } catch (e) {
        console.error('Error reading session:', e);
        return null;
      }
    };

    switch (action) {
      // --- AUTH ACTIONS ---
      case 'auth:login': {
        const { email, password } = payload;
        console.log('Login attempt for:', email);
        const { data: profile, error } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('email', email.toLowerCase())
          .single();
        
        if (error) {
          console.error('Login database error:', error);
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
        }

        if (!profile) {
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
        }

        // Support both hashed and legacy plaintext passwords during transition
        let isValid = false;
        if (profile.password.startsWith('$2a$') || profile.password.startsWith('$2b$')) {
          isValid = await bcrypt.compare(password, profile.password);
        } else {
          isValid = profile.password === password;
        }

        if (!isValid) {
          console.log('Login failed: password mismatch');
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
        }

        await createSession(profile.id);

        const { password: _, ...safeProfile } = profile;
        return NextResponse.json({ user: safeProfile });
      }

      case 'auth:register': {
        const { email, password, full_name, phone } = payload;
        
        // Check exists
        const { data: existing } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', email.toLowerCase())
          .single();

        if (existing) {
          return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: newProfile, error } = await supabaseAdmin
          .from('profiles')
          .insert([{
            full_name,
            email: email.toLowerCase(),
            phone,
            role: 'student',
            password: hashedPassword,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;

        await createSession(newProfile.id);

        const { password: _, ...safeProfile } = newProfile;
        return NextResponse.json({ user: safeProfile });
      }

      case 'auth:me': {
        const user = await getSessionUser();
        if (!user) return NextResponse.json({ user: null });
        const { password: _, ...safeProfile } = user as any;
        return NextResponse.json({ user: safeProfile });
      }

      case 'auth:logout': {
        await deleteSession();
        return NextResponse.json({ success: true });
      }

      case 'auth:update-profile': {
        const user = await getSessionUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { full_name, phone, password, avatar_url } = payload;
        
        const updates: any = { full_name, phone, avatar_url };
        if (password) {
          updates.password = await bcrypt.hash(password, 10);
        }

        const { data: updated, error } = await supabaseAdmin
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (error) throw error;
        const { password: _, ...safeProfile } = updated;
        return NextResponse.json({ user: safeProfile });
      }

      // --- PUBLIC / WEBSITE WORKFLOWS ---
      case 'website:register-course': {
        const { full_name, email, phone, course_id, message } = payload;
        const { data: newReg, error } = await supabaseAdmin
          .from('registrations')
          .insert([{
            id: `reg-${Date.now()}`,
            full_name,
            email,
            phone,
            course_id,
            message,
            source: 'website',
            status: 'new',
            submitted_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, registration: newReg });
      }

      case 'website:send-contact': {
        const { full_name, email, phone, message, subject } = payload;
        const { data: newReg, error } = await supabaseAdmin
          .from('registrations')
          .insert([{
            id: `reg-${Date.now()}`,
            full_name,
            email,
            phone,
            course_id: null,
            message: `Subject: ${subject} | Message: ${message}`,
            source: 'contact',
            status: 'new',
            submitted_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, message: newReg });
      }

      case 'website:subscribe-newsletter': {
        const { email } = payload;
        const { data: newReg, error } = await supabaseAdmin
          .from('registrations')
          .insert([{
            id: `reg-${Date.now()}`,
            full_name: 'Newsletter Subscriber',
            email,
            phone: '-',
            course_id: null,
            message: 'Newsletter Subscription',
            source: 'contact',
            status: 'new',
            submitted_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, newsletter: newReg });
      }

      // --- CONTENT ---
      case 'content:get-catalog': {
        const [cats, crs, stgs] = await Promise.all([
          supabaseAdmin.from('categories').select('*').order('name'),
          supabaseAdmin.from('courses').select('*').order('created_at'),
          supabaseAdmin.from('course_stages').select('*').order('order_index')
        ]);
        return NextResponse.json({
          categories: cats.data || [],
          courses: crs.data || [],
          course_stages: stgs.data || []
        });
      }

      // --- STUDENT DASHBOARD ---
      case 'student:get-dashboard-data': {
        const user = await getSessionUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: enrollments } = await supabaseAdmin
          .from('enrollments')
          .select('*')
          .eq('student_id', user.id);
        
        const enrollmentIds = enrollments?.map(e => e.id) || [];

        const [prog, certs] = await Promise.all([
          supabaseAdmin.from('progress').select('*').in('enrollment_id', enrollmentIds),
          supabaseAdmin.from('certificates').select('*').in('enrollment_id', enrollmentIds)
        ]);

        return NextResponse.json({
          enrollments: enrollments || [],
          progress: prog.data || [],
          certificates: certs.data || []
        });
      }

      case 'student:self-enroll': {
        const user = await getSessionUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { course_id } = payload;
        const { data: existing } = await supabaseAdmin
          .from('enrollments')
          .select('id')
          .eq('student_id', user.id)
          .eq('course_id', course_id)
          .single();

        if (existing) return NextResponse.json({ error: 'Already enrolled' });

        const { data: course } = await supabaseAdmin.from('courses').select('price').eq('id', course_id).single();
        if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

        const enrollmentId = `enroll-${Date.now()}`;
        const { data: newEnrollment, error: enrollError } = await supabaseAdmin
          .from('enrollments')
          .insert([{
            id: enrollmentId,
            student_id: user.id,
            course_id,
            status: 'active',
            payment_status: course.price === 0 ? 'free' : 'pending',
            enrolled_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (enrollError) throw enrollError;

        // Pre-create progress
        const { data: stages } = await supabaseAdmin.from('course_stages').select('id').eq('course_id', course_id);
        if (stages && stages.length > 0) {
          const progressRows = stages.map(s => ({
            id: `prog-${Date.now()}-${s.id}`,
            enrollment_id: enrollmentId,
            stage_id: s.id,
            completed: false
          }));
          await supabaseAdmin.from('progress').insert(progressRows);
        }

        return NextResponse.json({ enrollment: newEnrollment });
      }

      case 'student:toggle-progress': {
        const user = await getSessionUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { enrollment_id, stage_id, completed } = payload;
        const nowStr = new Date().toISOString();

        // Update or Insert
        const { data: existingProg } = await supabaseAdmin
          .from('progress')
          .select('id')
          .eq('enrollment_id', enrollment_id)
          .eq('stage_id', stage_id)
          .single();

        if (existingProg) {
          await supabaseAdmin.from('progress')
            .update({ completed, completed_at: completed ? nowStr : null })
            .eq('id', existingProg.id);
        } else {
          await supabaseAdmin.from('progress').insert([{
            id: `prog-${Date.now()}`,
            enrollment_id,
            stage_id,
            completed,
            completed_at: completed ? nowStr : null
          }]);
        }

        // Check for course completion
        const { data: enroll } = await supabaseAdmin.from('enrollments').select('course_id, status').eq('id', enrollment_id).single();
        if (enroll) {
          const [{ data: stages }, { data: progs }] = await Promise.all([
            supabaseAdmin.from('course_stages').select('id').eq('course_id', enroll.course_id),
            supabaseAdmin.from('progress').select('stage_id, completed').eq('enrollment_id', enrollment_id)
          ]);

          const allCompleted = stages?.every(s => progs?.find(p => p.stage_id === s.id)?.completed) ?? false;
          let newlyCompletedCert = null;

          if (allCompleted && enroll.status === 'active') {
            const { data: certExists } = await supabaseAdmin.from('certificates').select('id').eq('enrollment_id', enrollment_id).single();
            if (!certExists) {
              const { data: totalCerts } = await supabaseAdmin.from('certificates').select('id', { count: 'exact' });
              const serialNum = String((totalCerts?.length || 0) + 124).padStart(5, '0');
              const uniqueCode = `DTN-${new Date().getFullYear()}-${serialNum}`;

              const { data: newCert } = await supabaseAdmin.from('certificates').insert([{
                id: `cert-${Date.now()}`,
                enrollment_id,
                issued_at: nowStr,
                unique_code: uniqueCode
              }]).select().single();

              await supabaseAdmin.from('enrollments').update({ status: 'completed', completed_at: nowStr }).eq('id', enrollment_id);
              newlyCompletedCert = newCert;
            }
          } else if (!allCompleted && enroll.status === 'completed') {
            await supabaseAdmin.from('enrollments').update({ status: 'active', completed_at: null }).eq('id', enrollment_id);
            await supabaseAdmin.from('certificates').delete().eq('enrollment_id', enrollment_id);
          }

          return NextResponse.json({ success: true, certificateIssued: newlyCompletedCert });
        }

        return NextResponse.json({ success: true });
      }

      // --- ADMIN PANEL ---
      case 'admin:get-overall-state': {
        const user = await getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const [profs, enrs, regs, certs, progs, crs, stgs, cats] = await Promise.all([
          supabaseAdmin.from('profiles').select('*'),
          supabaseAdmin.from('enrollments').select('*'),
          supabaseAdmin.from('registrations').select('*').order('submitted_at', { ascending: false }),
          supabaseAdmin.from('certificates').select('*'),
          supabaseAdmin.from('progress').select('*'),
          supabaseAdmin.from('courses').select('*'),
          supabaseAdmin.from('course_stages').select('*'),
          supabaseAdmin.from('categories').select('*')
        ]);

        return NextResponse.json({
          profiles: profs.data || [],
          enrollments: enrs.data || [],
          registrations: regs.data || [],
          certificates: certs.data || [],
          progress: progs.data || [],
          courses: crs.data || [],
          course_stages: stgs.data || [],
          categories: cats.data || []
        });
      }

      case 'admin:update-student-credentials': {
        const user = await getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { student_id, email, password } = payload;

        const updates: any = { email: email?.toLowerCase() };
        if (password) {
          updates.password = await bcrypt.hash(password, 10);
        }

        const { data: updated, error } = await supabaseAdmin
          .from('profiles')
          .update(updates)
          .eq('id', student_id)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, student: updated });
      }

      case 'admin:approve-registration': {
        const user = await getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { registration_id } = payload;
        const { data: reg } = await supabaseAdmin.from('registrations').select('*').eq('id', registration_id).single();
        if (!reg) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });

        let { data: student } = await supabaseAdmin.from('profiles').select('*').eq('email', reg.email.toLowerCase()).single();
        
        if (!student) {
          const hashedPassword = await bcrypt.hash('student123', 10);
          const { data: newStudent, error: createError } = await supabaseAdmin.from('profiles').insert([{
            full_name: reg.full_name,
            email: reg.email.toLowerCase(),
            phone: reg.phone,
            role: 'student',
            password: hashedPassword,
            created_at: new Date().toISOString()
          }]).select().single();
          if (createError) throw createError;
          student = newStudent;
        }

        if (reg.course_id && student) {
          const enrollmentId = `enroll-${Date.now()}`;
          const { data: course } = await supabaseAdmin.from('courses').select('price').eq('id', reg.course_id).single();

          await supabaseAdmin.from('enrollments').upsert([{
            id: enrollmentId,
            student_id: student.id,
            course_id: reg.course_id,
            status: 'active',
            payment_status: course?.price === 0 ? 'free' : 'paid',
            enrolled_at: new Date().toISOString()
          }]);

          const { data: stages } = await supabaseAdmin.from('course_stages').select('id').eq('course_id', reg.course_id);
          if (stages && stages.length > 0) {
            const progressRows = stages.map(s => ({
              id: `prog-${Date.now()}-${s.id}`,
              enrollment_id: enrollmentId,
              stage_id: s.id,
              completed: false
            }));
            await supabaseAdmin.from('progress').insert(progressRows);
          }
        }

        await supabaseAdmin.from('registrations').update({ status: 'enrolled' }).eq('id', registration_id);
        return NextResponse.json({ success: true, generatedEmail: reg.email });
      }

      case 'admin:delete-profile': {
        const user = await getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
        const { profile_id } = payload;
        await supabaseAdmin.from('profiles').delete().eq('id', profile_id);
        return NextResponse.json({ success: true });
      }

      case 'admin:create-course': {
        const user = await getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { title, subtitle, description, price, duration, level, category_id, stage_template } = payload;
        const newCourseId = `course-${Date.now()}`;
        
        const { data: newCourse, error } = await supabaseAdmin.from('courses').insert([{
          id: newCourseId,
          category_id,
          title,
          subtitle,
          description,
          price: Number(price),
          duration,
          level,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]).select().single();

        if (error) throw error;

        if (stage_template !== 'No automatic stage') {
          const templates = [
            { title: 'Module 1: General Core Essentials', desc: 'Essential layout tools, frameworks, and theoretical fundamentals.' },
            { title: 'Module 2: Practical Implementation Cases', desc: 'Hands-on projects and workflows built based on client and brand briefs.' },
            { title: 'Module 3: Portfolio Showcase & Capstone Assessment', desc: 'Combine everything together and prepare for expert-level graduations.' }
          ];
          const stageRows = templates.map((t, i) => ({
            id: `stage-${newCourseId}-${i+1}`,
            course_id: newCourseId,
            title: t.title,
            description: t.desc,
            order_index: i + 1,
            created_at: new Date().toISOString()
          }));
          await supabaseAdmin.from('course_stages').insert(stageRows);
        }

        return NextResponse.json({ success: true, course: newCourse });
      }

      case 'admin:update-course': {
        const user = await getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { id, title, subtitle, description, price, duration, level, category_id, is_active } = payload;
        const { data: updated, error } = await supabaseAdmin
          .from('courses')
          .update({ title, subtitle, description, price, duration, level, category_id, is_active, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, course: updated });
      }

      case 'admin:create-stage': {
        const user = await getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { course_id, title, description } = payload;
        const { data: existingStages } = await supabaseAdmin.from('course_stages').select('id', { count: 'exact' }).eq('course_id', course_id);
        const order_index = (existingStages?.length || 0) + 1;

        const { data: newStage, error } = await supabaseAdmin.from('course_stages').insert([{
          id: `stage-${course_id}-${Date.now()}`,
          course_id,
          title,
          description,
          order_index,
          created_at: new Date().toISOString()
        }]).select().single();

        if (error) throw error;
        return NextResponse.json({ success: true, stage: newStage });
      }

      case 'admin:issue-certificate': {
        const user = await getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { student_id, course_id } = payload;
        let { data: enroll } = await supabaseAdmin.from('enrollments').select('id').eq('student_id', student_id).eq('course_id', course_id).single();

        if (!enroll) {
          const { data: newEnroll } = await supabaseAdmin.from('enrollments').insert([{
            id: `enroll-${Date.now()}`,
            student_id,
            course_id,
            status: 'active',
            payment_status: 'free',
            enrolled_at: new Date().toISOString()
          }]).select().single();
          enroll = newEnroll;
        }

        if (!enroll) return NextResponse.json({ error: 'Failed to find/create enrollment' });

        const { data: totalCerts } = await supabaseAdmin.from('certificates').select('id', { count: 'exact' });
        const serialNum = String((totalCerts?.length || 0) + 124).padStart(5, '0');
        const uniqueCode = `DTN-${new Date().getFullYear()}-${serialNum}`;

        const { data: newCert, error: certError } = await supabaseAdmin.from('certificates').insert([{
          id: `cert-${Date.now()}`,
          enrollment_id: enroll.id,
          issued_at: new Date().toISOString(),
          unique_code: uniqueCode
        }]).select().single();

        if (certError) throw certError;

        await supabaseAdmin.from('enrollments').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', enroll.id);

        return NextResponse.json({ success: true, unique_code: uniqueCode });
      }

      case 'admin:delete-registration': {
        const user = await getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
        const { id } = payload;
        await supabaseAdmin.from('registrations').delete().eq('id', id);
        return NextResponse.json({ success: true });
      }

      case 'admin:manual-complete-stage': {
        const user = await getSessionUser();
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });

        const { enrollment_id, stage_id, completed } = payload;
        const nowStr = new Date().toISOString();

        const { data: existingProg } = await supabaseAdmin
          .from('progress')
          .select('id')
          .eq('enrollment_id', enrollment_id)
          .eq('stage_id', stage_id)
          .single();

        if (existingProg) {
          await supabaseAdmin.from('progress')
            .update({ completed, completed_at: completed ? nowStr : null })
            .eq('id', existingProg.id);
        } else {
          await supabaseAdmin.from('progress').insert([{
            id: `prog-${Date.now()}`,
            enrollment_id,
            stage_id,
            completed,
            completed_at: completed ? nowStr : null
          }]);
        }
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
