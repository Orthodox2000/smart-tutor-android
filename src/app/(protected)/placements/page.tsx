'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, MapPin, IndianRupee, ExternalLink, Plus, X } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';
import PageBackButton from '../../../components/PageBackButton';

export default function PlacementsPage() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', company: '', location: '', salary: '', description: '', requirements: '', applyLink: '' });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/placement-jobs');
      setJobs(data.jobs || data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch<any>('/placement-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res) {
        setShowCreate(false);
        setForm({ title: '', company: '', location: '', salary: '', description: '', requirements: '', applyLink: '' });
        fetchJobs();
      }
    } catch (error) {
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center gap-2">
        <PageBackButton />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1">Career Opportunities</p>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Placements</h1>
            </div>
            {profile?.role === 'admin' && (
              <button 
                onClick={() => setShowCreate(!showCreate)}
                className="w-10 h-10 bg-academy-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg"
              >
                {showCreate ? <X size={24} /> : <Plus size={24} />}
              </button>
            )}
          </div>
        </div>
      </header>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-academy-orange-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Post Job Opening</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <input placeholder="Job Title" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            <input placeholder="Company Name" required value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
              <input placeholder="Salary Range" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            </div>
            <textarea placeholder="Job Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600 min-h-[80px] resize-none" />
            <textarea placeholder="Requirements" value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600 min-h-[60px] resize-none" />
            <input placeholder="Application Link" value={form.applyLink} onChange={e => setForm({...form, applyLink: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            <button type="submit" className="w-full bg-academy-orange-600 text-white py-4 rounded-2xl font-bold text-sm">Post Job</button>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 opacity-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto"></div>
          </div>
        ) : jobs.length > 0 ? (
          jobs.map((job, i) => (
            <motion.div
              key={job._id || job.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                  <Briefcase size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-sm">{job.title}</h3>
                  <p className="text-xs text-slate-500 font-bold">{job.company}</p>
                </div>
                {job.status === 'draft' && (
                  <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[8px] font-black uppercase rounded-lg">Draft</span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                {job.location && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                    <MapPin size={12} /> {job.location}
                  </span>
                )}
                {job.salary && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                    <IndianRupee size={12} /> {job.salary}
                  </span>
                )}
              </div>

              {job.description && (
                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">{job.description}</p>
              )}

              {job.applyLink && (
                <a 
                  href={job.applyLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold"
                >
                  Apply Now <ExternalLink size={14} />
                </a>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
            <Briefcase size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No placement opportunities</p>
          </div>
        )}
      </div>
    </div>
  );
}
