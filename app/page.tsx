'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import QuickRegisterModal from '@/components/public/QuickRegisterModal';

import johnAdeagboImg from '@/src/assets/images/john_adeagbo_1781654503093.jpg';
import aiCourseFlyer from '@/src/assets/images/aiweb_course_flyer_1781654534533.jpg';
import smartphoneCourseFlyer from '@/src/assets/images/smartphone_course_flyer_1781654557379.jpg';
import frontendCourseFlyer from '@/src/assets/images/frontend_course_flyer_1781654572643.jpg';
import { useApp } from '@/lib/AppContext';
import { 
  ArrowRight, 
  Play, 
  Code, 
  Palette, 
  Video, 
  Layout, 
  ShieldAlert, 
  Compass, 
  GraduationCap, 
  CheckCircle, 
  BookOpen, 
  Clock, 
  Award,
  ChevronLeft,
  ChevronRight,
  Shield,
  Briefcase,
  Users,
  Building,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';

// Custom Animated Counting Number Component triggered by scroll intersection observer
function CountingNumber({ value, suffix = '', duration = 1.8 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setCount(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const end = value;
          if (start === end) return;

          const totalMilliseconds = duration * 1000;
          const incrementTime = 16; // Roughly 60fps
          const totalSteps = totalMilliseconds / incrementTime;
          const step = end / totalSteps;
          
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              clearInterval(timer);
              setCount(end);
            } else {
              setCount(Math.floor(start));
            }
          }, incrementTime);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span ref={elementRef} className="font-mono">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function HomePage() {
  const { courses, categories, openRegModal } = useApp();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Filter 3 elite courses for featured listings
  const featuredCourses = courses.filter(c => 
    c.id === 'course-frontend-dev' || 
    c.id === 'course-smartphone-design' || 
    c.id === 'course-ai-web'
  );

  const testimonials = [
    {
      name: 'Oluwafemi Ajayi',
      course: 'Full Stack Development',
      role: 'Junior Engineer at Moniepoint',
      quote: 'Delight Academy is different because they don\'t do theory. We were writing server APIs and deploying apps on day three. I joined from Dugbe, completed my capstone, and now I work remotely for a fintech!',
      image: 'https://picsum.photos/seed/ajayi/120/120'
    },
    {
      name: 'Khadijat Gbadamosi',
      course: 'Smartphone Design',
      role: 'Freelance Brand Designer',
      quote: 'I didn\'t even have a laptop, so I took the Smartphone Graphics course for ₦5,000. It changed my life completely! John taught me brand rules, how to find clients on WhatsApp, and design banners on my phone. Now I make ₦150k monthly from local businesses.',
      image: 'https://picsum.photos/seed/khadijat/120/120'
    },
    {
      name: 'Eze Chinedu',
      course: 'AI Web Development',
      role: 'Agency Founder',
      quote: 'The Prompt Engineering and Vibe Coding curriculum is pure fire. John showed us how to orchestrate multiple LLM agents blocks to write fully styled web solutions in hours. Delight is literally lighting the tech industry in Ibadan!',
      image: 'https://picsum.photos/seed/eze/120/120'
    }
  ];

  // Map category icons helper
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Palette': return <Palette className="h-6 w-6 text-pink-400" />;
      case 'Code': return <Code className="h-6 w-6 text-cyan-400" />;
      case 'Video': return <Video className="h-6 w-6 text-yellow-400" />;
      case 'Layout': return <Layout className="h-6 w-6 text-emerald-400" />;
      case 'ShieldAlert': return <ShieldAlert className="h-6 w-6 text-red-400" />;
      case 'Compass': return <Compass className="h-6 w-6 text-purple-400" />;
      default: return <GraduationCap className="h-6 w-6 text-cyan-400" />;
    }
  };

  const handleNextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-brand select-none text-text-brand relative">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 flex items-center justify-center min-h-[85vh] bg-bg-brand transition-colors duration-300" id="hero-section">
        {/* Animated background glows */}
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-cyan-400/[0.03] dark:bg-cyan-400/5 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#FFC430]/[0.03] dark:bg-[#FFC430]/5 blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/5 px-4 py-1.5 text-xs font-semibold text-black dark:text-cyan-300 font-mono mb-8 backdrop-blur-sm animate-pulse">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            Admissions Open — July 2026 Batches
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl leading-tight max-w-5xl mx-auto text-text-brand">
            Learn. Build. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#FFC430]">Launch.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl md:text-2xl text-text-brand-muted max-w-3xl mx-auto font-light leading-relaxed">
            {"Nigeria's Premier Tech Academy — "}<span className="text-cyan-400 font-medium">Lighting Through Technology</span>. Acquire 100% hands-on physical skills within Ibadan, Oyo State.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/courses" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-8 py-4 text-base font-bold text-[#0A1228] hover:bg-cyan-350 transition-all shadow-lg shadow-cyan-400/10 active:scale-95 animate-bounce-subtle"
            >
              Explore Courses
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <button 
              onClick={() => openRegModal()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-border-brand bg-card-brand/50 px-8 py-4 text-base font-semibold text-text-brand hover:bg-card-brand hover:border-gray-500 transition-all cursor-pointer"
            >
              Watch Academy Overview Included
              <Play className="h-4.5 w-4.5 fill-text-brand text-text-brand shrink-0" />
            </button>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-bg-brand-darker border-y border-border-brand py-12 transition-colors duration-300" id="stats-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              className="space-y-2 p-4 border-r border-border-brand/70 last:border-0"
            >
              <div className="flex justify-center text-cyan-400">
                <Users className="h-6 w-6 stroke-2" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-text-brand tracking-tight">
                <CountingNumber value={500} suffix="+" />
              </div>
              <div className="text-xs sm:text-sm text-text-brand-muted font-mono uppercase tracking-wider">Students Trained</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 100 }}
              className="space-y-2 p-4 border-r-0 md:border-r border-border-brand/70"
            >
              <div className="flex justify-center text-[#FFC430]">
                <BookOpen className="h-6 w-6 stroke-2" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-text-brand tracking-tight">
                <CountingNumber value={12} suffix="+" />
              </div>
              <div className="text-xs sm:text-sm text-text-brand-muted font-mono uppercase tracking-wider">Custom Courses</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
              className="space-y-2 p-4 border-r border-border-brand/70"
            >
              <div className="flex justify-center text-emerald-400">
                <CheckCircle className="h-6 w-6 stroke-2" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-text-brand tracking-tight">
                <CountingNumber value={100} suffix="%" />
              </div>
              <div className="text-xs sm:text-sm text-text-brand-muted font-mono uppercase tracking-wider">Fully Practical</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 100 }}
              className="space-y-2 p-4"
            >
              <div className="flex justify-center text-pink-400">
                <Building className="h-6 w-6 stroke-2" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-text-brand tracking-tight truncate px-1 font-sans">Ibadan, Oyo</div>
              <div className="text-xs sm:text-sm text-text-brand-muted font-mono uppercase tracking-wider">Cocoa House, Dugbe</div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* COURSE CATEGORIES */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans" id="categories-section">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="text-[#FFC430] font-mono text-xs font-semibold uppercase tracking-wider">
            Explore Frameworks
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-brand mt-1">
            Syllabus Specializations
          </h2>
          <p className="text-text-brand-muted mt-3 max-w-xl mx-auto text-sm sm:text-base">
            Select an academy specialization to view its curriculum catalog and enroll.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div 
              key={category.id}
              initial={{ opacity: 0, y: 60, scale: 0.93 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-80px" }}
              transition={{ duration: 0.6, delay: (index % 3) * 0.15, ease: "easeOut" }}
              className="group relative rounded-2xl border border-border-brand bg-card-brand p-6 hover:border-cyan-400/30 transition-all duration-350 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
            >
              {/* Highlight bar hover effect */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-all origin-left duration-300" />
              
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-brand border border-border-brand group-hover:border-cyan-400/20 group-hover:bg-border-brand transition-colors">
                  {getCategoryIcon(category.icon)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-brand group-hover:text-cyan-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-text-brand-muted leading-relaxed mt-2 line-clamp-3">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-border-brand/40 flex justify-end">
                <Link 
                  href={`/courses?category=${category.id}`}
                  className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  View Courses
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="bg-bg-brand-darker py-24 transition-colors duration-300 font-sans" id="featured-courses">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16"
          >
            <div>
              <span className="text-[#FFC430] font-mono text-xs font-semibold uppercase tracking-wider">
                Most Popular
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-brand mt-1">
                Featured Programs
              </h2>
              <p className="text-text-brand-muted mt-2 text-sm sm:text-base max-w-lg">
                Highly requested physical programs. Zero fluff, absolute job readiness.
              </p>
            </div>
            <Link 
              href="/courses" 
              className="mt-4 md:mt-0 text-sm font-semibold text-cyan-400 hover:text-cyan-350 flex items-center gap-1.5 transition-colors"
            >
              View All 12 Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCourses.map((course, index) => {
              const catObj = categories.find(c => c.id === course.category_id);
              
              // Custom high fidelity image mapping
              let thumbnailSrc = course.thumbnail_url || 'https://picsum.photos/seed/dtn/600/400';
              if (course.id === 'course-ai-web') {
                thumbnailSrc = aiCourseFlyer.src;
              } else if (course.id === 'course-smartphone-design') {
                thumbnailSrc = smartphoneCourseFlyer.src;
              } else if (course.id === 'course-frontend-dev') {
                thumbnailSrc = frontendCourseFlyer.src;
              }

              return (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, y: 60, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                  className="rounded-2xl border border-border-brand bg-card-brand overflow-hidden flex flex-col justify-between hover:border-cyan-400/20 hover:bg-card-brand-hover transition-all group"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative h-48 w-full overflow-hidden bg-bg-brand select-none">
                      <img 
                        src={thumbnailSrc} 
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 rounded-md bg-cyan-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0A1228]">
                        {catObj?.name || 'Curriculum'}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-6 space-y-4">
                      <div className="flex gap-4 items-center text-xs text-text-brand-muted font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-cyan-400" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          <GraduationCap className="h-3.5 w-3.5 text-yellow-500" />
                          {course.level}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-text-brand group-hover:text-cyan-400 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-text-brand-muted font-medium select-none italic mt-0.5">
                          {course.subtitle}
                        </p>
                        <p className="text-sm text-text-brand-muted leading-relaxed mt-2.5 line-clamp-3 font-sans">
                          {course.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action footer */}
                  <div className="p-6 pt-0 border-t border-border-brand/40 mt-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-text-brand-muted-darker uppercase font-mono tracking-wider">Price</span>
                      <span className="text-xl font-bold font-mono text-cyan-400">
                        {course.price === 0 ? 'FREE' : `₦${course.price.toLocaleString()}`}
                      </span>
                    </div>
                    <button
                      onClick={() => openRegModal(course.id)}
                      className="rounded-lg bg-bg-brand px-4 py-2.5 text-xs font-bold text-cyan-400 hover:bg-cyan-400 hover:text-[#0A1228] transition-all border border-border-brand hover:border-transparent active:scale-95 cursor-pointer"
                    >
                      Apply Now
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE DELIGHT ACADEMY */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans" id="values-grid">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="text-[#FFC430] font-mono text-xs font-semibold uppercase tracking-wider font-bold">Our Core Pillars</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-brand mt-1 shadow-sm">Why Choose Us?</h2>
          <p className="text-text-brand-muted mt-2 max-w-md mx-auto text-sm">
            We are dedicated to practical execution. Here is how we light your tech career.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: "-80px" }}
            transition={{ duration: 0.6, type: "spring", stiffness: 90 }}
            className="rounded-2xl border border-border-brand bg-card-brand p-6 space-y-4 hover:bg-card-brand-hover transition-colors overflow-hidden"
          >
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-cyan-400/5 text-cyan-300">
              <Code className="h-6 w-6 stroke-2" />
            </div>
            <h3 className="text-lg font-bold text-text-brand">Hands-on practicals</h3>
            <p className="text-sm text-text-brand-muted leading-relaxed font-sans">
              No generic lecturing. Students build real web systems, design projects, and video animations to construct a dynamic, client-ready portfolio before graduating.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15, type: "spring", stiffness: 90 }}
            className="rounded-2xl border border-border-brand bg-card-brand p-6 space-y-4 hover:bg-card-brand-hover transition-colors overflow-hidden"
          >
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-yellow-400/5 text-yellow-300">
              <Award className="h-6 w-6 stroke-2" />
            </div>
            <h3 className="text-lg font-bold text-text-brand">Expert Trainer John</h3>
            <p className="text-sm text-text-brand-muted leading-relaxed font-sans">
              Learn directly from veteran software lead John Adeagbo inside Heritage Mall, Dugbe, receiving precise guidance tailored to local and global industries.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 90 }}
            className="rounded-2xl border border-border-brand bg-card-brand p-6 space-y-4 hover:bg-card-brand-hover transition-colors overflow-hidden"
          >
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-400/5 text-emerald-300">
              <CheckCircle className="h-6 w-6 stroke-2" />
            </div>
            <h3 className="text-lg font-bold text-text-brand">Honest pricing setup</h3>
            <p className="text-sm text-text-brand-muted leading-relaxed font-sans">
              Courses from ₦5,000 for mobile designers up to high-end Full Stack pipelines, as part of our core mandate to keep tech coaching affordable for Ibadan youth.
            </p>
          </motion.div>

        </div>
      </section>

      {/* FOUNDER PROFILE SECTION */}
      <section className="bg-bg-brand-darker py-24 transition-colors duration-300" id="instructor-profile">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-border-brand bg-card-brand p-8 sm:p-12 grid grid-cols-1 md:grid-cols-5 gap-10 items-center hover:bg-card-brand-hover transition-colors duration-300 overflow-hidden"
          >
            
            <div className="md:col-span-2 flex justify-center">
              <div className="relative h-64 w-64 rounded-full overflow-hidden border-4 border-cyan-400 p-1 bg-bg-brand shadow-2xl">
                <img 
                  src={johnAdeagboImg.src}
                  alt="John Adeagbo"
                  className="h-full w-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 right-2 flex items-center justify-center h-10 w-10 rounded-full bg-[#FFC430] border border-[#0A1228] shrink-0">
                  <Zap className="h-5 w-5 text-[#0A1228] fill-[#0A1228]" />
                </div>
              </div>
            </div>

            <div className="md:col-span-3 space-y-4">
              <span className="text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
                Lead Instructor & Founder
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-text-brand">John Adeagbo</h2>
              <p className="text-[#FFC430] text-sm font-mono leading-none">
                Delight Tech Network Lead Engineer & Tech Evangelist
              </p>
              
              <p className="text-text-brand-muted text-sm sm:text-base leading-relaxed font-sans pt-2">
                {"\"Our single mission is to light Ibadan through premium, 100% functional, practical technology training. We don't teach from books written 10 years ago. We show you exactly how to write full apps, build graphics, leverage prompt tools, and design animations to secure modern freelance contracts and corporate engineering roles.\""}
              </p>

              <div className="pt-4 flex flex-wrap gap-3 text-[#FFC430] font-mono text-[11px] font-bold tracking-wider select-none">
                <span className="rounded-full bg-bg-brand px-3.5 py-1.5 text-text-brand-muted">#FullStackCoder</span>
                <span className="rounded-full bg-bg-brand px-3.5 py-1.5 text-text-brand-muted">#IbadanTechEvangelist</span>
                <span className="rounded-full bg-bg-brand px-3.5 py-1.5 text-text-brand-muted">#PromptMaster</span>
              </div>
              <div className="pt-4 flex flex-wrap gap-2 items-center">
                <span className="text-xs text-text-brand-muted font-mono select-none mr-1">Connect with John:</span>
                <a 
                  href="https://www.facebook.com/profile.php?id=61586658868551" 
                  target="_blank" 
                  rel="noreferrer"
                  className="rounded bg-[#1877F2]/10 border border-[#1877F2]/30 px-2.5 py-1 text-[11px] font-bold text-[#1877F2] font-mono hover:bg-[#1877F2]/20 transition-all cursor-pointer"
                >
                  Facebook
                </a>
                <a 
                  href="https://www.instagram.com/john_adeagbo?igsh=em5zZ2ZrMnB1MWd2" 
                  target="_blank" 
                  rel="noreferrer"
                  className="rounded bg-[#E1306C]/10 border border-[#E1306C]/30 px-2.5 py-1 text-[11px] font-bold text-[#E1306C] font-mono hover:bg-[#E1306C]/20 transition-all cursor-pointer"
                >
                  Instagram
                </a>
                <a 
                  href="https://www.tiktok.com/@john.adeagbo?_r=1&_t=ZS-96dikz6ULh7" 
                  target="_blank" 
                  rel="noreferrer"
                  className="rounded bg-white/5 border border-white/20 px-2.5 py-1 text-[11px] hover:text-cyan-400 font-mono hover:bg-white/10 transition-all cursor-pointer"
                >
                  TikTok
                </a>
                <a 
                  href="https://www.linkedin.com/in/john-adeagbo-85182325a?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
                  target="_blank" 
                  rel="noreferrer"
                  className="rounded bg-[#0077B5]/10 border border-[#0077B5]/30 px-2.5 py-1 text-[11px] font-bold text-[#0077B5] font-mono hover:bg-[#0077B5]/20 transition-all cursor-pointer"
                >
                  LinkedIn
                </a>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS CAROUSEL */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" id="testimonials">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-[#FFC430] font-mono text-xs font-semibold uppercase tracking-wider font-bold">Success Stories</span>
          <h2 className="text-3xl font-bold tracking-tight text-text-brand mt-1 shadow-sm">From Ibadan to the World</h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl border border-border-brand bg-card-brand p-8 sm:p-12 shadow-xl hover:bg-card-brand-hover transition-colors duration-300 overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-6">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden shrink-0 border-2 border-cyan-400 bg-bg-brand">
              <img 
                src={testimonials[currentTestimonial].image} 
                alt={testimonials[currentTestimonial].name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-lg font-bold text-text-brand leading-none">
                {testimonials[currentTestimonial].name}
              </h4>
              <p className="text-xs text-cyan-400 font-mono mt-1 mb-1 bg-cyan-400/5 border border-cyan-400/10 px-2 py-0.5 rounded-md inline-block">
                Course: {testimonials[currentTestimonial].course}
              </p>
              <p className="text-xs text-[#FFC430] font-medium leading-none block">
                {testimonials[currentTestimonial].role}
              </p>
            </div>
          </div>

          <blockquote className="text-base sm:text-lg text-text-brand-muted italic leading-relaxed text-center sm:text-left">
            “{testimonials[currentTestimonial].quote}”
          </blockquote>

          {/* Controls */}
          <div className="flex justify-end gap-3 mt-8">
            <button 
              onClick={handlePrevTestimonial}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-brand text-text-brand hover:text-[#0A1228] hover:bg-cyan-400 transition-all border border-border-brand cursor-pointer"
              aria-label="Previous story"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={handleNextTestimonial}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-brand text-text-brand hover:text-[#0A1228] hover:bg-cyan-400 transition-all border border-border-brand cursor-pointer"
              aria-label="Next story"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-gradient-to-r from-cyan-400 to-[#009ca2] py-16 text-center text-[#0A1228]" id="cta-banner">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Start Your Tech Journey?
          </h2>
          <p className="text-[#081223] text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
            Join the ranks of successful self-made developers, content creators, and brand engineers. Learn practically under John Adeagbo in Ibadan, Oyo State.
          </p>
          <button 
            onClick={() => openRegModal()}
            className="rounded-xl bg-[#0A1228] text-white px-8 py-4 text-base font-bold transition-all hover:bg-gray-900 shadow-xl cursor-pointer"
          >
            Register Now
          </button>
        </div>
      </section>

      <Footer />
      <QuickRegisterModal />
    </div>
  );
}
