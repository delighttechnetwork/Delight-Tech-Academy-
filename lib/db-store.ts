// This file now primarily defines the Types and Interfaces used throughout the application.
// Data persistence is handled via Supabase through the /api/db route.

export interface Profile {
  id: string; // auth uuid or simple string identifier
  full_name: string;
  email: string;
  phone: string;
  role: 'student' | 'admin';
  password?: string; // stored for local simple validation
  avatar_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or Lucide icon name
  created_at: string;
}

export interface Course {
  id: string;
  category_id: string;
  title: string;
  subtitle: string;
  description: string;
  price: number; // in Naira (0 = free)
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  is_active: boolean;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseStage {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'suspended';
  payment_status: 'pending' | 'paid' | 'free';
  enrolled_at: string;
  completed_at?: string;
}

export interface StudentProgress {
  id: string;
  enrollment_id: string;
  stage_id: string;
  completed: boolean;
  completed_at?: string;
}

export interface Certificate {
  id: string;
  enrollment_id: string;
  issued_at: string;
  certificate_url?: string;
  unique_code: string; // e.g. DTN-2025-00123
}

export interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  course_id: string | null;
  message?: string;
  source: 'website' | 'contact';
  status: 'new' | 'contacted' | 'enrolled' | 'rejected';
  submitted_at: string;
}

export interface DatabaseSchema {
  profiles: Profile[];
  categories: Category[];
  courses: Course[];
  course_stages: CourseStage[];
  enrollments: Enrollment[];
  progress: StudentProgress[];
  certificates: Certificate[];
  registrations: Registration[];
}
