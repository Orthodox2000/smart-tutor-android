'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, MessageSquare, Plus, X, ThumbsUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';

export default function FeedbackPage() {
  const { profile } = useAuth();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<'feedback' | 'behaviour'>('feedback');
  const [form, setForm] = useState({
    studentId: '', batchId: '', subject: '', category: 'academics',
    strengths: '', areasToImprove: '', feedback: '', visibleToParent: true,
    rating: 3, note: '', actionTaken: '',
  });

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/student-feedback');
      setFeedback(data.feedback || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = tab === 'feedback'
        ? { type: 'feedback', ...form }
        : { type: 'behaviour', studentId: form.studentId, batchId: form.batchId, rating: form.rating, note: form.note, actionTaken: form.actionTaken, visibleToParent: form.visibleToParent };

      await apiFetch('/student-feedback', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setShowCreate(false);
      fetchFeedback();
    } catch {
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1">Student Insights</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Feedback & Behaviour</h1>
        </div>
        {profile?.role === 'educator' && (
          <button onClick={() => setShowCreate(!showCreate)} className="w-10 h-10 bg-academy-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg">
            {showCreate ? <X size={24} /> : <Plus size={24} />}
          </button>
        )}
      </header>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-academy-orange-100 shadow-sm">
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
            {(['feedback', 'behaviour'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-xl py-3 text-xs font-bold capitalize transition-all ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                {t}
              </button>
            ))}
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <input placeholder="Student ID" required value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            <input placeholder="Batch ID" value={form.batchId} onChange={e => setForm({...form, batchId: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            
            {tab === 'feedback' ? (
              <>
                <input placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
                <textarea placeholder="Feedback" required value={form.feedback} onChange={e => setForm({...form, feedback: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600 min-h-[80px] resize-none" />
                <textarea placeholder="Strengths" value={form.strengths} onChange={e => setForm({...form, strengths: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600 min-h-[60px] resize-none" />
                <textarea placeholder="Areas to Improve" value={form.areasToImprove} onChange={e => setForm({...form, areasToImprove: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600 min-h-[60px] resize-none" />
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(r => (
                      <button key={r} type="button" onClick={() => setForm({...form, rating: r})} className={`p-3 rounded-xl transition-all ${form.rating >= r ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300'}`}>
                        <Star size={20} fill={form.rating >= r ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea placeholder="Behaviour Note" required value={form.note} onChange={e => setForm({...form, note: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600 min-h-[80px] resize-none" />
                <input placeholder="Action Taken (optional)" value={form.actionTaken} onChange={e => setForm({...form, actionTaken: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
              </>
            )}

            <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer">
              <input type="checkbox" checked={form.visibleToParent} onChange={e => setForm({...form, visibleToParent: e.target.checked})} className="w-4 h-4 rounded accent-academy-orange-600" />
              <span className="text-xs font-bold text-slate-600">Visible to Parent</span>
            </label>

            <button type="submit" className="w-full bg-academy-orange-600 text-white py-4 rounded-2xl font-bold text-sm">Submit {tab === 'feedback' ? 'Feedback' : 'Note'}</button>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 opacity-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto"></div>
          </div>
        ) : feedback.length > 0 ? (
          feedback.map((item, i) => (
            <motion.div
              key={item._id || item.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                {item.type === 'behaviour' ? <AlertTriangle size={14} className="text-amber-500" /> : <MessageSquare size={14} className="text-blue-500" />}
                <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">{item.type || 'feedback'}</span>
                {item.category && <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md">{item.category}</span>}
              </div>
              <p className="text-sm text-slate-700 font-medium leading-relaxed">{item.feedback || item.note}</p>
              {item.strengths && <p className="text-xs text-emerald-600 mt-2"><strong>Strengths:</strong> {item.strengths}</p>}
              {item.areasToImprove && <p className="text-xs text-amber-600 mt-1"><strong>Improve:</strong> {item.areasToImprove}</p>}
              {item.rating && (
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4,5].map(r => <Star key={r} size={14} className={r <= item.rating ? 'text-amber-400' : 'text-slate-200'} fill={r <= item.rating ? 'currentColor' : 'none'} />)}
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
            <Star size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No feedback records</p>
          </div>
        )}
      </div>
    </div>
  );
}
