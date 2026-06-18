'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import QuickRegisterModal from '@/components/public/QuickRegisterModal';
import { useApp } from '@/lib/AppContext';
import {
  Search,
  Filter,
  Clock,
  GraduationCap,
  ArrowRight,
  BookOpen,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function CoursesContent() {
  const { courses, categories, catalogLoading, openRegModal } = useApp();
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state with URL param
  useEffect(() => {
    if (categoryFilter) {
      setSelectedCategory(categoryFilter);
    }
  }, [categoryFilter]);

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category_id === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="flex-grow">
      {/* Header */}
      <section className="bg-bg-brand-darker border-b border-border-brand py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-text-brand tracking-tight"
          >
            Our <span className="text-cyan-400">Curriculum</span> Catalog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-text-brand-muted max-w-2xl mx-auto"
          >
            Explore Nigeria&apos;s most practical tech training programs. From smartphone graphics to advanced full-stack engineering.
          </motion.p>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="sticky top-20 z-40 bg-bg-brand/80 backdrop-blur-md border-b border-border-brand py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-brand-muted" />
              <input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card-brand border border-border-brand rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors"
              />
            </div>

            {/* Category Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-400 border-cyan-400 text-[#0A1228]'
                    : 'bg-card-brand border-border-brand text-text-brand-muted hover:border-cyan-400/30'
                }`}
              >
                All Programs
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-400 border-cyan-400 text-[#0A1228]'
                      : 'bg-card-brand border-border-brand text-text-brand-muted hover:border-cyan-400/30'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {catalogLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-12 w-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-text-brand-muted font-mono text-sm">Synchronizing Curriculum...</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="rounded-2xl border border-border-brand bg-card-brand overflow-hidden flex flex-col group hover:border-cyan-400/20 transition-all"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={course.thumbnail_url || 'https://picsum.photos/seed/dtn/600/400'}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 rounded-md bg-cyan-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0A1228]">
                      {categories.find(c => c.id === course.category_id)?.name || 'Curriculum'}
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex gap-4 items-center text-xs text-text-brand-muted font-mono mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-cyan-400" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1 capitalize">
                        <GraduationCap className="h-3.5 w-3.5 text-yellow-500" />
                        {course.level}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-text-brand group-hover:text-cyan-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[#FFC430] font-medium italic mt-0.5">
                      {course.subtitle}
                    </p>
                    <p className="text-sm text-text-brand-muted leading-relaxed mt-3 line-clamp-3">
                      {course.description}
                    </p>

                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-border-brand/40">
                      <div>
                        <span className="block text-[10px] text-text-brand-muted-darker uppercase font-mono tracking-wider">Tuition Fee</span>
                        <span className="text-xl font-bold font-mono text-cyan-400">
                          {course.price === 0 ? 'FREE' : `₦${course.price.toLocaleString()}`}
                        </span>
                      </div>
                      <button
                        onClick={() => openRegModal(course.id)}
                        className="rounded-lg bg-bg-brand px-4 py-2.5 text-xs font-bold text-cyan-400 hover:bg-cyan-400 hover:text-[#0A1228] transition-all border border-border-brand active:scale-95"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-24 bg-card-brand rounded-3xl border border-dashed border-border-brand">
            <AlertCircle className="h-12 w-12 text-text-brand-muted mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-brand">No courses found</h3>
            <p className="text-text-brand-muted mt-2">Try adjusting your filters or search query.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-6 text-cyan-400 font-bold flex items-center gap-2 mx-auto hover:underline"
            >
              Clear all filters <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>

      {/* Motivation Section */}
      <section className="py-20 bg-bg-brand">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/5 text-cyan-400 mb-6">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold text-text-brand mb-4">Why learn with Delight?</h2>
          <p className="text-text-brand-muted max-w-2xl mx-auto mb-12">
            Our curriculum is built for the modern economy. We focus on 100% practical skills that allow you to start earning immediately.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              'Physical training in Ibadan (Cocoa House)',
              'Veteran mentorship from John Adeagbo',
              'Real-world portfolio projects',
              'Certificate of completion',
              'Freelance & Job placement support',
              'Modern AI-assisted workflows'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 bg-card-brand p-4 rounded-xl border border-border-brand">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-sm font-medium text-text-brand-muted">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function CoursesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-brand text-text-brand">
      <Navbar />
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center">
           <div className="h-12 w-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      }>
        <CoursesContent />
      </Suspense>
      <Footer />
      <QuickRegisterModal />
    </div>
  );
}
