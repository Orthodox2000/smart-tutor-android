'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FileCheck, Calendar, Award, Plus, X } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';

export default function WeeklyTestsPage() {
  const { profile } = useAuth();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', batchId: '', subject: '', testDate: '', totalMarks: '' });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/weekly-tests');
      setTests(data.weeklyTests || data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/weekly-tests', {
        method: 'POST',
        body: JSON.stringify({ ...form, totalMarks: parseInt(form.totalMarks), results: [] }),
      });
      setShowCreate(false);
      setForm({ title: '', batchId: '', subject: '', testDate: '', totalMarks: '' });
      fetchTests();
    } catch {
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1">Weekly Assessments</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Weekly Tests</h1>
        </div>
        {(profile?.role === 'admin' || profile?.role === 'educator') && (
          <button 
            onClick={() => setShowCreate(!showCreate)}
            className="w-10 h-10 bg-academy-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg"
          >
            {showCreate ? <X size={24} /> : <Plus size={24} />}
          </button>
        )}
      </header>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-academy-orange-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Create Weekly Test</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <input placeholder="Test Title" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            <input placeholder="Batch ID" value={form.batchId} onChange={e => setForm({...form, batchId: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            <input placeholder="Subject" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={form.testDate} onChange={e => setForm({...form, testDate: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
              <input type="number" placeholder="Total Marks" value={form.totalMarks} onChange={e => setForm({...form, totalMarks: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            </div>
            <button type="submit" className="w-full bg-academy-orange-600 text-white py-4 rounded-2xl font-bold text-sm">Create Test</button>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 opacity-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto"></div>
          </div>
        ) : tests.length > 0 ? (
          tests.map((test, i) => (
            <motion.div
              key={test._id || test.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                  <FileCheck size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-sm">{test.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">{test.subject}</span>
                    <span className="text-[8px] font-bold uppercase px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md">{test.batchId || 'All'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 p-3 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">{test.testDate ? new Date(test.testDate).toLocaleDateString() : 'TBD'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">{test.totalMarks || 'N/A'} marks</span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
            <FileCheck size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No weekly tests scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
}
