'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Award, Download, Plus, X, Trash2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';
import PageContainer from '../../../components/PageContainer';
import PageHeader from '../../../components/PageHeader';

const TEMPLATES = [
  { id: 'classic-gold', name: 'Classic Gold', color: 'from-amber-100 to-yellow-50', border: 'border-amber-300' },
  { id: 'modern-blue', name: 'Modern Blue', color: 'from-blue-100 to-indigo-50', border: 'border-blue-300' },
  { id: 'professional-dark', name: 'Professional Dark', color: 'from-slate-800 to-slate-900', border: 'border-slate-600', dark: true },
];

export default function CertificatesPage() {
  const { profile } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIssue, setShowIssue] = useState(false);
  const [form, setForm] = useState({
    templateId: 'classic-gold',
    recipientId: '',
    recipientName: '',
    recipientType: 'student',
    title: 'Certificate of Excellence',
    description: '',
    courseName: '',
    issuedDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/certificates');
      setCertificates(data.certificates || data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch<any>('/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          issuedBy: profile?.id,
          issuedByName: profile?.displayName || profile?.username,
        }),
      });
      if (res) {
        setShowIssue(false);
        fetchCertificates();
      }
    } catch (error) {
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this certificate?')) return;
    try {
      await apiFetch(`/certificates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'revoked', revokeReason: 'Revoked by admin' }),
      });
      fetchCertificates();
    } catch (error) {
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Certificates" subtitle="Achievements" gradient="amber" showBack />

      {profile?.role === 'admin' && (
        <button 
          onClick={() => setShowIssue(!showIssue)}
          className="w-10 h-10 bg-academy-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg ml-auto"
        >
          {showIssue ? <X size={24} /> : <Plus size={24} />}
        </button>
      )}

      {showIssue && profile?.role === 'admin' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-academy-orange-100 shadow-sm"
        >
          <h3 className="font-bold text-slate-800 mb-4">Issue New Certificate</h3>
          <form onSubmit={handleIssue} className="space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {TEMPLATES.map(t => (
                <button 
                  key={t.id} type="button"
                  onClick={() => setForm({...form, templateId: t.id})}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border-2 transition-all ${
                    form.templateId === t.id ? `${t.border} bg-slate-50` : 'border-transparent bg-slate-50 text-slate-400'
                  } ${t.dark ? 'text-white' : ''}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <input placeholder="Recipient ID" required value={form.recipientId} onChange={e => setForm({...form, recipientId: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            <input placeholder="Recipient Name" required value={form.recipientName} onChange={e => setForm({...form, recipientName: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            <input placeholder="Certificate Title" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600 min-h-[80px] resize-none" />
            <input placeholder="Course Name (optional)" value={form.courseName} onChange={e => setForm({...form, courseName: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            <input type="date" value={form.issuedDate} onChange={e => setForm({...form, issuedDate: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-academy-orange-600" />
            <button type="submit" className="w-full bg-academy-orange-600 text-white py-4 rounded-2xl font-bold text-sm">Issue Certificate</button>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 opacity-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto"></div>
          </div>
        ) : certificates.length > 0 ? (
          certificates.map((cert, i) => {
            const tmpl = TEMPLATES.find(t => t.id === cert.templateId) || TEMPLATES[0];
            return (
              <motion.div
                key={cert.id || cert._id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-gradient-to-br ${tmpl.color} p-6 rounded-2xl border ${tmpl.border} shadow-sm relative overflow-hidden`}
              >
                {tmpl.dark && <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <Award size={28} className={tmpl.dark ? 'text-amber-400' : 'text-academy-orange-600'} />
                    {cert.status === 'revoked' && (
                      <span className="px-2 py-1 bg-red-500 text-white text-[8px] font-black uppercase rounded-lg">Revoked</span>
                    )}
                  </div>
                  <h3 className={`font-black text-lg mb-1 ${tmpl.dark ? 'text-white' : 'text-slate-900'}`}>{cert.title}</h3>
                  <p className={`text-xs mb-3 ${tmpl.dark ? 'text-slate-300' : 'text-slate-600'}`}>{cert.recipientName}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold ${tmpl.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {cert.certificateNo || 'N/A'} &bull; {cert.issuedDate || ''}
                    </span>
                    <div className="flex gap-2">
                      {cert.status !== 'revoked' && (
                        <button className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
                          <Download size={14} className={tmpl.dark ? 'text-white' : 'text-slate-700'} />
                        </button>
                      )}
                      {profile?.role === 'admin' && cert.status !== 'revoked' && (
                        <button onClick={() => handleRevoke(cert.id)} className="p-2 bg-red-500/20 rounded-xl hover:bg-red-500/30 transition-colors">
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
            <Award size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No certificates issued</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
