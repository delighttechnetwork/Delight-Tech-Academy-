-- ============================================================================
-- DELIGHT TECH NETWORK ACADEMY - SUPABASE SETUP SCHEMA
-- Copy and paste this script into the 'SQL Editor' in your Supabase Dashboard
-- to create all required tables, types, and initial seeded records.
-- ============================================================================

-- 1. Enable UUID Extension (standard in PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean Up Existing Tables (Optional - if reinstalling)
-- DROP TABLE IF EXISTS progress CASCADE;
-- DROP TABLE IF EXISTS certificates CASCADE;
-- DROP TABLE IF EXISTS enrollments CASCADE;
-- DROP TABLE IF EXISTS course_stages CASCADE;
-- DROP TABLE IF EXISTS courses CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS registrations CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- 3. PROFILES Table (Stores admin and student metadata)
CREATE TABLE profiles (
    id TEXT PRIMARY KEY, -- Supports custom IDs (e.g. 'user-admin' or UUIDs)
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    password TEXT, -- For simple application-managed session login credentials
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CATEGORIES Table
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT, -- Lucide icon class or Emoji representation
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COURSES Table
CREATE TABLE courses (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0, -- Store in Naira (0 = Free)
    duration TEXT,
    level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COURSE STAGES Table
CREATE TABLE course_stages (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ENROLLMENTS Table
CREATE TABLE enrollments (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'free')),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 8. PROGRESS Table
CREATE TABLE progress (
    id TEXT PRIMARY KEY,
    enrollment_id TEXT REFERENCES enrollments(id) ON DELETE CASCADE,
    stage_id TEXT REFERENCES course_stages(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ
);

-- 9. CERTIFICATES Table
CREATE TABLE certificates (
    id TEXT PRIMARY KEY,
    enrollment_id TEXT REFERENCES enrollments(id) ON DELETE CASCADE,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    certificate_url TEXT,
    unique_code TEXT UNIQUE NOT NULL -- DTN-YYYY-XXXXX format
);

-- 10. REGISTRATIONS Table (Handles website course applications and contacts)
CREATE TABLE registrations (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    course_id TEXT, -- Empty for general contact forms
    message TEXT,
    source TEXT NOT NULL CHECK (source IN ('website', 'contact')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'enrolled', 'rejected')),
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 11. INITIAL SEED RECORDS FOR THE PORTAL
-- ============================================================================

-- Seed Categories
INSERT INTO categories (id, name, description, icon, created_at) VALUES
('cat-graphics', 'Graphics Design', 'Master smartphone design, Adobe Photoshop, brand aesthetics, and AI-assisted graphics production.', 'Palette', NOW()),
('cat-webdev', 'Web Development', 'From foundational HTML & CSS to advanced Full-Stack software engineering and AI-driven Vibe Coding.', 'Code', NOW()),
('cat-video', 'Video Animation', 'Produce captivating visual animations, film cuts, and cinematic effects using only your smartphone or AI systems.', 'Video', NOW()),
('cat-uiux', 'UI/UX Design', 'Create beautiful user-centered design system frameworks, blueprints, mobile layouts, and responsive app interfaces.', 'Layout', NOW()),
('cat-cyber', 'Cyber Security', 'Understand software security structures, system networking, threat defense mechanisms, and infrastructure guardrails.', 'ShieldAlert', NOW()),
('cat-prompt', 'Prompt Engineering', 'Harness the elite powers of LLM APIs, prompt sequencing, contextual injection, and autonomous agent orchestration.', 'Compass', NOW())
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

-- Seed Courses
INSERT INTO courses (id, category_id, title, subtitle, description, price, duration, level, is_active, thumbnail_url, created_at, updated_at) VALUES
('course-smartphone-design', 'cat-graphics', 'Smartphone Design', 'Create Professional Graphic Designs on Your Phone', 'Learn typography, canvas layouts, color theories, and visual marketing assets creation using specialized smartphone apps. Ideal for beginners starting custom design agencies.', 5000, '6 weeks', 'Beginner', TRUE, 'https://picsum.photos/seed/smartphone/600/400', NOW(), NOW()),
('course-photoshop', 'cat-graphics', 'Photoshop & Illustrator', 'Master the Standard Professional Graphics Toolkit', 'Deep dive into raster imaging, vector creations, layer gating, texturing, digital manipulations, and print-ready banner production.', 15000, '8 weeks', 'Intermediate', TRUE, 'https://picsum.photos/seed/photoshop/600/400', NOW(), NOW()),
('course-ai-graphics', 'cat-graphics', 'AI Graphics Design', 'Supercharge Creative Workflows with Generative AI', 'Leverage cutting-edge text-to-image engines, neural image editing, styling transfer, and mock asset generations to work 10x faster than traditional designers.', 5000, '4 weeks', 'Beginner', TRUE, 'https://picsum.photos/seed/aigraphics/600/400', NOW(), NOW()),
('course-free-web', 'cat-webdev', 'Free Class (HTML & CSS)', 'The Absolute Foundation of Modern Web Software', 'Start your software path for free! Build clean semantic HTML structures, beautiful responsive grids with CSS Flexbox, custom form layouts, and basic site deployments.', 0, '2 weeks', 'Beginner', TRUE, 'https://picsum.photos/seed/freeweb/600/400', NOW(), NOW()),
('course-frontend-dev', 'cat-webdev', 'Frontend Development', 'Build Interactive Web Interfaces with modern Javascript & React', 'Design dynamic, pixel-perfect single-page web applications. Comprehensive 3-month curriculum covering HTML, CSS, Tailwind CSS, JavaScript, TypeScript, React, and NextJS.', 150000, '3 months', 'Intermediate', TRUE, 'https://picsum.photos/seed/frontend/600/400', NOW(), NOW()),
('course-fullstack-dev', 'cat-webdev', 'Full Stack Development', 'Become a Complete Full-Cycle Software Engineer', 'Our most comprehensive program. Build enterprise database models, backend APIs (Node/Express), user logs systems, Cloud deployments, and secure transaction workflows.', 250000, '16 weeks', 'Advanced', TRUE, 'https://picsum.photos/seed/fullstack/600/400', NOW(), NOW()),
('course-ai-web', 'cat-webdev', 'AI Web Development (Vibe Coding)', 'Build Complete Software Apps Using Prompt Engines', 'Learn modern LLM pairing. Covers prompt engineering, web development basics, adding backend, deployment, and how and where to get cheap hosting and domains.', 35000, '6 weeks', 'Intermediate', TRUE, 'https://picsum.photos/seed/aiweb/600/400', NOW(), NOW()),
('course-smartphone-video', 'cat-video', 'Smartphone Video', 'Professional Shoots and Edits on Your Mobile', 'Master camera angles, lighting dynamics, narrative edits, clean sound overlays, and transition graphics on mobile applications like CapCut and Kinemaster.', 15000, '6 weeks', 'Beginner', TRUE, 'https://picsum.photos/seed/smartphonevideo/600/400', NOW(), NOW()),
('course-ai-video', 'cat-video', 'AI Video Production', 'Generate Cinematic Animations from Pure Text', 'Generate immersive cinematic renders, virtual human announcers, automated vocal synth voiceovers, and intelligent transitions using specialized AI video services.', 10000, '4 weeks', 'Beginner', TRUE, 'https://picsum.photos/seed/aivideo/600/400', NOW(), NOW()),
('course-uiux', 'cat-uiux', 'UI/UX Design Masterclass', 'Design Delightful Interactive Systems', 'Develop user personas, site blueprints, interactive wireframes, and responsive component libraries within Figma. Create portfolios that win global contracts.', 25000, '8 weeks', 'Intermediate', TRUE, 'https://picsum.photos/seed/uiux/600/400', NOW(), NOW()),
('course-cyber', 'cat-cyber', 'Cyber Security Fundamentals', 'Defend Systems and Network Infostructures', 'Go from beginner to job-ready in 3 months. Learn fundamental security concepts, networking, hands-on ethical hacking with Nmap, defensive hardening, Wi-Fi hacking, cloud infrastructure IAM, and SOC Security Information/Event Management operations.', 300000, '3 months', 'Beginner', TRUE, 'https://picsum.photos/seed/cyber/600/400', NOW(), NOW()),
('course-prompt-eng', 'cat-prompt', 'Prompt Engineering Essentials', 'Master the Language of Cognitive Machines', 'Discover systematic prompt patterns, chains of thought sequencing, zero-shot and few-shot conditioning, embeddings setups, and agentic workflows creation.', 10000, '4 weeks', 'Beginner', TRUE, 'https://picsum.photos/seed/prompt/600/400', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    duration = EXCLUDED.duration,
    level = EXCLUDED.level,
    is_active = EXCLUDED.is_active,
    thumbnail_url = EXCLUDED.thumbnail_url,
    updated_at = NOW();

-- Seed Course Stages / Modules
INSERT INTO course_stages (id, course_id, title, description, order_index, created_at) VALUES
('stage-course-cyber-1', 'course-cyber', 'MONTH 1 – Foundations (Beginner)', 'Introduction to Cybersecurity • Cyber Threats & Career Paths • Networking Fundamentals • Operating Systems & Linux Basics • Security Concepts & Risk Management.', 1, NOW()),
('stage-course-cyber-2', 'course-cyber', 'MONTH 2 – Hands-On Security (Intermediate)', 'Ethical Hacking Fundamentals • Reconnaissance & Scanning (Nmap) • Web & Network Security • System Hardening & Defense • Incident Response Basics.', 2, NOW()),
('stage-course-cyber-3', 'course-cyber', 'MONTH 3 – Advanced & Career Readiness (Expert)', 'Advanced Ethical Hacking • Privilege Escalation & Wireless Security • Cloud Security & IAM • SOC Operations & SIEM Overview • Capstone Project & Career Preparation.', 3, NOW()),
('stage-course-frontend-dev-1', 'course-frontend-dev', 'Month 1: UI Frameworks & Web Styling Foundations', 'HTML structure and tags. Responsive, stunning page design patterns utilizing pure CSS & utility-first Tailwind CSS classes.', 1, NOW()),
('stage-course-frontend-dev-2', 'course-frontend-dev', 'Month 2: Coding Interactions & Dynamic Logic', 'Unlock JavaScript ES6 syntax, client-side event loops, API integration, and strong typed modeling via TypeScript.', 2, NOW()),
('stage-course-frontend-dev-3', 'course-frontend-dev', 'Month 3: Production Delivery with React & NextJS', 'Build robust single-page applications. Master React states, NextJS App Router architectures, server layout, and production Vercel hosting.', 3, NOW()),
('stage-course-ai-web-1', 'course-ai-web', 'Module 1: Prompt Engineering & Web Basics', 'Introduction to prompt styling guidelines and AI-assisted structure building. Formulate precise context instructions and generate standard HTML & CSS layout pages.', 1, NOW()),
('stage-course-ai-web-2', 'course-ai-web', 'Module 2: Server Integration & Backend Proxies', 'Orchestrate integrated database schemas, define system backend servers, and build Express routes securely using rapid semantic blueprints.', 2, NOW()),
('stage-course-ai-web-3', 'course-ai-web', 'Module 3: Deployments, Domain Routing & Cheap Hosting', 'Learn modern app deployment workflows. Find out exactly where and how to purchase cheap, durable domains and host your apps securely for the global market.', 3, NOW())
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    order_index = EXCLUDED.order_index;

-- Default stages fallback generator for other courses
INSERT INTO course_stages (id, course_id, title, description, order_index, created_at) VALUES
-- course-smartphone-design
('stage-course-smartphone-design-1', 'course-smartphone-design', 'Module 1: Foundational Frameworks & Essentials', 'Understand the basic vocabulary, system configurations, layout setups, and primary tools associated with this training.', 1, NOW()),
('stage-course-smartphone-design-2', 'course-smartphone-design', 'Module 2: Practical Exercises & Real-World Projects', 'Engage in curated hands-on workshops. Build full physical design assets or software items based on specific customer prompts.', 2, NOW()),
('stage-course-smartphone-design-3', 'course-smartphone-design', 'Module 3: Mastery Review, Portfolio & Capstone Examination', 'Integrate the entire toolkit. Package your assets into a professional career portfolio and complete the final Delight Tech Academy graduation checkout.', 3, NOW()),

-- course-photoshop
('stage-course-photoshop-1', 'course-photoshop', 'Module 1: Foundational Frameworks & Essentials', 'Understand the basic vocabulary, system configurations, layout setups, and primary tools associated with this training.', 1, NOW()),
('stage-course-photoshop-2', 'course-photoshop', 'Module 2: Practical Exercises & Real-World Projects', 'Engage in curated hands-on workshops. Build full physical design assets or software items based on specific customer prompts.', 2, NOW()),
('stage-course-photoshop-3', 'course-photoshop', 'Module 3: Mastery Review, Portfolio & Capstone Examination', 'Integrate the entire toolkit. Package your assets into a professional career portfolio and complete the final Delight Tech Academy graduation checkout.', 3, NOW()),

-- course-ai-graphics
('stage-course-ai-graphics-1', 'course-ai-graphics', 'Module 1: Foundational Frameworks & Essentials', 'Understand the basic vocabulary, system configurations, layout setups, and primary tools associated with this training.', 1, NOW()),
('stage-course-ai-graphics-2', 'course-ai-graphics', 'Module 2: Practical Exercises & Real-World Projects', 'Engage in curated hands-on workshops. Build full physical design assets or software items based on specific customer prompts.', 2, NOW()),
('stage-course-ai-graphics-3', 'course-ai-graphics', 'Module 3: Mastery Review, Portfolio & Capstone Examination', 'Integrate the entire toolkit. Package your assets into a professional career portfolio and complete the final Delight Tech Academy graduation checkout.', 3, NOW()),

-- course-free-web
('stage-course-free-web-1', 'course-free-web', 'Module 1: Foundational Frameworks & Essentials', 'Understand the basic vocabulary, system configurations, layout setups, and primary tools associated with this training.', 1, NOW()),
('stage-course-free-web-2', 'course-free-web', 'Module 2: Practical Exercises & Real-World Projects', 'Engage in curated hands-on workshops. Build full physical design assets or software items based on specific customer prompts.', 2, NOW()),
('stage-course-free-web-3', 'course-free-web', 'Module 3: Mastery Review, Portfolio & Capstone Examination', 'Integrate the entire toolkit. Package your assets into a professional career portfolio and complete the final Delight Tech Academy graduation checkout.', 3, NOW()),

-- course-fullstack-dev
('stage-course-fullstack-dev-1', 'course-fullstack-dev', 'Module 1: Foundational Frameworks & Essentials', 'Understand the basic vocabulary, system configurations, layout setups, and primary tools associated with this training.', 1, NOW()),
('stage-course-fullstack-dev-2', 'course-fullstack-dev', 'Module 2: Practical Exercises & Real-World Projects', 'Engage in curated hands-on workshops. Build full physical design assets or software items based on specific customer prompts.', 2, NOW()),
('stage-course-fullstack-dev-3', 'course-fullstack-dev', 'Module 3: Mastery Review, Portfolio & Capstone Examination', 'Integrate the entire toolkit. Package your assets into a professional career portfolio and complete the final Delight Tech Academy graduation checkout.', 3, NOW()),

-- course-smartphone-video
('stage-course-smartphone-video-1', 'course-smartphone-video', 'Module 1: Foundational Frameworks & Essentials', 'Understand the basic vocabulary, system configurations, layout setups, and primary tools associated with this training.', 1, NOW()),
('stage-course-smartphone-video-2', 'course-smartphone-video', 'Module 2: Practical Exercises & Real-World Projects', 'Engage in curated hands-on workshops. Build full physical design assets or software items based on specific customer prompts.', 2, NOW()),
('stage-course-smartphone-video-3', 'course-smartphone-video', 'Module 3: Mastery Review, Portfolio & Capstone Examination', 'Integrate the entire toolkit. Package your assets into a professional career portfolio and complete the final Delight Tech Academy graduation checkout.', 3, NOW()),

-- course-ai-video
('stage-course-ai-video-1', 'course-ai-video', 'Module 1: Foundational Frameworks & Essentials', 'Understand the basic vocabulary, system configurations, layout setups, and primary tools associated with this training.', 1, NOW()),
('stage-course-ai-video-2', 'course-ai-video', 'Module 2: Practical Exercises & Real-World Projects', 'Engage in curated hands-on workshops. Build full physical design assets or software items based on specific customer prompts.', 2, NOW()),
('stage-course-ai-video-3', 'course-ai-video', 'Module 3: Mastery Review, Portfolio & Capstone Examination', 'Integrate the entire toolkit. Package your assets into a professional career portfolio and complete the final Delight Tech Academy graduation checkout.', 3, NOW()),

-- course-uiux
('stage-course-uiux-1', 'course-uiux', 'Module 1: Foundational Frameworks & Essentials', 'Understand the basic vocabulary, system configurations, layout setups, and primary tools associated with this training.', 1, NOW()),
('stage-course-uiux-2', 'course-uiux', 'Module 2: Practical Exercises & Real-World Projects', 'Engage in curated hands-on workshops. Build full physical design assets or software items based on specific customer prompts.', 2, NOW()),
('stage-course-uiux-3', 'course-uiux', 'Module 3: Mastery Review, Portfolio & Capstone Examination', 'Integrate the entire toolkit. Package your assets into a professional career portfolio and complete the final Delight Tech Academy graduation checkout.', 3, NOW()),

-- course-prompt-eng
('stage-course-prompt-eng-1', 'course-prompt-eng', 'Module 1: Foundational Frameworks & Essentials', 'Understand the basic vocabulary, system configurations, layout setups, and primary tools associated with this training.', 1, NOW()),
('stage-course-prompt-eng-2', 'course-prompt-eng', 'Module 2: Practical Exercises & Real-World Projects', 'Engage in curated hands-on workshops. Build full physical design assets or software items based on specific customer prompts.', 2, NOW()),
('stage-course-prompt-eng-3', 'course-prompt-eng', 'Module 3: Mastery Review, Portfolio & Capstone Examination', 'Integrate the entire toolkit. Package your assets into a professional career portfolio and complete the final Delight Tech Academy graduation checkout.', 3, NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed Master Profiles (Admins & Demo Students)
INSERT INTO profiles (id, full_name, email, phone, role, password, avatar_url, created_at) VALUES
('user-admin', 'John Adeagbo', 'delighttechnetwork@gmail.com', '09038070539', 'admin', 'delightadmin123', 'https://picsum.photos/seed/john/200/200', NOW()),
('user-stud1', 'Adebayo Chukwu', 'student1@delight.com', '07089627177', 'student', 'student123', 'https://picsum.photos/seed/adebayo/200/200', NOW()),
('user-stud2', 'Oluwaseun Ibrahim', 'student2@delight.com', '08123456789', 'student', 'student123', 'https://picsum.photos/seed/seun/200/200', NOW())
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    password = EXCLUDED.password,
    avatar_url = EXCLUDED.avatar_url;

-- Seed Demo Enrollments
INSERT INTO enrollments (id, student_id, course_id, status, payment_status, enrolled_at) VALUES
('enroll-stud1-frontend', 'user-stud1', 'course-frontend-dev', 'active', 'paid', NOW()),
('enroll-stud2-free', 'user-stud2', 'course-free-web', 'completed', 'free', NOW())
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    payment_status = EXCLUDED.payment_status;

-- Seed Demo Progress Records
INSERT INTO progress (id, enrollment_id, stage_id, completed, completed_at) VALUES
('prog-s1-f1', 'enroll-stud1-frontend', 'stage-course-frontend-dev-1', TRUE, NOW()),
('prog-s1-f2', 'enroll-stud1-frontend', 'stage-course-frontend-dev-2', TRUE, NOW()),
('prog-s1-f3', 'enroll-stud1-frontend', 'stage-course-frontend-dev-3', FALSE, NULL),
('prog-s2-f1', 'enroll-stud2-free', 'stage-course-free-web-1', TRUE, NOW()),
('prog-s2-f2', 'enroll-stud2-free', 'stage-course-free-web-2', TRUE, NOW()),
('prog-s2-f3', 'enroll-stud2-free', 'stage-course-free-web-3', TRUE, NOW())
ON CONFLICT (id) DO UPDATE SET
    completed = EXCLUDED.completed,
    completed_at = EXCLUDED.completed_at;

-- Seed Demo Certificate
INSERT INTO certificates (id, enrollment_id, unique_code, issued_at) VALUES
('cert-stud2-free', 'enroll-stud2-free', 'DTN-2026-00042', NOW())
ON CONFLICT (id) DO UPDATE SET
    unique_code = EXCLUDED.unique_code;

-- Seed Demo Contact Registrations
INSERT INTO registrations (id, full_name, email, phone, course_id, message, source, status, submitted_at) VALUES
('reg-demo-1', 'Florence Adeleke', 'florencetech@gmail.com', '08166527812', 'course-smartphone-design', 'Hello, what times are the classes for smartphone graphics design scheduled in Dugbe?', 'website', 'new', NOW()),
('reg-demo-2', 'Tunde Olatunji', 'tundex@yahoo.com', '09055883210', 'course-cyber', 'I want to know if physical attendance is binary or we can participate hybrid.', 'contact', 'contacted', NOW())
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status;
