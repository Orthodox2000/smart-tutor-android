'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import LoadingScreen from './LoadingScreen';
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
  Star,
  ScrollText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import SmartTutorsAIChatbot from './SmartTutorsAIChatbot';
import { apiFetch } from '../lib/api';

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
    { icon: Library, label: 'Library', path: '/digital-library', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: MessageSquare, label: 'Chat', path: '/chat', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: PenTool, label: 'Tests', path: '/mock-test', roles: ['student', 'educator', 'admin', 'parent'] },
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
    { icon: ScrollText, label: 'Audit Logs', path: '/audit-logs', roles: ['admin'] },
    { icon: Star, label: 'Student Feedback', path: '/feedback', roles: ['educator'] },
    { icon: ContactIcon, label: 'Contact Us', path: '/contact', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: BookOpen, label: 'Courses', path: '/courses', roles: ['student', 'educator', 'admin', 'parent'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['student', 'educator', 'admin', 'parent'] },
  ];

  const filteredMenu = menuItems.filter(item => profile && item.roles.includes(profile.role));

  useEffect(() => {
    if (!profile) return;

    const fetchNotifications = async () => {
      try {
        const data = await apiFetch<any>('/notifications');
        setNotifications(data.notifications || data || []);
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
    return <LoadingScreen />;
  }

  if (!profile && pathname !== '/login' && pathname !== '/forgot-password') return null;

  const bottomNavItems = menuItems
    .filter(i => profile && i.roles.includes(profile.role) && !(i as any).isAction)
    .slice(0, 5);

  return (
    <div className="flex justify-center bg-slate-200 h-[100dvh] h-screen">
      <div className="w-full max-w-[430px] bg-slate-50 h-full flex flex-col relative overflow-hidden shadow-2xl" style={{ height: '100%' }}>
        
        <header className="h-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 sticky top-0 z-30 px-0 flex items-center justify-between pt-[env(safe-area-inset-top)]">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity pl-5">
            <img src="/image4.jpeg" alt="Smart Tutors" className="h-9 w-9 rounded-lg object-cover" />
            <span className="text-white font-bold text-xl tracking-tight">Smart Tutors</span>
          </Link>

          <div className="flex items-center gap-2 pr-5">
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2 rounded-full transition-all relative ${pathname === '/notifications' ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10'}`}
              >
                <Bell size={20} />
                {notifications.filter((n: any) => !n.read).length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-slate-900 px-1">
                    {notifications.filter((n: any) => !n.read).length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsNotificationsOpen(false)}
                      className="fixed inset-0 z-40"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-80 max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                        {notifications.filter((n: any) => !n.read).length > 0 && (
                          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                            {notifications.filter((n: any) => !n.read).length} new
                          </span>
                        )}
                      </div>
                      <div className="overflow-y-auto max-h-[55vh]">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center">
                            <Bell size={24} className="mx-auto text-slate-200 mb-2" />
                            <p className="text-xs font-bold text-slate-300">No notifications</p>
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notif: any, i: number) => (
                            <button
                              key={notif.id || i}
                              onClick={() => {
                                setIsNotificationsOpen(false);
                                if (notif.link) {
                                  router.push(notif.link);
                                } else {
                                  router.push('/notifications');
                                }
                              }}
                              className={`w-full text-left p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-indigo-50/40' : ''}`}
                            >
                              <div className="flex items-start gap-2.5">
                                {!notif.read && (
                                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-bold leading-tight ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                    {notif.title}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {notif.type && (
                                      <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                        {notif.type}
                                      </span>
                                    )}
                                    {notif.link && (
                                      <span className="text-[8px] font-bold text-indigo-500">View →</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setIsNotificationsOpen(false);
                              router.push('/notifications');
                            }}
                            className="w-full text-center py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                          >
                            View All Notifications
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
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
                    Smart Tutors &bull; v3.0
                  </p>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto pb-20 custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
            {children}
        </main>

        {!isSidebarOpen && (
           <nav 
             className="h-16 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-0 sm:hidden absolute bottom-0 left-0 right-0 z-30"
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
