-- 1. PROFILES (Users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  password TEXT, -- Note: In production, use Supabase Auth instead of storing passwords here
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COURSES
CREATE TABLE public.courses (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  price NUMERIC DEFAULT 0,
  duration TEXT,
  level TEXT,
  is_active BOOLEAN DEFAULT true,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COURSE STAGES (Syllabus)
CREATE TABLE public.course_stages (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENROLLMENTS
CREATE TABLE public.enrollments (
  id TEXT PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  payment_status TEXT DEFAULT 'unpaid',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 6. PROGRESS TRACKING
CREATE TABLE public.progress (
  id TEXT PRIMARY KEY,
  enrollment_id TEXT REFERENCES public.enrollments(id) ON DELETE CASCADE,
  stage_id TEXT REFERENCES public.course_stages(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ
);

-- 7. CERTIFICATES
CREATE TABLE public.certificates (
  id TEXT PRIMARY KEY,
  enrollment_id TEXT REFERENCES public.enrollments(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  unique_code TEXT UNIQUE
);

-- 8. REGISTRATIONS (Inquiries/Leads)
CREATE TABLE public.registrations (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
  message TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEED DATA
INSERT INTO public.profiles (full_name, email, phone, role, password)
VALUES ('John Adeagbo', 'delighttechnetwork@gmail.com', '09038070539', 'admin', 'delightadmin123');
