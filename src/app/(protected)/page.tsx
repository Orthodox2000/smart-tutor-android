'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';
import { motion } from 'motion/react';
import {
  Users, BookOpen, Video, ExternalLink, ChevronRight,
  ShieldCheck, Megaphone, Award,
  Coins, Calendar, ClipboardCheck, TrendingUp, BarChart3, BarChart2,
  Zap, Target, MessageSquare, Clock, Percent, AlertTriangle,
  GraduationCap, BookMarked, FileText, DollarSign, Library,
  Book, MessageCircle, FileEdit, Trophy, UserCheck,
  MonitorPlay, Mail, LineChart, Receipt, CreditCard,
  Briefcase, Phone, Layers, Settings, Sparkles, User
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { profile } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [faculty, setFaculty] = useState<string>('To be assigned soon');
  const [linkedStudentName, setLinkedStudentName] = useState<string>('');
  const [lectureCount, setLectureCount] = useState<number | string>('—');
  const [attendancePct, setAttendancePct] = useState<number | string>('—');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good Morning');
    else if (h < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    if (!profile) return;
    const fetchFaculty = async () => {
      try {
        const facultyIds = profile.assignedFacultyIds;
        if (facultyIds && facultyIds.length > 0) {
          const users = await apiFetch<any[]>('/users');
          const userArr = Array.isArray(users) ? users : [];
          const assigned = userArr.filter((u: any) => facultyIds.includes(u.id));
          if (assigned.length > 0) {
            setFaculty(assigned.map((u: any) => u.displayName || u.name || u.username).join(', '));
          }
        } else {
          const users = await apiFetch<any[]>('/users');
          const match = (Array.isArray(users) ? users : []).find(
            (u: any) => (u.role === 'educator' || u.role === 'teacher') && u.batchNumber && u.batchNumber === profile.batchNumber
          );
          if (match) setFaculty(match.displayName || match.name || match.username);
        }
      } catch {}
    };
    fetchFaculty();
  }, [profile]);

  useEffect(() => {
    if (!profile || profile.role !== 'parent' || !profile.linkedStudentId) return;
    const fetchStudent = async () => {
      try {
        const users = await apiFetch<any[]>('/users');
        const userArr = Array.isArray(users) ? users : [];
        const student = userArr.find((u: any) => u.id === profile.linkedStudentId);
        if (student) setLinkedStudentName(student.displayName || student.name || student.username || 'Your Child');
      } catch {}
    };
    fetchStudent();
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    const fetchLectures = async () => {
      try {
        const data = await apiFetch<any>('/lectures');
        const list = Array.isArray(data) ? data : (data.lectures ?? data.sessions ?? []);
        setLectureCount(list.length);
      } catch {}
    };
    fetchLectures();
  }, [profile]);

  if (!profile) return null;

  const displayName = profile.displayName || profile.name || profile.username || 'Student';
  const firstName = displayName.split(' ')[0];
  const enrollmentDisplay = (profile.username || profile.id || '').slice(0, 7).toUpperCase();

  const isStudentOrParent = profile.role === 'student' || profile.role === 'parent';
  const isAdmin = profile.role === 'admin';
  const isEducator = profile.role === 'educator';

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-800 font-sans selection:bg-indigo-100 overflow-x-hidden relative flex justify-center">
      <div className="relative w-full max-w-md bg-[#F4F7FC] min-h-screen flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-28 px-5 pt-2">

          {/* ═══════════ STUDENT / PARENT HERO ═══════════ */}
          {isStudentOrParent && (
            <section className="mb-6 -mx-5 px-0 relative">
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-5 shadow-xl shadow-indigo-200/50 overflow-hidden relative">
                <div className="absolute -top-16 -right-16 w-56 h-56 bg-fuchsia-500 opacity-30 rounded-full blur-3xl mix-blend-screen" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-sky-400 opacity-30 rounded-full blur-2xl mix-blend-screen" />
                <div className="absolute top-1/2 right-10 w-24 h-24 bg-pink-400 opacity-20 rounded-full blur-xl mix-blend-screen" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
                      <Sparkles size={12} className="text-yellow-300" />
                      {profile.role === 'parent' ? 'Parent Portal' : 'Student Portal'}
                    </div>
                    {profile.photoURL && (
                      <img
                        src={profile.photoURL}
                        alt="Profile"
                        className="w-9 h-9 rounded-full border-2 border-white/40 object-cover shadow-md"
                      />
                    )}
                  </div>

                  <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
                    Hi, {firstName}!
                  </h1>
                  <p className="text-indigo-100 text-sm font-medium mb-5 opacity-90">
                    {profile.role === 'parent' ? "Here's your child's dashboard" : 'Ready to conquer your goals today?'}
                  </p>

                  <div className="flex gap-2.5">
                    {profile.role === 'parent' ? (
                      <>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex-1 shadow-inner">
                          <p className="text-indigo-100 text-[10px] uppercase font-bold tracking-wider mb-1">Linked Student</p>
                          <p className="text-white font-semibold text-sm truncate">{linkedStudentName || 'Loading...'}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex-1 shadow-inner">
                          <p className="text-indigo-100 text-[10px] uppercase font-bold tracking-wider mb-1">Student ID</p>
                          <p className="text-white font-semibold text-[11px] font-mono break-all leading-tight">{profile.linkedStudentId || '—'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-xl p-3 flex-[0.8] shadow-lg shadow-black/5">
                          <p className="text-indigo-100 text-[10px] uppercase font-bold tracking-wider mb-1">Enrollment No</p>
                          <p className="text-white font-semibold text-sm font-mono">{enrollmentDisplay}</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-xl p-3 flex-[1.2] shadow-lg shadow-black/5">
                          <p className="text-indigo-100 text-[10px] uppercase font-bold tracking-wider mb-1">Faculty</p>
                          <p className="text-white font-semibold text-sm flex items-center gap-1.5 truncate">
                            <User size={14} className="text-indigo-200 shrink-0" />
                            <span className="truncate">{faculty}</span>
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {profile.batchNumber && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-white/80 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">{profile.batchNumber}</span>
                      {profile.educationLevel && (
                        <span className="text-[10px] font-bold text-white/60 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">{profile.educationLevel}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ═══════════ ADMIN / EDUCATOR HERO ═══════════ */}
          {(isAdmin || isEducator) && (
            <section className="mb-6 -mx-5 px-0 relative">
              <div className={`p-5 shadow-xl overflow-hidden relative ${isAdmin
                ? 'bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 shadow-rose-200/50'
                : 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 shadow-emerald-200/50'
              }`}>
                <div className="absolute -top-16 -right-16 w-56 h-56 bg-fuchsia-500 opacity-20 rounded-full blur-3xl mix-blend-screen" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-sky-400 opacity-20 rounded-full blur-2xl mix-blend-screen" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
                      <Sparkles size={12} className="text-yellow-300" />
                      {isAdmin ? 'Admin Panel' : 'Faculty Desk'}
                    </div>
                    {profile.photoURL && (
                      <img
                        src={profile.photoURL}
                        alt="Profile"
                        className="w-9 h-9 rounded-full border-2 border-white/40 object-cover shadow-md"
                      />
                    )}
                  </div>

                  <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
                    {greeting}, {firstName}!
                  </h1>
                  <p className="text-white/70 text-sm font-medium mb-2 opacity-90">
                    {isAdmin ? 'System overview at a glance' : 'Manage your classes and students'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest capitalize">{profile.role}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ═══════════ PROGRESS STATS ═══════════ */}
          {(isStudentOrParent) && <ProgressWidgets profile={profile} avgScore={'—'} testsTaken={'—'} feesDue={'—'} lectureCount={lectureCount} />}
          {isAdmin && <AdminProgressWidgets />}
          {isEducator && <EducatorProgressWidgets />}

          {/* ═══════════ EXPLORE SERVICES ═══════════ */}
          <section className="mb-6 -mx-5 px-0">
            <h2 className="text-base font-bold text-slate-800 mb-3 px-5">Explore Services</h2>
            <div className="bg-white shadow-sm border-y border-slate-100">
              <div className="grid grid-cols-4 gap-y-5 gap-x-0 px-3 py-4">
                {(isStudentOrParent ? studentFeatures : isAdmin ? adminFeatures : educatorFeatures).map((feature, idx) => (
                  <Link key={idx} href={feature.path} className="flex flex-col items-center justify-start group">
                    <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-2 group-hover:-translate-y-1 transition-transform duration-200 ease-out`}>
                      <feature.icon size={20} className={feature.text} strokeWidth={2} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full px-0.5">
                      {feature.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════ LATEST UPDATES ═══════════ */}
          <section className="mb-6 -mx-5 px-0">
            <div className="flex items-center justify-between mb-3 px-5">
              <h2 className="text-base font-bold text-slate-800">Latest Updates</h2>
              <Link href="/messages" className="text-xs font-bold text-indigo-600 flex items-center gap-0.5">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <RecentMessages />
          </section>

        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════ FEATURE GRID DATA ═══════════════════════ */
const studentFeatures = [
  { name: 'Library', icon: Book, bg: 'bg-blue-50', text: 'text-blue-600', path: '/digital-library' },
  { name: 'Chat', icon: MessageCircle, bg: 'bg-emerald-50', text: 'text-emerald-600', path: '/chat' },
  { name: 'Tests', icon: FileEdit, bg: 'bg-indigo-50', text: 'text-indigo-600', path: '/mock-test' },
  { name: 'Quiz Arena', icon: Trophy, bg: 'bg-orange-50', text: 'text-orange-600', path: '/quiz-arena' },
  { name: 'Lectures', icon: Video, bg: 'bg-rose-50', text: 'text-rose-600', path: '/lectures' },
  { name: 'Attendance', icon: UserCheck, bg: 'bg-teal-50', text: 'text-teal-600', path: '/attendance' },
  { name: 'Weekly Tests', icon: ClipboardCheck, bg: 'bg-purple-50', text: 'text-purple-600', path: '/weekly-tests' },
  { name: 'Sessions', icon: MonitorPlay, bg: 'bg-sky-50', text: 'text-sky-600', path: '/sessions' },
  { name: 'Messages', icon: Mail, bg: 'bg-pink-50', text: 'text-pink-600', path: '/messages' },
  { name: 'Performance', icon: LineChart, bg: 'bg-amber-50', text: 'text-amber-600', path: '/performance' },
  { name: 'Certificates', icon: Award, bg: 'bg-yellow-50', text: 'text-yellow-600', path: '/certificates' },
  { name: 'Invoices', icon: Receipt, bg: 'bg-red-50', text: 'text-red-600', path: '/fees' },
  { name: 'Placements', icon: Briefcase, bg: 'bg-cyan-50', text: 'text-cyan-600', path: '/placements' },
  { name: 'Courses', icon: Layers, bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', path: '/courses' },
  { name: 'Feedback', icon: MessageSquare, bg: 'bg-lime-50', text: 'text-lime-600', path: '/feedback' },
  { name: 'Settings', icon: Settings, bg: 'bg-gray-100', text: 'text-gray-600', path: '/settings' },
];

const adminFeatures = [
  { name: 'Students', icon: Users, bg: 'bg-blue-50', text: 'text-blue-600', path: '/students' },
  { name: 'Courses', icon: BookOpen, bg: 'bg-violet-50', text: 'text-violet-600', path: '/courses' },
  { name: 'Messages', icon: Mail, bg: 'bg-pink-50', text: 'text-pink-600', path: '/messages' },
  { name: 'Library', icon: Book, bg: 'bg-blue-50', text: 'text-blue-600', path: '/digital-library' },
  { name: 'Lectures', icon: Video, bg: 'bg-rose-50', text: 'text-rose-600', path: '/lectures' },
  { name: 'Attendance', icon: ClipboardCheck, bg: 'bg-emerald-50', text: 'text-emerald-600', path: '/attendance' },
  { name: 'Fees', icon: DollarSign, bg: 'bg-amber-50', text: 'text-amber-600', path: '/fees' },
  { name: 'Performance', icon: LineChart, bg: 'bg-indigo-50', text: 'text-indigo-600', path: '/performance' },
  { name: 'Certificates', icon: Award, bg: 'bg-yellow-50', text: 'text-yellow-600', path: '/certificates' },
  { name: 'Placements', icon: Briefcase, bg: 'bg-cyan-50', text: 'text-cyan-600', path: '/placements' },
  { name: 'Feedback', icon: MessageSquare, bg: 'bg-lime-50', text: 'text-lime-600', path: '/feedback' },
  { name: 'Settings', icon: Settings, bg: 'bg-gray-100', text: 'text-gray-600', path: '/settings' },
];

const educatorFeatures = [
  { name: 'Lectures', icon: Video, bg: 'bg-rose-50', text: 'text-rose-600', path: '/lectures' },
  { name: 'Attendance', icon: ClipboardCheck, bg: 'bg-emerald-50', text: 'text-emerald-600', path: '/attendance' },
  { name: 'Feedback', icon: MessageSquare, bg: 'bg-lime-50', text: 'text-lime-600', path: '/feedback' },
  { name: 'Tests', icon: FileEdit, bg: 'bg-indigo-50', text: 'text-indigo-600', path: '/mock-test' },
  { name: 'Messages', icon: Mail, bg: 'bg-pink-50', text: 'text-pink-600', path: '/messages' },
  { name: 'Students', icon: Users, bg: 'bg-blue-50', text: 'text-blue-600', path: '/students' },
  { name: 'Performance', icon: LineChart, bg: 'bg-amber-50', text: 'text-amber-600', path: '/performance' },
  { name: 'Sessions', icon: MonitorPlay, bg: 'bg-sky-50', text: 'text-sky-600', path: '/sessions' },
];

/* ═══════════════════════ PROGRESS WIDGETS ═══════════════════════ */
function ProgressWidgets({ profile, avgScore, testsTaken, feesDue, lectureCount }: {
  profile: any;
  avgScore: number | string;
  testsTaken: number | string;
  feesDue: number | string;
  lectureCount: number | string;
}) {
  const [realAvg, setRealAvg] = useState<number | string>(avgScore);
  const [realTests, setRealTests] = useState<number | string>(testsTaken);
  const [realFees, setRealFees] = useState<number | string>(feesDue);
  const [realAttendance, setRealAttendance] = useState<number | string>('—');

  const isParent = profile?.role === 'parent';
  const childId = isParent ? (profile.linkedStudentId || profile.id) : null;
  const myId = profile?.id || profile?.uid;

  useEffect(() => {
    if (!profile) return;
    const fetchPerformance = async () => {
      try {
        const data = await apiFetch<any>('/student-performance/reports/mine');
        const scores = data?.scores ?? data?.reports ?? data;
        if (Array.isArray(scores) && scores.length > 0) {
          const total = scores.reduce((sum: number, s: any) => sum + (s.score ?? s.marks ?? 0), 0);
          setRealAvg(`${Math.round(total / scores.length)}%`);
          setRealTests(scores.length);
        } else if (data?.averageScore !== undefined) {
          setRealAvg(`${Math.round(data.averageScore)}%`);
          setRealTests(data.totalTests ?? data.testsTaken ?? '—');
        }
      } catch {}
    };
    const fetchFees = async () => {
      try {
        const data = await apiFetch<any>('/invoices');
        const invoices = data?.feeInvoices ?? (Array.isArray(data) ? data : []);
        let totalDue = 0;
        for (const inv of invoices) {
          // For parent, only count fees for linked student
          if (isParent && childId && inv.studentId !== childId && inv.studentId !== myId) continue;
          const due = (inv.amount || 0) - (inv.paidAmount || 0);
          if (due > 0) totalDue += due;
        }
        setRealFees(totalDue > 0 ? `₹${totalDue.toLocaleString('en-IN')}` : 'Clear');
      } catch {}
    };
    const fetchAttendance = async () => {
      try {
        const data = await apiFetch<any>('/attendance');
        const sheets = data?.sheets ?? data?.attendanceSheets ?? data?.records ?? (Array.isArray(data) ? data : []);
        if (!Array.isArray(sheets) || sheets.length === 0) return;
        let present = 0, total = 0;
        // For parent, match against child's ID
        const matchId = isParent ? childId : myId;
        for (const sheet of sheets) {
          const records = Array.isArray(sheet.records) ? sheet.records : [];
          for (const r of records) {
            if (r.studentId === matchId || r.studentUid === matchId || r.userId === matchId) {
              total++;
              if ((r.status || '').toLowerCase() === 'present') present++;
            }
          }
        }
        if (total > 0) setRealAttendance(`${Math.round((present / total) * 100)}%`);
      } catch {}
    };
    fetchPerformance();
    fetchFees();
    fetchAttendance();
  }, [profile]);

  const stats = [
    { title: 'Avg Score', value: realAvg, icon: BarChart2, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Attendance', value: realAttendance, icon: ClipboardCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Fees Due', value: realFees === 'Clear' ? '—' : realFees, icon: CreditCard, color: 'text-rose-500', bg: 'bg-rose-50' },
    { title: 'Lectures', value: lectureCount, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-slate-800">Your Progress</h2>
        <Link href="/performance" className="text-xs font-semibold text-indigo-600 flex items-center gap-0.5 hover:text-indigo-700">
          Details <ChevronRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <stat.icon size={17} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</span>
            </div>
            <div className="pl-0.5">
              <span className="text-[22px] font-extrabold text-slate-800 leading-none block">{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════ ADMIN PROGRESS ═══════════════════════ */
function AdminProgressWidgets() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Record<string, number | string>>({
    students: '—', courses: '—', faculty: '—', sessions: '—'
  });

  useEffect(() => {
    if (!profile) return;
    const fetchStats = async () => {
      try {
        const [usersData, coursesData, sessionsData] = await Promise.all([
          apiFetch<any[]>('/users').catch(() => []),
          apiFetch<any>('/courses').catch(() => []),
          apiFetch<any>('/sessions').catch(() => []),
        ]);
        const users = Array.isArray(usersData) ? usersData : [];
        const courses = Array.isArray(coursesData) ? coursesData : (coursesData.courses ?? []);
        const sessions = Array.isArray(sessionsData) ? sessionsData : [];
        setStats({
          students: users.filter((u: any) => u.role === 'student').length,
          courses: courses.length,
          faculty: users.filter((u: any) => u.role === 'educator' || u.role === 'teacher').length,
          sessions: sessions.length,
        });
      } catch {}
    };
    fetchStats();
  }, [profile]);

  const kpis = [
    { title: 'Students', value: stats.students, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', trend: 'Active' },
    { title: 'Courses', value: stats.courses, icon: BookOpen, color: 'text-violet-500', bg: 'bg-purple-50', trend: 'Live' },
    { title: 'Faculty', value: stats.faculty, icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-50', trend: 'Active' },
    { title: 'Sessions', value: stats.sessions, icon: Video, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: 'Running' },
  ];

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-slate-800">Overview</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <stat.icon size={17} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</span>
            </div>
            <div className="pl-0.5">
              <span className="text-[22px] font-extrabold text-slate-800 leading-none block">{stat.value}</span>
              <span className={`text-[10px] font-semibold mt-1.5 inline-block px-2 py-0.5 rounded-md ${stat.bg} ${stat.color}`}>
                {stat.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════ EDUCATOR PROGRESS ═══════════════════════ */
function EducatorProgressWidgets() {
  const { profile } = useAuth();
  const [myCourses, setMyCourses] = useState<number | string>('—');
  const [myStudents, setMyStudents] = useState<number | string>('—');
  const [sessionsHeld, setSessionsHeld] = useState<number | string>('—');
  const [feedbackGiven, setFeedbackGiven] = useState<number | string>('—');

  useEffect(() => {
    if (!profile) return;
    const myBatch = profile.batchNumber;
    const myId = profile.id || profile.uid;

    const fetchCourses = async () => {
      try {
        const data = await apiFetch<any>('/courses');
        const list = Array.isArray(data) ? data : (data.courses ?? []);
        // Filter to courses matching educator's batch
        const filtered = myBatch
          ? list.filter((c: any) => c.batchNumber === myBatch || !c.batchNumber)
          : list;
        setMyCourses(filtered.length);
      } catch { setMyCourses('—'); }
    };
    const fetchStudents = async () => {
      try {
        const data = await apiFetch<any[]>('/users');
        const users = Array.isArray(data) ? data : [];
        // Only students assigned to this educator via assignedFacultyIds
        const assigned = users.filter((u: any) =>
          u.role === 'student' &&
          Array.isArray(u.assignedFacultyIds) &&
          (u.assignedFacultyIds.includes(myId) || u.assignedFacultyIds.includes(profile.uid))
        );
        // Fallback: if no assignedFacultyIds set, show batch-mates
        if (assigned.length === 0 && myBatch) {
          const batchStudents = users.filter((u: any) => u.role === 'student' && u.batchNumber === myBatch);
          setMyStudents(batchStudents.length);
        } else {
          setMyStudents(assigned.length);
        }
      } catch { setMyStudents('—'); }
    };
    const fetchSessions = async () => {
      try {
        const data = await apiFetch<any>('/lectures');
        const list = Array.isArray(data) ? data : (data.lectures ?? data.sessions ?? []);
        const filtered = myBatch
          ? list.filter((s: any) => s.batchNumber === myBatch || !s.batchNumber)
          : list;
        setSessionsHeld(filtered.length);
      } catch { setSessionsHeld('—'); }
    };
    const fetchFeedback = async () => {
      try {
        const data = await apiFetch<any>('/feedback');
        const list = Array.isArray(data) ? data : (data.feedback ?? []);
        setFeedbackGiven(list.length);
      } catch { setFeedbackGiven('—'); }
    };
    fetchCourses();
    fetchStudents();
    fetchSessions();
    fetchFeedback();
  }, [profile]);

  const kpis = [
    { title: 'My Courses', value: myCourses, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50', trend: 'Active' },
    { title: 'My Students', value: myStudents, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: 'Assigned' },
    { title: 'Sessions Held', value: sessionsHeld, icon: Video, color: 'text-violet-500', bg: 'bg-purple-50', trend: 'Completed' },
    { title: 'Feedback Given', value: feedbackGiven, icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-50', trend: 'Total' },
  ];

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-slate-800">Your Stats</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <stat.icon size={17} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</span>
            </div>
            <div className="pl-0.5">
              <span className="text-[22px] font-extrabold text-slate-800 leading-none block">{stat.value}</span>
              <span className={`text-[10px] font-semibold mt-1.5 inline-block px-2 py-0.5 rounded-md ${stat.bg} ${stat.color}`}>
                {stat.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════ SHARED COMPONENTS ═══════════════════════ */
function RecentMessages() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    const fetchMessages = async () => {
      try {
        const data = await apiFetch<any>('/messages');
        setMessages((data.messages || []).slice(0, 3));
      } catch { setMessages([]); }
    };
    fetchMessages();
  }, [profile]);

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
        <Megaphone size={28} className="mx-auto text-slate-200 mb-2" />
        <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">No new updates</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {messages.map((msg, i) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <Link href="/messages" className="block bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 bg-indigo-50 text-indigo-500 rounded-md">
                {msg.channel}
              </span>
              <span className="text-[10px] text-slate-300 font-bold">{msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : ''}</span>
            </div>
            <p className="text-[13px] text-slate-700 font-medium line-clamp-2 leading-relaxed">{msg.title}: {msg.body}</p>
            {msg.author && (
              <p className="text-[10px] text-slate-300 font-bold mt-1.5">— {msg.author.split(' ')[0] || msg.author}</p>
            )}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
