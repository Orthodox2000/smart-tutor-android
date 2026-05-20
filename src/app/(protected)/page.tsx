'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  Users, 
  BookOpen, 
  Video, 
  ExternalLink,
  ChevronRight,
  User,
  Bell as BellIcon,
  ShieldCheck,
  Megaphone
} from 'lucide-react';
// import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
// import { db } from '../../lib/firebase';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();

  if (!profile) return null;

  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Academy Overview</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Hello, {profile.displayName.split(' ')[0] || profile.username}
          </h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
           <BellIcon className="text-slate-400" size={20} />
        </div>
      </header>

      {/* Active Sessions Quick Access */}
      <ActiveSessionsMini />

      {/* Profile Summary - Visible to all */}
      <ProfileSummary />

      {profile.role === 'admin' ? <AdminDashboard /> : (profile.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />)}

      {/* Message Board Summary */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Latest Announcements</h2>
          <Link href="/messages" className="text-xs font-bold text-slate-900 flex items-center gap-1">
             View All <ChevronRight size={14} />
          </Link>
        </div>
        <RecentAcademyMessages />
      </section>
    </div>
  );
}

function ActiveSessionsMini() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    
    // Firebase listener removed
    // const baseQuery = collection(db, 'sessions');
    // let q;
    
    // if (profile.role === 'admin') {
    //   q = query(baseQuery, where('isActive', '==', true), limit(3));
    // } else {
    //   q = query(
    //     baseQuery, 
    //     where('isActive', '==', true), 
    //     where('target', 'in', ['all', profile.role === 'teacher' ? 'teachers' : 'students']),
    //     limit(3)
    //   );
    // }

    // return onSnapshot(q, (snapshot) => {
    //   setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    // });
  }, [profile]);

  if (sessions.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
         <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
         Active Sessions
      </h2>
      <div className="space-y-3">
        {sessions.map(session => (
          <div key={session.id} className="p-5 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-200 flex flex-col gap-4">
             <div className="flex justify-between items-start">
                <div>
                   <h3 className="font-bold text-lg">{session.title}</h3>
                   <p className="text-xs text-slate-400 mt-1">By {session.teacherName || 'Academy Faculty'}</p>
                </div>
                <div className="px-2 py-1 bg-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-white/20">
                   Google Meet
                </div>
             </div>
             <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-800 bg-slate-700"></div>
                      ))}
                   </div>
                   <span className="text-[10px] font-bold text-slate-400">Enrolled Students</span>
                </div>
                <a 
                  href={session.meetLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-white text-slate-900 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all"
                >
                  Join Now <ExternalLink size={14} />
                </a>
             </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminDashboard() {
  const { profile } = useAuth();
  const [counts, setCounts] = useState({ students: 0, courses: 0, faculty: 0, sessions: 0 });

  useEffect(() => {
    if (!profile) return;

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setCounts(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [profile]);

  const stats = [
    { label: 'Students', value: counts.students.toString(), icon: Users, color: 'text-slate-900', bg: 'bg-slate-50' },
    { label: 'Courses', value: counts.courses.toString(), icon: BookOpen, color: 'text-slate-900', bg: 'bg-slate-50' },
    { label: 'Faculty', value: counts.faculty.toString(), icon: ShieldCheck, color: 'text-slate-900', bg: 'bg-slate-50' },
    { label: 'Sessions', value: counts.sessions.toString(), icon: Video, color: 'text-slate-900', bg: 'bg-slate-50' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, i) => (
        <motion.div 
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.bg} ${stat.color}`}>
            <stat.icon size={20} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
          <p className="text-xl font-black text-slate-900 leading-tight">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

function TeacherDashboard() {
   return <AdminDashboard />;
}

function ProfileSummary() {
  const { profile } = useAuth();
  if (!profile) return null;

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <User size={16} className="text-slate-400" />
          My Profile Summary
        </h3>
        <div className="grid grid-cols-1 gap-4 relative z-10">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roll No / ID</span>
             <span className="text-xs font-bold text-slate-700 font-mono tracking-wider">{profile.username || profile.id}</span>
          </div>
          {profile.role === 'student' && profile.batchNumber && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Batch</span>
               <span className="text-xs font-bold text-slate-900 font-mono uppercase tracking-widest">{profile.batchNumber}</span>
            </div>
          )}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</span>
             <span className="text-xs font-bold text-slate-700 uppercase">{profile.role}</span>
          </div>
          {profile.educationLevel && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Education</span>
               <span className="text-xs font-bold text-slate-700">{profile.educationLevel}</span>
            </div>
          )}
        </div>
        <Link href="/profile" className="mt-4 w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-slate-900 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
          View Complete Profile <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function StudentDashboard() {
  return null; // Content moved to ProfileSummary
}

function RecentAcademyMessages() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
  }, [profile]);

  return (
    <div className="space-y-3">
      {messages.map(msg => (
        <Link key={msg.id} href="/messages" className="block bg-white p-4 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-slate-900">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold uppercase py-0.5 px-2 bg-slate-50 text-slate-600 rounded-md">
                 {msg.type}
              </span>
              <span className="text-[9px] text-slate-400 font-bold">{new Date(msg.createdAt).toLocaleDateString()}</span>
           </div>
           <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">{msg.content}</p>
        </Link>
      ))}
      {messages.length === 0 && (
        <div className="bg-slate-50 p-8 text-center rounded-3xl border border-slate-100 border-dashed">
           <Megaphone size={32} className="mx-auto text-slate-300 mb-2" />
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No new updates</p>
        </div>
      )}
    </div>
  );
}

