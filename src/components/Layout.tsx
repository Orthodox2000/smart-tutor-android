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
  Megaphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
// import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
// import { db } from '../lib/firebase';
import SmartTutorsAIChatbot from './SmartTutorsAIChatbot';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { profile, logout, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { icon: LayoutDashboard, label: t('common.dashboard'), path: '/', roles: ['student', 'teacher', 'admin'] },
    { icon: BookOpen, label: t('common.courses'), path: '/courses', roles: ['student', 'teacher', 'admin'] },
    { icon: Library, label: 'Digital Library', path: '/digital-library', roles: ['student', 'teacher', 'admin'] },
    { icon: PenTool, label: 'Tests & Assignments', path: '/mock-test', roles: ['student', 'teacher', 'admin'] },
    { icon: Users, label: 'Management', path: '/students', roles: ['admin', 'teacher'] },
    { icon: Video, label: 'Active Sessions', path: '/sessions', roles: ['student', 'teacher', 'admin'] },
    { icon: MessageSquare, label: 'Messages', path: '/messages', roles: ['student', 'teacher', 'admin'] },
    { icon: ContactIcon, label: 'Contact Us', path: '/contact', roles: ['student', 'teacher', 'admin'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['student', 'teacher', 'admin'] },
  ];

  const filteredMenu = menuItems.filter(item => profile && item.roles.includes(profile.role));

  useEffect(() => {
    if (!profile) return;

    // Firebase Firestore listener removed
    // const baseQuery = collection(db, 'academy_messages');
    // let q;

    // if (profile.role === 'admin') {
    //   q = query(baseQuery, orderBy('createdAt', 'desc'), limit(5));
    // } else {
    //   q = query(
    //     baseQuery, 
    //     where('target', 'in', ['all', profile.role === 'teacher' ? 'teachers' : 'students']),
    //     orderBy('createdAt', 'desc'), 
    //     limit(5)
    //   );
    // }

    // return onSnapshot(q, (snapshot) => {
    //   setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    // });
    setNotifications([]);
  }, [profile]);

  // Auth Protection
  useEffect(() => {
    if (!loading && !profile && pathname !== '/login') {
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

  if (!profile && pathname !== '/login') return null;

  return (
    <div className="flex justify-center bg-slate-200 min-h-screen">
      <div className="w-full max-w-[430px] bg-slate-50 h-[100dvh] flex flex-col relative overflow-hidden shadow-2xl">
        
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-academy-orange-600 rounded-lg flex items-center justify-center shadow-md shadow-academy-orange-100">
              <BookOpen className="text-white" size={18} />
            </div>
            <span className="font-bold text-slate-800 tracking-tight text-lg">Smart Tutor</span>
          </Link>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`p-2 rounded-full transition-all relative ${isNotificationsOpen ? 'bg-academy-orange-50 text-academy-orange-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               <Bell size={20} />
               {notifications.length > 0 && (
                 <span className="absolute top-2.4 right-2.4 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
               )}
            </button>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-800 hover:bg-slate-50 rounded-full transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        <AnimatePresence>
          {isNotificationsOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsNotificationsOpen(false)}
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40"
              />
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="absolute top-20 right-4 left-4 max-h-[70vh] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden border border-slate-100 flex flex-col"
              >
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                   <h3 className="font-bold text-slate-800 flex items-center gap-2">
                     <Megaphone size={18} className="text-academy-orange-600" />
                     Announcements
                   </h3>
                   <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600">
                     <X size={20} />
                   </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  {notifications.length > 0 ? (
                    <div className="space-y-1">
                      {notifications.map(msg => (
                        <button 
                          key={msg.id}
                          onClick={() => {
                            router.push('/messages');
                            setIsNotificationsOpen(false);
                          }}
                          className="w-full text-left p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest">{msg.type}</span>
                            <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-slate-700 font-medium line-clamp-2 leading-snug">{msg.content}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center opacity-40">
                      <Bell size={40} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-bold uppercase tracking-widest">No new notifications</p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      router.push('/messages');
                      setIsNotificationsOpen(false);
                    }}
                    className="w-full py-3 text-sm font-bold text-academy-orange-600 hover:text-academy-orange-700 transition-colors"
                  >
                    View All Messages
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

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
                  {filteredMenu.map((item) => (
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
                  ))}
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
                    Smart Tutors • AM dev • v2.0
                  </p>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto pb-8 custom-scrollbar">
          <div className="p-4">
            {children}
          </div>
        </main>

        {!isSidebarOpen && (
           <nav className="h-16 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-2 sm:hidden absolute bottom-0 left-0 right-0 z-30">
              {menuItems.filter(i => profile && i.roles.includes(profile.role)).slice(0, 5).map((item) => (
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
      </div>
    </div>
  );
}
