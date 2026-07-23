'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Video, Plus, X, ExternalLink, Clock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';
import PageContainer from '../../../components/PageContainer';
import PageHeader from '../../../components/PageHeader';

export default function LecturesPage() {
  const { profile } = useAuth();
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', timing: '', meetingLink: '', target: 'all' });

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/lectures');
      setLectures(data.lectures || data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/lectures', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          teacherId: profile?.id,
          teacherName: profile?.displayName || profile?.username,
        }),
      });
      setShowCreate(false);
      setForm({ title: '', subject: '', timing: '', meetingLink: '', target: 'all' });
      fetchLectures();
    } catch {
    }
  };

  const now = new Date();
  const upcoming = lectures.filter(l => l.timing && new Date(l.timing) >= now);
  const past = lectures.filter(l => !l.timing || new Date(l.timing) < now);

  return (
    <PageContainer>
      <PageHeader title="Lectures" subtitle="Class Schedule" gradient="purple" showBack />

      {(profile?.role === 'admin' || profile?.role === 'educator') && (
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="w-10 h-10 bg-academy-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg ml-auto"
        >
          {showCreate ? <X size={24} /> : <Plus size={24} />}
        </button>
      )}

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-academy-orange-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Schedule Lecture</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <input placeholder="Lecture Title" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            <input placeholder="Subject" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            <input type="datetime-local" placeholder="Date & Time" value={form.timing} onChange={e => setForm({...form, timing: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            <input placeholder="Meeting Link (Google Meet)" value={form.meetingLink} onChange={e => setForm({...form, meetingLink: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            <button type="submit" className="w-full bg-academy-orange-600 text-white py-4 rounded-2xl font-bold text-sm">Schedule Lecture</button>
          </form>
        </motion.div>
      )}

      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Upcoming</h2>
          {upcoming.map((lecture, i) => (
            <motion.div key={lecture._id || lecture.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-academy-orange-50 text-academy-orange-600 rounded-2xl flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-sm">{lecture.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                    {lecture.subject} &bull; {lecture.timing ? new Date(lecture.timing).toLocaleString() : 'TBD'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold">By {lecture.teacherName || 'Faculty'}</p>
                </div>
              </div>
              {lecture.meetingLink && (
                <a href={lecture.meetingLink} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold">
                  Join Meeting <ExternalLink size={14} />
                </a>
              )}
            </motion.div>
          ))}
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Past Lectures</h2>
          {past.map((lecture, i) => (
            <motion.div key={lecture._id || lecture.id || i} initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm opacity-60">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-slate-400" />
                <div>
                  <h3 className="font-bold text-slate-700 text-sm">{lecture.title}</h3>
                  <p className="text-[10px] text-slate-400">{lecture.subject}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </section>
      )}

      {!loading && lectures.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
          <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No lectures scheduled</p>
        </div>
      )}
    </PageContainer>
  );
}
