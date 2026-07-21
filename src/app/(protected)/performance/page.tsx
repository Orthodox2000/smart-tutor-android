'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, FileText } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';
import PageBackButton from '../../../components/PageBackButton';

export default function PerformancePage() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const endpoint = profile?.role === 'student' || profile?.role === 'parent'
        ? '/student-performance/reports/mine'
        : '/student-performance/reports';
      const data = await apiFetch<any>(endpoint);
      setReports(data.reports || data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center gap-2">
        <PageBackButton />
        <div className="flex-1">
          <p className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1">Academic Analytics</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Performance Reports</h1>
        </div>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 opacity-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto"></div>
          </div>
        ) : reports.length > 0 ? (
          reports.map((report, i) => (
            <motion.div
              key={report.id || report._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-academy-orange-50 text-academy-orange-600 rounded-2xl flex items-center justify-center">
                  <BarChart3 size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-sm">{report.title || report.studentName || 'Performance Report'}</h3>
                  <p className="text-[10px] text-slate-400 font-bold">
                    {report.date ? new Date(report.date).toLocaleDateString() : ''}
                    {report.subject ? ` • ${report.subject}` : ''}
                  </p>
                </div>
                {report.score !== undefined && (
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900">{report.score}%</p>
                    <div className="flex items-center gap-1 justify-end">
                      <TrendingUp size={12} className={report.score >= 70 ? 'text-emerald-500' : 'text-red-500'} />
                    </div>
                  </div>
                )}
              </div>
              {report.feedback && (
                <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl leading-relaxed">{report.feedback}</p>
              )}
              {report.marks !== undefined && (
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-academy-orange-500 rounded-full transition-all" 
                      style={{ width: `${Math.min(report.score || (report.marks / report.totalMarks) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{report.marks}/{report.totalMarks}</span>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
            <FileText size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No performance reports</p>
          </div>
        )}
      </div>
    </div>
  );
}
