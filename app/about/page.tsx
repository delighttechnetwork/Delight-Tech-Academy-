'use client';

import React from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import QuickRegisterModal from '@/components/public/QuickRegisterModal';
import johnAdeagboImg from '@/src/assets/images/john_adeagbo_1781654503093.jpg';
import { useApp } from '@/lib/AppContext';
import { ShieldCheck, Award, Zap, Heart, MapPin, Building, Rocket, GraduationCap } from 'lucide-react';

export default function AboutPage() {
  const { openRegModal } = useApp();

  const values = [
    {
      title: '100% Practical',
      description: 'We don\'t read textbook guides from 10 years ago. Every class is hands-on. You code websites, design real branding campaigns, and render cinema clips.',
      icon: <Zap className="h-6 w-6 text-[#FFC430]" />
    },
    {
      title: 'Extreme Affordability',
      description: 'We structure pricing to empower every Oyo citizen. Our graphics curricula start at just ₦5,000 because elite tech training is a fundamental human right.',
      icon: <Heart className="h-6 w-6 text-pink-400" />
    },
    {
      title: 'Direct Market Readiness',
      description: 'John designs every track around high-dividend global freelance, remote corporate software engineering roles, and local Nigerian agency requirements.',
      icon: <Rocket className="h-6 w-6 text-cyan-400" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0A1228] text-white select-none">
      <Navbar />

      {/* CORE HERO SUMMARY */}
      <section className="relative overflow-hidden py-16 md:py-20 bg-[#050a18] border-b border-[#111e40] text-center" id="about-header">
        <div className="absolute inset-0 bg-[#00d0d7]/5 blur-3xl animate-pulse-glow" />
        <div className="relative max-w-5xl mx-auto px-4 z-10 space-y-2">
          <span className="text-[#FFC430] font-mono text-xs font-semibold uppercase tracking-wider">Our Identity</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-1">
            "Lighting Through Technology"
          </h1>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto text-sm sm:text-base font-light">
            Bringing elite, practical, accessible tech literacy to the heart of Ibadan, Nigeria. Headquartered at the historic Cocoa House, Dugbe.
          </p>
        </div>
      </section>

      {/* MISSION, VISION & STORY */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">How We Started</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Our Academy Story</h2>
            <p className="text-sm text-gray-400 leading-relaxed font-sans">
              Founded by veteran developer John Adeagbo, Delight Tech Network Academy was birthed out of a simple core problem: traditional school settings in Oyo State focus heavily on memory testing and abstract definitions rather than direct creative construction.
            </p>
            <p className="text-sm text-gray-400 leading-relaxed font-sans">
              We started by gathering local designers and developers in Dugbe to teach them smartphone-based graphic tools. Over time, this grew into a full-scale digital workspace inside Heritage Mall, offering full curriculums in full-stack engineering, prompt hacking, and cybersecurity, serving over 500 graduates who are actively earning today.
            </p>
          </div>

          <div className="space-y-4 p-8 rounded-2xl border border-[#111e40] bg-[#0c1630]">
            <div className="space-y-1">
              <span className="text-xs text-[#FFC430] font-mono uppercase font-bold tracking-wider">Core Mission</span>
              <p className="text-sm text-gray-300 italic font-sans leading-relaxed">
                "To democratize elite software, design, and cybersecurity coaching, equipping Ibadan youth with robust, practical portfolios that turn them into competitive remote candidates in global markets."
              </p>
            </div>
            
            <div className="border-t border-[#111e40] pt-4 mt-4 space-y-1">
              <span className="text-xs text-cyan-400 font-mono uppercase font-bold tracking-wider">Core Vision</span>
              <p className="text-sm text-gray-300 italic font-sans leading-relaxed">
                "A digitally lit Oyo state, where technological competency serves as an escape pipeline from poverty, powering independent freelancing hubs and starting world-class tech firms inside Nigeria."
              </p>
            </div>
          </div>
        </div>

        {/* VALUES PILLARS */}
        <div className="space-y-10" id="values-grid">
          <div className="text-center">
            <span className="text-[#FFC430] font-mono text-xs font-semibold uppercase tracking-wider">Operating Rules</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Our Academy Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-[#111e40] bg-[#0c1630] p-6 space-y-3 hover:border-cyan-400/20 transition-all">
                <div className="h-10 w-10 rounded-lg bg-[#0A1228] border border-[#111e40] flex items-center justify-center">
                  {v.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{v.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">{v.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FOUNDER BLOCK RE-GRID */}
        <div className="rounded-2xl border border-[#111e40] bg-[#0c1630] p-8 sm:p-12" id="founder-re-grid">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-2 flex justify-center">
              <div className="relative h-56 w-56 rounded-2xl overflow-hidden border-2 border-[#FFC430] p-0.5 bg-[#0A1228]">
                <img 
                  src={johnAdeagboImg.src}
                  alt="John Adeagbo"
                  className="h-full w-full object-cover rounded-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="md:col-span-3 space-y-4">
              <span className="text-[#FFC430] font-mono text-xs font-semibold uppercase tracking-wider">Meet the Founder</span>
              <h3 className="text-2xl font-bold text-white leading-none">John Adeagbo</h3>
              <p className="text-xs text-cyan-400 font-mono">Principal Lead & Senior Systems Lead Engineer</p>
              <p className="text-sm text-gray-400 leading-relaxed font-sans">
                John is an advocate for "Vibe Coding" and LLM-assisted fullstack software. He has spent over 8 years writing code for financial frameworks, deploying cloud infrastructure, and consulting for startups. He has a passion for developer education, helping youths bypass traditional university limits to gain direct tech competence in weeks.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-400 font-mono select-none mr-1">John's Handles:</span>
                <a 
                  href="https://www.facebook.com/profile.php?id=61586658868551" 
                  target="_blank" 
                  rel="noreferrer"
                  className="rounded bg-[#1877F2]/10 border border-[#1877F2]/30 px-2 py-0.5 text-[10px] font-bold text-[#1877F2] font-mono hover:bg-[#1877F2]/20 transition-all cursor-pointer"
                >
                  Facebook
                </a>
                <a 
                  href="https://www.instagram.com/john_adeagbo?igsh=em5zZ2ZrMnB1MWd2" 
                  target="_blank" 
                  rel="noreferrer"
                  className="rounded bg-[#E1306C]/10 border border-[#E1306C]/30 px-2 py-0.5 text-[10px] font-bold text-[#E1306C] font-mono hover:bg-[#E1306C]/20 transition-all cursor-pointer"
                >
                  Instagram
                </a>
                <a 
                  href="https://www.tiktok.com/@john.adeagbo?_r=1&_t=ZS-96dikz6ULh7" 
                  target="_blank" 
                  rel="noreferrer"
                  className="rounded bg-white/5 border border-white/20 px-2 py-0.5 text-[10px] font-bold text-white font-mono hover:bg-white/10 transition-all cursor-pointer"
                >
                  TikTok
                </a>
                <a 
                  href="https://www.linkedin.com/in/john-adeagbo-85182325a?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
                  target="_blank" 
                  rel="noreferrer"
                  className="rounded bg-[#0077B5]/10 border border-[#0077B5]/30 px-2 py-0.5 text-[10px] font-bold text-[#0077B5] font-mono hover:bg-[#0077B5]/20 transition-all cursor-pointer"
                >
                  LinkedIn
                </a>
              </div>
              <button 
                onClick={() => openRegModal()}
                className="rounded-lg bg-cyan-400 px-5 py-2.5 text-xs font-bold text-[#0A1228] hover:bg-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <GraduationCap className="h-4 w-4" />
                Apply under John Adeagbo
              </button>
            </div>
          </div>
        </div>

        {/* EMBED MAP SECTION */}
        <div className="space-y-6" id="embed-maps-section">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <span className="text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">Our Location</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">Visit Our Workspace</h2>
              <p className="text-sm text-gray-400 mt-1">Heritage Mall, Cocoa House, Dugbe, Ibadan, Oyo State, Nigeria.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono bg-[#111e40] px-4 py-2 border border-[#111e40] rounded-xl text-cyan-400 select-none">
              <Building className="h-4 w-4" />
              Classes run physically
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#111e40] bg-[#0c1630] h-[350px] relative shadow-lg">
            {/* Real iframe Google maps embed for Dugbe Cocoa House / Ibadan Heritage Mall */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m13!1m4!1s0x10398d2466085a1b%3A0x7d6b9d628d09559e!2sCocoa+House%2C+Ibadan!5m2!1sen!2sng!3s0x10398d246c4f0f03%3A0xe54d9294e7fae4eb!1m2!1d3.8821!2d7.3871"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true}
              loading="lazy" 
              referrerPolicy="no-referrer"
              title="Cocoa House Dugbe Map"
            />
          </div>
        </div>

      </section>

      <Footer />
      <QuickRegisterModal />
    </div>
  );
}
