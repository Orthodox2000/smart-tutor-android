'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  Users, BookOpen, Video, ExternalLink, ChevronRight,
  User, Bell as BellIcon, ShieldCheck, Megaphone, Award,
  Coins, Calendar, ClipboardCheck, TrendingUp, BarChart3,
  Zap, Target, MessageSquare, Clock, Percent, AlertTriangle,
  GraduationCap, BookMarked, FileText, DollarSign
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { profile } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good Morning');
    else if (h < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  if (!profile) return null;

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100/40 -mr-8 -mt-8 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-1">{greeting}</p>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {profile.displayName || profile.username}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest capitalize">{profile.role}</span>
              {profile.educationLevel && (
                <>
                  <span className="text-slate-200">|</span>
                  <span className="text-[10px] font-bold text-slate-500">{profile.educationLevel}</span>
                </>
              )}
              {profile.batchNumber && (
                <>
                  <span className="text-slate-200">|</span>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-md">{profile.batchNumber}</span>
                </>
              )}
            </div>
          </div>
          <Link href="/notifications" className="w-11 h-11 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
            <BellIcon className="text-slate-500" size={19} />
          </Link>
        </div>
      </motion.header>

      {profile.role === 'admin' && <AdminDashboard />}
      {profile.role === 'educator' && <EducatorDashboard />}
      {(profile.role === 'student' || profile.role === 'parent') && <StudentParentDashboard />}

      {/* Quick Access */}
      <section className="space-y-3">
        <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] px-1">Quick Access</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: BookOpen, label: 'Courses', path: '/courses', bg: 'bg-blue-50', fg: 'text-blue-600', border: 'border-blue-200' },
            { icon: ClipboardCheck, label: 'Attendance', path: '/attendance', bg: 'bg-emerald-50', fg: 'text-emerald-600', border: 'border-emerald-200' },
            { icon: Award, label: 'Certificates', path: '/certificates', bg: 'bg-amber-50', fg: 'text-amber-600', border: 'border-amber-200' },
            { icon: Coins, label: 'Fees', path: '/fees', bg: 'bg-rose-50', fg: 'text-rose-600', border: 'border-rose-200' },
            { icon: Calendar, label: 'Lectures', path: '/lectures', bg: 'bg-violet-50', fg: 'text-violet-600', border: 'border-violet-200' },
            { icon: BarChart3, label: 'Results', path: '/performance', bg: 'bg-indigo-50', fg: 'text-indigo-600', border: 'border-indigo-200' },
          ].map((item, i) => (
            <Link key={item.path} href={item.path}>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex flex-col items-center gap-2 p-3.5 bg-white border ${item.border} rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95`}
              >
                <div className={`w-9 h-9 ${item.bg} border ${item.border} rounded-xl flex items-center justify-center`}>
                  <item.icon size={17} className={item.fg} />
                </div>
                <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      <ProfileSummary />

      {/* Messages */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Latest Updates</h2>
          <Link href="/messages" className="text-[10px] font-bold text-orange-500 flex items-center gap-0.5">
            View All <ChevronRight size={12} />
          </Link>
        </div>
        <RecentMessages />
      </section>
    </div>
  );
}

/* ═══════════════════════ ADMIN DASHBOARD ═══════════════════════ */
function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ students: 0, courses: 0, faculty: 0, sessions: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', { credentials: 'include' });
        if (res.ok) setStats(await res.json());
      } catch {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [profile]);

  return (
    <div className="space-y-3">
      {/* Primary KPIs */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Students', value: stats.students, icon: Users, bg: 'bg-blue-50', fg: 'text-blue-600', border: 'border-blue-200' },
          { label: 'Courses', value: stats.courses, icon: BookOpen, bg: 'bg-violet-50', fg: 'text-violet-600', border: 'border-violet-200' },
          { label: 'Faculty', value: stats.faculty, icon: ShieldCheck, bg: 'bg-orange-50', fg: 'text-orange-600', border: 'border-orange-200' },
          { label: 'Sessions', value: stats.sessions, icon: Video, bg: 'bg-emerald-50', fg: 'text-emerald-600', border: 'border-emerald-200' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white p-3.5 border ${stat.border} rounded-2xl shadow-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 ${stat.bg} border ${stat.border} rounded-xl flex items-center justify-center`}>
                <stat.icon size={16} className={stat.fg} />
              </div>
              <span className={`text-[9px] font-bold ${stat.fg} uppercase tracking-wider bg-white border ${stat.border} px-1.5 py-0.5`}>
                Live
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.15em]">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Secondary KPIs Row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Revenue', value: '₹0', icon: DollarSign, fg: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Attendance', value: '0%', icon: Percent, fg: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
          { label: 'Tests Done', value: '0', icon: FileText, fg: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
          { label: 'Alerts', value: '0', icon: AlertTriangle, fg: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.04 }}
            className={`bg-white p-3 border ${kpi.border} rounded-2xl shadow-sm text-center`}
          >
            <div className={`w-7 h-7 ${kpi.bg} border ${kpi.border} rounded-xl flex items-center justify-center mx-auto mb-1.5`}>
              <kpi.icon size={13} className={kpi.fg} />
            </div>
            <p className="text-lg font-black text-slate-900 leading-none">{kpi.value}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Admin Actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Students', path: '/students', icon: Users, bg: 'bg-blue-50', fg: 'text-blue-600', border: 'border-blue-200' },
          { label: 'Messages', path: '/messages', icon: MessageSquare, bg: 'bg-amber-50', fg: 'text-amber-600', border: 'border-amber-200' },
          { label: 'Library', path: '/digital-library', icon: BookMarked, bg: 'bg-violet-50', fg: 'text-violet-600', border: 'border-violet-200' },
          { label: 'Placements', path: '/placements', icon: GraduationCap, bg: 'bg-emerald-50', fg: 'text-emerald-600', border: 'border-emerald-200' },
        ].map(item => (
          <Link key={item.path} href={item.path} className={`bg-white p-3 border ${item.border} shadow-sm flex flex-col items-center gap-1.5 hover:shadow-md transition-all active:scale-95`}>
            <div className={`w-8 h-8 ${item.bg} border ${item.border} flex items-center justify-center`}>
              <item.icon size={15} className={item.fg} />
            </div>
            <span className="text-[9px] font-bold text-slate-600 text-center">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════ EDUCATOR DASHBOARD ═══════════════════════ */
function EducatorDashboard() {
  return (
    <div className="space-y-3">
      {/* Educator KPIs */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'My Courses', value: '—', icon: BookOpen, bg: 'bg-blue-50', fg: 'text-blue-600', border: 'border-blue-200' },
          { label: 'Total Students', value: '—', icon: Users, bg: 'bg-emerald-50', fg: 'text-emerald-600', border: 'border-emerald-200' },
          { label: 'Sessions Held', value: '—', icon: Video, bg: 'bg-violet-50', fg: 'text-violet-600', border: 'border-violet-200' },
          { label: 'Feedback Given', value: '—', icon: MessageSquare, bg: 'bg-amber-50', fg: 'text-amber-600', border: 'border-amber-200' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white p-3.5 border ${stat.border} shadow-sm`}
          >
            <div className={`w-8 h-8 ${stat.bg} border ${stat.border} flex items-center justify-center mb-2`}>
              <stat.icon size={16} className={stat.fg} />
            </div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.15em]">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Faculty Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Lectures', path: '/lectures', icon: Calendar, bg: 'bg-violet-50', fg: 'text-violet-600', border: 'border-violet-200' },
          { label: 'Attendance', path: '/attendance', icon: ClipboardCheck, bg: 'bg-emerald-50', fg: 'text-emerald-600', border: 'border-emerald-200' },
          { label: 'Feedback', path: '/feedback', icon: MessageSquare, bg: 'bg-orange-50', fg: 'text-orange-600', border: 'border-orange-200' },
          { label: 'Tests', path: '/mock-test', icon: Target, bg: 'bg-blue-50', fg: 'text-blue-600', border: 'border-blue-200' },
        ].map(item => (
          <Link key={item.path} href={item.path} className={`bg-white p-3 border ${item.border} shadow-sm flex flex-col items-center gap-1.5 hover:shadow-md transition-all active:scale-95`}>
            <div className={`w-8 h-8 ${item.bg} border ${item.border} flex items-center justify-center`}>
              <item.icon size={15} className={item.fg} />
            </div>
            <span className="text-[9px] font-bold text-slate-600 text-center">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════ STUDENT/PARENT DASHBOARD ═══════════════════════ */
function StudentParentDashboard() {
  return (
    <div className="space-y-3">
      {/* Student KPIs */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Attendance', value: '—', icon: ClipboardCheck, bg: 'bg-emerald-50', fg: 'text-emerald-600', border: 'border-emerald-200' },
          { label: 'Avg Score', value: '—', icon: BarChart3, bg: 'bg-blue-50', fg: 'text-blue-600', border: 'border-blue-200' },
          { label: 'Tests Taken', value: '—', icon: FileText, bg: 'bg-violet-50', fg: 'text-violet-600', border: 'border-violet-200' },
          { label: 'Fees Due', value: '—', icon: Coins, bg: 'bg-rose-50', fg: 'text-rose-600', border: 'border-rose-200' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white p-3.5 border ${stat.border} rounded-2xl shadow-sm`}
          >
            <div className={`w-8 h-8 ${stat.bg} border ${stat.border} rounded-xl flex items-center justify-center mb-2`}>
              <stat.icon size={16} className={stat.fg} />
            </div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.15em]">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Certificates', value: '0', icon: Award, fg: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Lectures', value: '0', icon: Clock, fg: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
          { label: 'Rank', value: '—', icon: TrendingUp, fg: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Streak', value: '0d', icon: Zap, fg: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.04 }}
            className={`bg-white p-3 border ${kpi.border} rounded-2xl shadow-sm text-center`}
          >
            <div className={`w-7 h-7 ${kpi.bg} border ${kpi.border} rounded-xl flex items-center justify-center mx-auto mb-1.5`}>
              <kpi.icon size={13} className={kpi.fg} />
            </div>
            <p className="text-lg font-black text-slate-900 leading-none">{kpi.value}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════ SHARED COMPONENTS ═══════════════════════ */
function ActiveSessionsMini() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/sessions', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const active = (Array.isArray(data) ? data : []).filter((s: any) => s.isActive);
          setSessions(active.slice(0, 2));
        }
      } catch { setSessions([]); }
    };
    fetchSessions();
  }, [profile]);

  if (sessions.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <div className="w-2 h-2 bg-red-500 animate-pulse" />
        <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Live Now</h2>
      </div>
      {sessions.map(session => (
        <div key={session._id || session.id} className="relative overflow-hidden p-4 bg-white border border-orange-200 shadow-sm">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100/40 -mr-4 -mt-4 blur-xl" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-800">{session.title}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">By {session.teacherName || 'Academy Faculty'}</p>
              </div>
              <div className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-[8px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
                Live
              </div>
            </div>
            <a 
              href={session.meetLink} 
              target="_blank" 
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              Join Now <ExternalLink size={13} />
            </a>
          </div>
        </div>
      ))}
    </section>
  );
}

