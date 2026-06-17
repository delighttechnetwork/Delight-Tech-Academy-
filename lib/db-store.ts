import fs from 'fs';
import path from 'path';

// Local storage paths
const DB_FILE = path.join(process.cwd(), 'db.json');

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
  course_id: string;
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

let cachedDb: DatabaseSchema | null = null;

// Initial Seeding Data
function getSeedData(): DatabaseSchema {
  const now = new Date().toISOString();

  const categories: Category[] = [
    { id: 'cat-graphics', name: 'Graphics Design', description: 'Master smartphone design, Adobe Photoshop, brand aesthetics, and AI-assisted graphics production.', icon: 'Palette', created_at: now },
    { id: 'cat-webdev', name: 'Web Development', description: 'From foundational HTML & CSS to advanced Full-Stack software engineering and AI-driven Vibe Coding.', icon: 'Code', created_at: now },
    { id: 'cat-video', name: 'Video Animation', description: 'Produce captivating visual animations, film cuts, and cinematic effects using only your smartphone or AI systems.', icon: 'Video', created_at: now },
    { id: 'cat-uiux', name: 'UI/UX Design', description: 'Create beautiful user-centered design system frameworks, blueprints, mobile layouts, and responsive app interfaces.', icon: 'Layout', created_at: now },
    { id: 'cat-cyber', name: 'Cyber Security', description: 'Understand software security structures, system networking, threat defense mechanisms, and infrastructure guardrails.', icon: 'ShieldAlert', created_at: now },
    { id: 'cat-prompt', name: 'Prompt Engineering', description: 'Harness the elite powers of LLM APIs, prompt sequencing, contextual injection, and autonomous agent orchestration.', icon: 'Compass', created_at: now }
  ];

  const courses: Course[] = [
    // Graphics Design
    {
      id: 'course-smartphone-design',
      category_id: 'cat-graphics',
      title: 'Smartphone Design',
      subtitle: 'Create Professional Graphic Designs on Your Phone',
      description: 'Learn typography, canvas layouts, color theories, and visual marketing assets creation using specialized smartphone apps. Ideal for beginners starting custom design agencies.',
      price: 5000,
      duration: '6 weeks',
      level: 'Beginner',
      is_active: true,
      thumbnail_url: 'https://picsum.photos/seed/smartphone/600/400',
      created_at: now,
      updated_at: now
    },
    {
      id: 'course-photoshop',
      category_id: 'cat-graphics',
      title: 'Photoshop & Illustrator',
      subtitle: 'Master the Standard Professional Graphics Toolkit',
      description: 'Deep dive into raster imaging, vector creations, layer gating, texturing, digital manipulations, and print-ready banner production.',
      price: 15000,
      duration: '8 weeks',
      level: 'Intermediate',
      is_active: true,
      thumbnail_url: 'https://picsum.photos/seed/photoshop/600/400',
      created_at: now,
      updated_at: now
    },
    {
      id: 'course-ai-graphics',
      category_id: 'cat-graphics',
      title: 'AI Graphics Design',
      subtitle: 'Supercharge Creative Workflows with Generative AI',
      description: 'Leverage cutting-edge text-to-image engines, neural image editing, styling transfer, and mock asset generations to work 10x faster than traditional designers.',
      price: 5000,
      duration: '4 weeks',
      level: 'Beginner',
      is_active: true,
      thumbnail_url: 'https://picsum.photos/seed/aigraphics/600/400',
      created_at: now,
      updated_at: now
    },
    // Web Development
    {
      id: 'course-free-web',
      category_id: 'cat-webdev',
      title: 'Free Class (HTML & CSS)',
      subtitle: 'The Absolute Foundation of Modern Web Software',
      description: 'Start your software path for free! Build clean semantic HTML structures, beautiful responsive grids with CSS Flexbox, custom form layouts, and basic site deployments.',
      price: 0,
      duration: '2 weeks',
      level: 'Beginner',
      is_active: true,
      thumbnail_url: 'https://picsum.photos/seed/freeweb/600/400',
      created_at: now,
      updated_at: now
    },
    {
      id: 'course-frontend-dev',
      category_id: 'cat-webdev',
      title: 'Frontend Development',
      subtitle: 'Build Interactive Web Interfaces with modern Javascript & React',
      description: 'Design dynamic, pixel-perfect single-page web applications. Comprehensive 3-month curriculum covering HTML, CSS, Tailwind CSS, JavaScript, TypeScript, React, and NextJS.',
      price: 150000,
      duration: '3 months',
      level: 'Intermediate',
      is_active: true,
      thumbnail_url: 'https://picsum.photos/seed/frontend/600/400',
      created_at: now,
      updated_at: now
    },
    {
      id: 'course-fullstack-dev',
      category_id: 'cat-webdev',
      title: 'Full Stack Development',
      subtitle: 'Become a Complete Full-Cycle Software Engineer',
      description: 'Our most comprehensive program. Build enterprise database models, backend APIs (Node/Express), user logs systems, Cloud deployments, and secure transaction workflows.',
      price: 250000,
      duration: '16 weeks',
      level: 'Advanced',
      is_active: true,
      thumbnail_url: 'https://picsum.photos/seed/fullstack/600/400',
      created_at: now,
      updated_at: now
    },
    {
      id: 'course-ai-web',
      category_id: 'cat-webdev',
      title: 'AI Web Development (Vibe Coding)',
      subtitle: 'Build Complete Software Apps Using Prompt Engines',
      description: 'Learn modern LLM pairing. Covers prompt engineering, web development basics, adding backend, deployment, and how and where to get cheap hosting and domains.',
      price: 35000,
      duration: '6 weeks',
      level: 'Intermediate',
      is_active: true,
      thumbnail_url: 'https://picsum.photos/seed/aiweb/600/400',
      created_at: now,
      updated_at: now
    },
    // Video Production
    {
      id: 'course-smartphone-video',
      category_id: 'cat-video',
      title: 'Smartphone Video',
      subtitle: 'Professional Shoots and Edits on Your Mobile',
      description: 'Master camera angles, lighting dynamics, narrative edits, clean sound overlays, and transition graphics on mobile applications like CapCut and Kinemaster.',
      price: 15000,
      duration: '6 weeks',
      level: 'Beginner',
      is_active: true,
      thumbnail_url: 'https://picsum.photos/seed/smartphonevideo/600/400',
      created_at: now,
      updated_at: now
    },
    {
      id: 'course-ai-video',
      category_id: 'cat-video',
      title: 'AI Video Production',
      subtitle: 'Generate Cinematic Animations from Pure Text',
      description: 'Generate immersive cinematic renders, virtual human announcers, automated vocal synth voiceovers, and intelligent transitions using specialized AI video services.',
      price: 10000,
      duration: '4 weeks',
      level: 'Beginner',
      is_active: true,
      thumbnail_url: 'https://picsum.photos/seed/aivideo/600/400',
      created_at: now,
      updated_at: now
    },
    // UI/UX, Cyber, Prompt
    {
      id: 'course-uiux',
      category_id: 'cat-uiux',
      title: 'UI/UX Design Masterclass',
      subtitle: 'Design Delightful Interactive Systems',
      description: 'Develop user personas, site blueprints, interactive wireframes, and responsive component libraries within Figma. Create portfolios that win global contracts.',
      price: 25000,
      duration: '8 weeks',
      level: 'Intermediate',
      is_active: true,
      thumbnail_url: 'https://picsum.photos/seed/uiux/600/400',
      created_at: now,
      updated_at: now
    },
    {
      id: 'course-cyber',
      category_id: 'cat-cyber',
      title: 'Cyber Security Fundamentals',
      subtitle: 'Defend Systems and Network Infostructures',
      description: 'Go from beginner to job-ready in 3 months. Learn fundamental security concepts, networking, hands-on ethical hacking with Nmap, defensive hardening, Wi-Fi hacking, cloud infrastructure IAM, and SOC Security Information/Event Management operations.',
      price: 300000,
      duration: '3 months',
      level: 'Beginner',
      is_active: true,
      thumbnail_url: 'https://picsum.photos/seed/cyber/600/400',
      created_at: now,
      updated_at: now
    },
    {
      id: 'course-prompt-eng',
      category_id: 'cat-prompt',
      title: 'Prompt Engineering Essentials',
      subtitle: 'Master the Language of Cognitive Machines',
      description: 'Discover systematic prompt patterns, chains of thought sequencing, zero-shot and few-shot conditioning, embeddings setups, and agentic workflows creation.',
      price: 10000,
      duration: '4 weeks',
      level: 'Beginner',
      is_active: true,
      thumbnail_url: 'https://picsum.photos/seed/prompt/600/400',
      created_at: now,
      updated_at: now
    }
  ];

  // Stage generation for each course (3 standard chapters each)
  const course_stages: CourseStage[] = [];
  courses.forEach(course => {
    if (course.id === 'course-cyber') {
      course_stages.push(
        {
          id: `stage-${course.id}-1`,
          course_id: course.id,
          title: 'MONTH 1 – Foundations (Beginner)',
          description: 'Introduction to Cybersecurity • Cyber Threats & Career Paths • Networking Fundamentals • Operating Systems & Linux Basics • Security Concepts & Risk Management.',
          order_index: 1,
          created_at: now
        },
        {
          id: `stage-${course.id}-2`,
          course_id: course.id,
          title: 'MONTH 2 – Hands-On Security (Intermediate)',
          description: 'Ethical Hacking Fundamentals • Reconnaissance & Scanning (Nmap) • Web & Network Security • System Hardening & Defense • Incident Response Basics.',
          order_index: 2,
          created_at: now
        },
        {
          id: `stage-${course.id}-3`,
          course_id: course.id,
          title: 'MONTH 3 – Advanced & Career Readiness (Expert)',
          description: 'Advanced Ethical Hacking • Privilege Escalation & Wireless Security • Cloud Security & IAM • SOC Operations & SIEM Overview • Capstone Project & Career Preparation. Outcome: Beginner to job-ready in 3 months, practical hands-on skills, career and certification guidance (Security+, CEH).',
          order_index: 3,
          created_at: now
        }
      );
    } else if (course.id === 'course-frontend-dev') {
      course_stages.push(
        {
          id: `stage-${course.id}-1`,
          course_id: course.id,
          title: 'Month 1: UI Frameworks & Web Styling Foundations',
          description: 'HTML structure and tags. Responsive, stunning page design patterns utilizing pure CSS & utility-first Tailwind CSS classes.',
          order_index: 1,
          created_at: now
        },
        {
          id: `stage-${course.id}-2`,
          course_id: course.id,
          title: 'Month 2: Coding Interactions & Dynamic Logic',
          description: 'Unlock JavaScript ES6 syntax, client-side event loops, API integration, and strong typed modeling via TypeScript.',
          order_index: 2,
          created_at: now
        },
        {
          id: `stage-${course.id}-3`,
          course_id: course.id,
          title: 'Month 3: Production Delivery with React & NextJS',
          description: 'Build robust single-page applications. Master React states, NextJS App Router architectures, server layout, and production Vercel hosting.',
          order_index: 3,
          created_at: now
        }
      );
    } else if (course.id === 'course-ai-web') {
      course_stages.push(
        {
          id: `stage-${course.id}-1`,
          course_id: course.id,
          title: 'Module 1: Prompt Engineering & Web Basics',
          description: 'Introduction to prompt styling guidelines and AI-assisted structure building. Formulate precise context instructions and generate standard HTML & CSS layout pages.',
          order_index: 1,
          created_at: now
        },
        {
          id: `stage-${course.id}-2`,
          course_id: course.id,
          title: 'Module 2: Server Integration & Backend Proxies',
          description: 'Orchestrate integrated database schemas, define system backend servers, and build Express routes securely using rapid semantic blueprints.',
          order_index: 2,
          created_at: now
        },
        {
          id: `stage-${course.id}-3`,
          course_id: course.id,
          title: 'Module 3: Deployments, Domain Routing & Cheap Hosting',
          description: 'Learn modern app deployment workflows. Find out exactly where and how to purchase cheap, durable domains and host your apps securely for the global market.',
          order_index: 3,
          created_at: now
        }
      );
    } else {
      course_stages.push(
        {
          id: `stage-${course.id}-1`,
          course_id: course.id,
          title: 'Module 1: Foundational Frameworks & Essentials',
          description: 'Understand the basic vocabulary, system configurations, layout setups, and primary tools associated with this training.',
          order_index: 1,
          created_at: now
        },
        {
          id: `stage-${course.id}-2`,
          course_id: course.id,
          title: 'Module 2: Practical Exercises & Real-World Projects',
          description: 'Engage in curated hands-on workshops. Build full physical design assets or software items based on specific customer prompts.',
          order_index: 2,
          created_at: now
        },
        {
          id: `stage-${course.id}-3`,
          course_id: course.id,
          title: 'Module 3: Mastery Review, Portfolio & Capstone Examination',
          description: 'Integrate the entire toolkit. Package your assets into a professional career portfolio and complete the final Delight Tech Academy graduation checkout.',
          order_index: 3,
          created_at: now
        }
      );
    }
  });

  // Master profiles (Admin and 2 Demo Students)
  const profiles: Profile[] = [
    {
      id: 'user-admin',
      full_name: 'John Adeagbo',
      email: 'delighttechnetwork@gmail.com',
      phone: '09038070539',
      role: 'admin',
      password: 'delightadmin123',
      avatar_url: 'https://picsum.photos/seed/john/200/200',
      created_at: now
    },
    {
      id: 'user-stud1',
      full_name: 'Adebayo Chukwu',
      email: 'student1@delight.com',
      phone: '07089627177',
      role: 'student',
      password: 'student123',
      avatar_url: 'https://picsum.photos/seed/adebayo/200/200',
      created_at: now
    },
    {
      id: 'user-stud2',
      full_name: 'Oluwaseun Ibrahim',
      email: 'student2@delight.com',
      phone: '08123456789',
      role: 'student',
      password: 'student123',
      avatar_url: 'https://picsum.photos/seed/seun/200/200',
      created_at: now
    }
  ];

  // Enrollments
  // Student 1: Enrolled in Frontend Dev (active, completed stages 1 and 2 -> progress 66.6%)
  // Student 2: Enrolled in Free Class HTML & CSS (completed! progress 100%, issued certificate)
  const enrollments: Enrollment[] = [
    {
      id: 'enroll-stud1-frontend',
      student_id: 'user-stud1',
      course_id: 'course-frontend-dev',
      status: 'active',
      payment_status: 'paid',
      enrolled_at: now
    },
    {
      id: 'enroll-stud2-free',
      student_id: 'user-stud2',
      course_id: 'course-free-web',
      status: 'completed',
      payment_status: 'free',
      enrolled_at: now,
      completed_at: now
    }
  ];

  const progress: StudentProgress[] = [
    // Student 1 progress (stages completed: 1 & 2. Stage 3 is not completed)
    { id: 'prog-s1-f1', enrollment_id: 'enroll-stud1-frontend', stage_id: 'stage-course-frontend-dev-1', completed: true, completed_at: now },
    { id: 'prog-s1-f2', enrollment_id: 'enroll-stud1-frontend', stage_id: 'stage-course-frontend-dev-2', completed: true, completed_at: now },
    { id: 'prog-s1-f3', enrollment_id: 'enroll-stud1-frontend', stage_id: 'stage-course-frontend-dev-3', completed: false },

    // Student 2 progress (all completed!)
    { id: 'prog-s2-f1', enrollment_id: 'enroll-stud2-free', stage_id: 'stage-course-free-web-1', completed: true, completed_at: now },
    { id: 'prog-s2-f2', enrollment_id: 'enroll-stud2-free', stage_id: 'stage-course-free-web-2', completed: true, completed_at: now },
    { id: 'prog-s2-f3', enrollment_id: 'enroll-stud2-free', stage_id: 'stage-course-free-web-3', completed: true, completed_at: now }
  ];

  const certificates: Certificate[] = [
    {
      id: 'cert-stud2-free',
      enrollment_id: 'enroll-stud2-free',
      issued_at: now,
      unique_code: 'DTN-2026-00042'
    }
  ];

  const registrations: Registration[] = [
    {
      id: 'reg-demo-1',
      full_name: 'Florence Adeleke',
      email: 'florencetech@gmail.com',
      phone: '08166527812',
      course_id: 'course-smartphone-design',
      message: 'Hello, what times are the classes for smartphone graphics design scheduled in Dugbe?',
      source: 'website',
      status: 'new',
      submitted_at: now
    },
    {
      id: 'reg-demo-2',
      full_name: 'Tunde Olatunji',
      email: 'tundex@yahoo.com',
      phone: '09055883210',
      course_id: 'course-cyber',
      message: 'I want to know if physical attendance is binary or we can participate hybrid.',
      source: 'contact',
      status: 'contacted',
      submitted_at: now
    }
  ];

  return {
    profiles,
    categories,
    courses,
    course_stages,
    enrollments,
    progress,
    certificates,
    registrations
  };
}

// Low-level DB reading and writing with locks/caching
export function loadDb(): DatabaseSchema {
  if (cachedDb) return cachedDb;

  try {
    if (fs.existsSync(DB_FILE)) {
      const dataStr = fs.readFileSync(DB_FILE, 'utf-8');
      cachedDb = JSON.parse(dataStr);
    } else {
      cachedDb = getSeedData();
      saveDb(cachedDb);
    }
  } catch (error) {
    console.error('Error loading database file, using fallback seeded data:', error);
    cachedDb = getSeedData();
  }

  return cachedDb!;
}

export function saveDb(data: DatabaseSchema): void {
  cachedDb = data;
  try {
    // Write atomically
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (error) {
    console.error('Error writing database to disk:', error);
  }
}
