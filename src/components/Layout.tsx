'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Library,
  PenTool,
  Users, 
  Settings, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  Video,
  User,
  ChevronLeft,
  MessageSquare,
  ShieldCheck,
  Contact as ContactIcon,
  Megaphone,
  ClipboardCheck,
  Award,
  BarChart3,
  Calendar,
  Briefcase,
  Coins,
  FileCheck,
  Trophy,
  GraduationCap,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import SmartTutorsAIChatbot from './SmartTutorsAIChatbot';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { profile, logout, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [openChat, setOpenChat] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { icon: LayoutDashboard, label: t('common.dashboard'), path: '/', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: BookOpen, label: t('common.courses'), path: '/courses', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: Library, label: 'Digital Library', path: '/digital-library', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: PenTool, label: 'Tests & Assignments', path: '/mock-test', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: Trophy, label: 'Quiz Arena', path: '/quiz-arena', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: Calendar, label: 'Lectures', path: '/lectures', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: ClipboardCheck, label: 'Attendance', path: '/attendance', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: FileCheck, label: 'Weekly Tests', path: '/weekly-tests', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: Video, label: 'Active Sessions', path: '/sessions', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: MessageSquare, label: 'Messages', path: '/messages', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: BarChart3, label: 'Performance', path: '/performance', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: Award, label: 'Certificates', path: '/certificates', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: Coins, label: 'Fees & Invoices', path: '/fees', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: Briefcase, label: 'Placements', path: '/placements', roles: ['student', 'admin'] },
    { icon: Users, label: 'Management', path: '/students', roles: ['admin', 'educator'] },
    { icon: Star, label: 'Student Feedback', path: '/feedback', roles: ['educator'] },
    { icon: ContactIcon, label: 'Contact Us', path: '/contact', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: MessageSquare, label: 'AI Chat', path: '#chat', roles: ['student', 'educator', 'admin', 'parent'], isAction: true },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['student', 'educator', 'admin', 'parent'] },
  ];

  const filteredMenu = menuItems.filter(item => profile && item.roles.includes(profile.role));

  useEffect(() => {
    if (!profile) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || data || []);
        }
      } catch {
        setNotifications([]);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [profile]);

  useEffect(() => {
    if (!loading && !profile && pathname !== '/login' && pathname !== '/forgot-password') {
      router.push('/login');
    }
  }, [profile, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academy-orange-600"></div>
      </div>
    );
  }

  if (!profile && pathname !== '/login' && pathname !== '/forgot-password') return null;

  const bottomNavItems = menuItems
    .filter(i => profile && i.roles.includes(profile.role) && !(i as any).isAction)
    .slice(0, 5);

  return (
    <div className="flex justify-center bg-slate-200 min-h-screen">
      <div className="w-full max-w-[430px] bg-slate-50 h-[100dvh] flex flex-col relative overflow-hidden shadow-2xl">
        
        <header className="h-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 sticky top-0 z-30 px-4 flex items-center justify-between pt-[env(safe-area-inset-top)]">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/image1.png" alt="Smart Tutors" className="h-9 w-auto object-contain brightness-0 invert" />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className={`p-2 rounded-full transition-all relative ${pathname === '/notifications' ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10'}`}
            >
               <Bell size={20} />
               {notifications.length > 0 && (
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
               )}
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-300 hover:bg-white/10 rounded-full transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
              />
              <motion.aside 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-0 right-0 h-full w-[80%] bg-white z-50 flex flex-col shadow-2xl"
              >
                <div className="p-6 bg-slate-900 text-white">
                  <header className="flex items-center justify-between mb-6">
                    <button 
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">User Profile</span>
                  </header>

                  <div 
                    onClick={() => {
                      router.push('/profile');
                      setIsSidebarOpen(false);
                    }}
                    className="flex items-center gap-4 cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <User size={28} className="text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg leading-tight group-hover:text-slate-200 transition-colors">
                        {profile?.displayName || profile?.username}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-1">
                        <ShieldCheck size={14} className="text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {profile?.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <nav className="flex-1 px-4 pt-6 space-y-1 overflow-y-auto custom-scrollbar">
                  {filteredMenu.map((item) => {
                    if ((item as any).isAction) {
                      return (
                        <button
                          key={item.path}
                          onClick={() => {
                            setIsSidebarOpen(false);
                            setOpenChat(true);
                          }}
                          className={`
                            w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 text-left
                            text-slate-500 hover:bg-slate-50 hover:text-slate-800
                          `}
                        >
                          <item.icon size={22} strokeWidth={2} />
                          <span className="text-[15px]">{item.label}</span>
                        </button>
                      );
                    }
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`
                          flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200
                          ${pathname === item.path 
                            ? 'bg-academy-orange-50 text-academy-orange-600 font-bold' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
                        `}
                      >
                        <item.icon size={22} strokeWidth={pathname === item.path ? 2.5 : 2} />
                        <span className="text-[15px]">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <button 
                    onClick={() => {
                      logout();
                      setIsSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-colors font-bold mb-4"
                  >
                    <LogOut size={22} />
                    <span>{t('common.logout')}</span>
                  </button>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center">
                    Smart Tutors &bull; v3.0
                  </p>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto pb-20 custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-4">
            {children}
          </div>
        </main>

        {!isSidebarOpen && (
           <nav 
             className="h-16 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-2 sm:hidden absolute bottom-0 left-0 right-0 z-30"
             style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
           >
              {bottomNavItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  className={`p-1 px-2 rounded-xl flex flex-col items-center gap-0.5 transition-all ${pathname === item.path ? 'text-academy-orange-600' : 'text-slate-400'}`}
                >
                  <item.icon size={20} strokeWidth={pathname === item.path ? 2.5 : 2} />
                  <span className="text-[8px] font-bold uppercase tracking-tight">{item.label.split(' ')[0]}</span>
                </Link>
              ))}
           </nav>
        )}

        <SmartTutorsAIChatbot open={openChat} onOpenChange={setOpenChat} />
      </div>
    </div>
  );
}