function ProfileSummary() {
  const { profile } = useAuth();
  if (!profile) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 border border-slate-200 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center gap-1.5">
          <User size={11} />
          Profile
        </h3>
        <Link href="/profile" className="text-[10px] font-bold text-orange-500 flex items-center gap-0.5">
          View All <ChevronRight size={11} />
        </Link>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID</span>
          <span className="text-xs font-bold text-slate-600 font-mono">{profile.username || profile.id}</span>
        </div>
        {(profile.role === 'student' || profile.role === 'parent') && profile.batchNumber && (
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Batch</span>
            <span className="text-xs font-bold text-slate-800 font-mono uppercase">{profile.batchNumber}</span>
          </div>
        )}
        <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Role</span>
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider bg-orange-50 border border-orange-200 px-2 py-0.5">{profile.role}</span>
        </div>
      </div>
    </motion.div>
  );
}

function RecentMessages() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/messages', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setMessages((data.messages || []).slice(0, 3));
        }
      } catch { setMessages([]); }
    };
    fetchMessages();
  }, [profile]);

  if (messages.length === 0) {
    return (
      <div className="bg-slate-50 p-8 text-center border border-dashed border-slate-200">
        <Megaphone size={24} className="mx-auto text-slate-300 mb-2" />
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.15em]">No new updates</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((msg, i) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <Link href="/messages" className="block bg-white p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[8px] font-bold uppercase tracking-widest py-0.5 px-2 bg-slate-100 text-slate-500 border border-slate-200">
                {msg.channel}
              </span>
              <span className="text-[9px] text-slate-300 font-bold">{msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : ''}</span>
            </div>
            <p className="text-[13px] text-slate-700 font-medium line-clamp-2 leading-relaxed">{msg.title}: {msg.body}</p>
            {msg.author && (
              <p className="text-[10px] text-slate-300 font-bold mt-1.5">— {msg.author}</p>
            )}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
