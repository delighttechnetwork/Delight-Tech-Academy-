'use client';

import React from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { useApp } from '@/lib/AppContext';
import {
  Users,
  Target,
  MapPin,
  Award,
  CheckCircle2,
  Cpu,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import johnAdeagboImg from '@/src/assets/images/john_adeagbo_1781654503093.jpg';

export default function AboutPage() {
  const { openRegModal } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-bg-brand text-text-brand">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden border-b border-border-brand">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-400/5 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6"
            >
              <Sparkles className="h-4 w-4" />
              Lighting Through Technology
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight"
            >
              Building the Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#FFC430]">Tech in Ibadan.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-xl text-text-brand-muted max-w-3xl mx-auto font-light leading-relaxed"
            >
              Delight Tech Network Academy is more than a school. We are a hub for innovation, practical skill acquisition, and career transformation.
            </motion.p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                  <Target className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold">Our Mission</h2>
                <p className="text-text-brand-muted leading-relaxed text-lg">
                  To empower Nigerian youth with globally relevant, 100% practical technology skills that bridge the gap between education and employment. We believe in learning by building.
                </p>
              </div>

              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                  <Cpu className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold">Our Vision</h2>
                <p className="text-text-brand-muted leading-relaxed text-lg">
                  To become Africa&apos;s leading practical tech hub, fostering a generation of digital creators, software engineers, and innovative entrepreneurs starting from the heart of Oyo State.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden border border-border-brand aspect-square md:aspect-auto md:h-[500px]"
            >
              <img
                src="https://picsum.photos/seed/dtn-office/800/1000"
                alt="Delight Tech Academy Workspace"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1228] to-transparent opacity-60" />
              <div className="absolute bottom-8 left-8">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <MapPin className="h-5 w-5" />
                  Cocoa House, Dugbe, Ibadan
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* The Founder */}
        <section className="bg-bg-brand-darker py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  <div className="absolute -inset-4 bg-cyan-400/20 rounded-full blur-3xl group-hover:bg-cyan-400/30 transition-all" />
                  <div className="relative h-80 w-80 mx-auto rounded-full overflow-hidden border-4 border-cyan-400 p-1 bg-bg-brand shadow-2xl">
                    <img
                      src={johnAdeagboImg.src}
                      alt="John Adeagbo"
                      className="h-full w-full object-cover rounded-full"
                    />
                  </div>
                </motion.div>
              </div>

              <div className="lg:col-span-3 space-y-6">
                <span className="text-cyan-400 font-mono text-sm font-bold uppercase tracking-widest">Founder & Lead Instructor</span>
                <h2 className="text-4xl font-bold text-text-brand">John Adeagbo</h2>
                <p className="text-xl text-text-brand-muted italic font-light leading-relaxed">
                  &quot;I founded Delight Tech Academy to provide the kind of education I wish I had—raw, practical, and results-driven. We don&apos;t just teach code; we teach problem-solving and wealth creation through technology.&quot;
                </p>
                <div className="space-y-4 pt-4">
                  {[
                    'Veteran Software Engineer with 10+ years experience',
                    'Expert in React, NextJS & AI Vibe Coding',
                    'Pioneer of "Lighting Through Technology" movement',
                    'Mentor to 500+ successful tech professionals'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-cyan-400" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Us Stats */}
        <section className="py-20 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-16">Why Students Choose Delight</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Graduates Trained', value: '500+', icon: Users },
              { label: 'Practical Modules', value: '100%', icon: CheckCircle2 },
              { label: 'Career Support', value: 'Yes', icon: GraduationCap },
              { label: 'Ibadan Presence', value: 'Physical', icon: MapPin },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-card-brand border border-border-brand hover:border-cyan-400/30 transition-colors"
              >
                <div className="h-12 w-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 mx-auto mb-4">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold text-text-brand mb-1">{stat.value}</div>
                <div className="text-sm text-text-brand-muted font-mono uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Join CTA */}
        <section className="py-20 bg-gradient-to-r from-cyan-400 to-[#009ca2] text-[#0A1228] text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Ready to join our community?</h2>
            <p className="text-lg mb-10 opacity-90 font-medium">
              Take the first step towards a rewarding career in technology today. Join us at Cocoa House, Ibadan.
            </p>
            <button
              onClick={() => openRegModal()}
              className="bg-[#0A1228] text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-black transition-colors shadow-xl"
            >
              Start Learning Now
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
