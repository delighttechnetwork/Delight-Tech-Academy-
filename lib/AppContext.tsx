'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Profile, Course, Category, CourseStage } from './db-store';

interface AppContextType {
  user: Profile | null;
  isLoading: boolean;
  courses: Course[];
  categories: Category[];
  course_stages: CourseStage[];
  catalogLoading: boolean;
  
  // Auth Operations
  login: (email: string, password: string) => Promise<{ error?: string }>;
  registerUser: (payload: { email: string; password: string; full_name: string; phone: string }) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (payload: { full_name?: string; phone?: string; password?: string; avatar_url?: string }) => Promise<{ error?: string }>;
  refreshUser: () => Promise<void>;
  
  // Public Client Workflows
  submitRegistration: (payload: { full_name: string; email: string; phone: string; course_id: string; message?: string }) => Promise<{ error?: string }>;
  submitContact: (payload: { full_name: string; email: string; phone: string; subject: string; message: string }) => Promise<{ error?: string }>;
  
  // Quick-Register Modal State
  isRegModalOpen: boolean;
  selectedRegCourseId: string;
  openRegModal: (courseId?: string) => void;
  closeRegModal: () => void;
  
  // Catalog actions
  refreshCatalog: () => Promise<void>;

  // Theme Management
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [course_stages, setCourseStages] = useState<CourseStage[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  
  // Quick-Register modal states
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedRegCourseId, setSelectedRegCourseId] = useState('');
  
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Initialize theme from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dta_theme') as 'dark' | 'light' | null;
      if (saved) {
        setTheme(saved);
      }
    }
  }, []);

  // Update HTML elements class when theme updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (theme === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('dta_theme', nextTheme);
      }
      return nextTheme;
    });
  };
  
  const router = useRouter();

  // Load Catalog items
  const refreshCatalog = async () => {
    try {
      setCatalogLoading(true);
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'content:get-catalog' })
      });
      const data = await res.json();
      if (!data.error) {
        setCourses(data.courses || []);
        setCategories(data.categories || []);
        setCourseStages(data.course_stages || []);
      }
    } catch (e) {
      console.error('Error fetching course catalog:', e);
    } finally {
      setCatalogLoading(false);
    }
  };

  // Load authenticated user
  const refreshUser = async () => {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auth:me' })
      });
      const data = await res.json();
      if (!data.error && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching user sessions:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCatalog();
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'auth:login',
          payload: { email, password }
        })
      });
      const data = await res.json();
      if (data.error) {
        return { error: data.error };
      }
      setUser(data.user);
      return {};
    } catch (e: any) {
      return { error: e?.message || 'Login request failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (payload: { email: string; password: string; full_name: string; phone: string }) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'auth:register',
          payload
        })
      });
      const data = await res.json();
      if (data.error) {
        return { error: data.error };
      }
      setUser(data.user);
      return {};
    } catch (e: any) {
      return { error: e?.message || 'Signup request failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auth:logout' })
      });
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (payload: { full_name?: string; phone?: string; password?: string; avatar_url?: string }) => {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'auth:update-profile',
          payload
        })
      });
      const data = await res.json();
      if (data.error) return { error: data.error };
      setUser(data.user);
      return {};
    } catch (e: any) {
      return { error: e?.message || 'Profile modification failed.' };
    }
  };

  const submitRegistration = async (payload: { full_name: string; email: string; phone: string; course_id: string; message?: string }) => {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'website:register-course',
          payload
        })
      });
      const data = await res.json();
      if (data.error) return { error: data.error };
      return {};
    } catch (e: any) {
      return { error: e?.message || 'Registration request failed.' };
    }
  };

  const submitContact = async (payload: { full_name: string; email: string; phone: string; subject: string; message: string }) => {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'website:send-contact',
          payload
        })
      });
      const data = await res.json();
      if (data.error) return { error: data.error };
      return {};
    } catch (e: any) {
      return { error: e?.message || 'Contact transmission failed.' };
    }
  };

  const openRegModal = (courseId?: string) => {
    setSelectedRegCourseId(courseId || '');
    setIsRegModalOpen(true);
  };

  const closeRegModal = () => {
    setIsRegModalOpen(false);
    setSelectedRegCourseId('');
  };

  return (
    <AppContext.Provider value={{
      user,
      isLoading,
      courses,
      categories,
      course_stages,
      catalogLoading,
      login,
      registerUser,
      logout,
      updateProfile,
      refreshUser,
      submitRegistration,
      submitContact,
      isRegModalOpen,
      selectedRegCourseId,
      openRegModal,
      closeRegModal,
      refreshCatalog,
      theme,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be utilized within an AppProvider');
  }
  return context;
}
