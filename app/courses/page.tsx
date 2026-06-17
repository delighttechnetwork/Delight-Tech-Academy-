'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import QuickRegisterModal from '@/components/public/QuickRegisterModal';

import aiCourseFlyer from '@/src/assets/images/aiweb_course_flyer_1781654534533.jpg';
import smartphoneCourseFlyer from '@/src/assets/images/smartphone_course_flyer_1781654557379.jpg';
import frontendCourseFlyer from '@/src/assets/images/frontend_course_flyer_1781654572643.jpg';
import { useApp } from '@/lib/AppContext';
import { Clock, GraduationCap, ArrowRight, Shield, Globe, Layers, BookOpen, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function CoursesContent() {
  const { courses, categories, openRegModal } = useApp();
  const searchParams = useSearchParams();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Check query parameter category filter on boot
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  // Clean filtered results
  const filteredCourses = courses.filter(course => {
    const matchesCat = selectedCategory === 'all' || course.category_id === selectedCategory;
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      course.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#0A1228] text-white select-none">
      <Navbar />

      {/* PAGE HEADER */}
      <section className="relative overflow-hidden py-16 md:py-20 bg-[#050a18] border-b border-[#111e40] text-center" id="courses-header">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#00d0d7,transparent)] opacity-5" />
        <div className="relative max-w-5xl mx-auto px-4 z-10">
          <span className="text-[#FFC430] font-mono text-xs font-semibold uppercase tracking-wider">
            Academy Catalog
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-1">
            Our Curriculums
          </h1>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
            Ibadan's premier practical training schedules. Categorized from absolute smartphone-only layouts to elite full-stack system orchestration. No credit terms required.
          </p>
        </div>
      </section>

      {/* FILTER & SEARCH */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Side Filter Bar / Controls */}
          <div className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="p-5 rounded-2xl border border-[#111e40] bg-[#0c1630] space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-[#111e40] pb-3 select-none">
                <Filter className="h-4 w-4 text-cyan-400" />
                Category Filters
              </div>

              <div className="flex flex-wrap lg:flex-col gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg text-left transition-all w-full cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-cyan-400 text-[#0A1228]'
                      : 'bg-[#0A1228] text-gray-300 hover:bg-[#111e40]'
                  }`}
                >
                  All Specials ({courses.length})
                </button>

                {categories.map((cat) => {
                  const itemsCount = courses.filter(c => c.category_id === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg text-left transition-all w-auto lg:w-full cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-cyan-400 text-[#0A1228]'
                          : 'bg-[#0A1228] text-gray-300 hover:bg-[#111e40]'
                      }`}
                    >
                      {cat.name} ({itemsCount})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Practical Promise card */}
            <div className="hidden lg:block p-5 rounded-2xl border border-[#111e40]/40 bg-[#0c1630]/40 space-y-3 font-sans">
              <h4 className="text-xs font-bold text-cyan-400 font-mono tracking-wide uppercase">Delight Guarantee</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                All physical sessions are held offline inside Heritage Mall, Dugbe, Ibadan. Power backups and high-speed Wi-Fi limits are fully covered during scheduled hours.
              </p>
            </div>
          </div>

          {/* Core Content Arena */}
          <div className="flex-1 w-full space-y-8">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search class titles, skill outcomes, levels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-[#0c1630] border border-[#111e40] pl-12 pr-4 py-3.5 text-sm text-white placeholder-gray-505 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>

            {/* Courses Displays organized by category sections ifselectedCategory = "all" or direct blocks */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredCourses.map((course) => {
                    const categoryObj = categories.find(c => c.id === course.category_id);
                    
                    // Custom high-fidelity image mapping
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
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        key={course.id}
                        className="rounded-2xl border border-[#111e40] bg-[#0c1630] overflow-hidden hover:border-cyan-400/20 transition-all flex flex-col justify-between group"
                      >
                        <div>
                          {/* Thumbnail header */}
                          <div className="relative h-44 w-full overflow-hidden bg-[#0A1228] select-none">
                            <img 
                              src={thumbnailSrc} 
                              alt={course.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            {categoryObj && (
                              <span className="absolute top-3 left-3 rounded-md bg-[#0c1630]/90 backdrop-blur-sm border border-cyan-400/20 text-[10px] font-semibold tracking-wider text-cyan-400 px-2.5 py-1">
                                {categoryObj.name}
                              </span>
                            )}
                          </div>

                          <div className="p-6 space-y-3">
                            <div className="flex gap-4 items-center text-[11px] font-mono text-gray-400 select-none">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                                {course.duration}
                              </span>
                              <span className="flex items-center gap-1 capitalize">
                                <GraduationCap className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                                {course.level}
                              </span>
                            </div>

                            <div>
                              <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                                {course.title}
                              </h3>
                              <p className="text-[11px] text-[#FFC430] font-medium leading-none italic select-none mt-1">
                                {course.subtitle}
                              </p>
                              <p className="text-sm text-gray-400 leading-relaxed mt-2.5 line-clamp-3">
                                {course.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* pricing bar */}
                        <div className="p-6 pt-0 border-t border-[#111e40]/30 mt-4 flex items-center justify-between">
                          <div>
                            <span className="block text-[9px] text-gray-500 font-mono uppercase tracking-wider select-none">Tuition Cost</span>
                            <span className="text-lg font-bold font-mono text-cyan-400">
                              {course.price === 0 ? 'FREE' : `₦${course.price.toLocaleString()}`}
                            </span>
                          </div>

                          <button
                            onClick={() => openRegModal(course.id)}
                            className="rounded-lg bg-[#111e40] px-4 py-2.5 text-xs font-bold text-cyan-400 hover:bg-cyan-400 hover:text-[#0A1228] transition-all border border-cyan-400/20 active:scale-95 cursor-pointer"
                          >
                            Register for this Course
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-20 rounded-2xl border border-dashed border-[#111e40] bg-[#0c1630]">
                <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">No courses match query</h3>
                <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                  Try adjusting categories filters or refining spelling queries to browse the Delight catalog.
                </p>
                <button
                  onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                  className="mt-4 text-xs font-bold text-cyan-400 border border-cyan-400/20 rounded-lg px-4 py-2 hover:bg-cyan-400/10 cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      <Footer />
      <QuickRegisterModal />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A1228] flex items-center justify-center text-white font-mono">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin border-4 border-cyan-400 border-t-transparent rounded-full mx-auto" />
          <p className="text-xs">Loading course catalog...</p>
        </div>
      </div>
    }>
      <CoursesContent />
    </Suspense>
  );
}
