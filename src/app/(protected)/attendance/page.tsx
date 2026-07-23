'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardCheck, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';
import PageContainer from '../../../components/PageContainer';
import PageHeader from '../../../components/PageHeader';
import StatCard from '../../../components/StatCard';

export default function AttendancePage() {
  const { profile } = useAuth();
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<any>('/attendance');
      const raw = data.sheets || data.attendanceSheets || data.records || data;
      setSheets(Array.isArray(raw) ? raw : []);
    } catch (err: any) {
      console.error('Failed to fetch attendance:', err);
      setError(err?.message || 'Failed to load attendance');
      setSheets([]);
    } finally {
      setLoading(false);
    }
  };

  const getMyRecord = (sheet: any) => {
    if (!profile) return null;
    const records = Array.isArray(sheet.records) ? sheet.records : [];
    return records.find((r: any) =>
      r.studentId === profile.id || r.studentUid === profile.uid || r.userId === profile.id
    );
  };

  const getStats = () => {
    if (!Array.isArray(sheets)) return { present: 0, absent: 0, late: 0, total: 0 };
    let present = 0, absent = 0, late = 0;
    sheets.forEach(sheet => {
      const record = getMyRecord(sheet);
      if (record) {
        const s = (record.status || '').toLowerCase();
        if (s === 'present') present++;
        else if (s === 'absent') absent++;
        else if (s === 'late') late++;
      }
    });
    return { present, absent, late, total: present + absent + late };
  };

  const stats = getStats();
  const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  return (
    <PageContainer>
      <PageHeader title="Attendance" subtitle="Track Progress" gradient="green" showBack />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3.5 mb-6">
        <StatCard title="Present" value={stats.present} icon={CheckCircle} color="text-emerald-500" bg="bg-emerald-50" delay={0} />
        <StatCard title="Absent" value={stats.absent} icon={XCircle} color="text-red-500" bg="bg-red-50" delay={0.05} />
        <StatCard title="Late" value={stats.late} icon={Clock} color="text-amber-500" bg="bg-amber-50" delay={0.1} />
        <StatCard title="Attendance Rate" value={`${percentage}%`} icon={ClipboardCheck} color="text-blue-500" bg="bg-blue-50" delay={0.15} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center mb-6">
          <p className="text-xs font-bold text-red-600">{error}</p>
          <button onClick={fetchAttendance} className="mt-2 text-[10px] font-bold text-red-500 underline">Retry</button>
        </div>
      )}

      {/* Attendance Sheets */}
      <div className="space-y-3">
        <h2 className="text-[15px] font-bold text-slate-800">Records</h2>
        {loading ? (
          <div className="text-center py-20 opacity-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto" />
          </div>
        ) : sheets.length > 0 ? (
          sheets.map((sheet, i) => {
            const record = getMyRecord(sheet);
            const status = (record?.status || '').toLowerCase();
            return (
              <motion.div
                key={sheet.id || sheet._id || i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{sheet.title || sheet.name || 'Attendance'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={12} className="text-slate-400" />
                      <span className="text-[10px] text-slate-400 font-bold">
                        {sheet.date ? new Date(sheet.date).toLocaleDateString() : 'No date'}
                      </span>
                      {(sheet.subject || sheet.class) && (
                        <span className="text-[8px] font-bold uppercase px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded-md">
                          {sheet.subject || sheet.class}
                        </span>
                      )}
                    </div>
                  </div>
                  {record && (
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                      status === 'present' ? 'bg-emerald-50 text-emerald-600' :
                      status === 'absent' ? 'bg-red-50 text-red-600' :
                      status === 'late' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {record.status || 'N/A'}
                    </span>
                  )}
                </div>
                {(record?.remarks || record?.teacherNote) && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl mt-2">{record.remarks || record.teacherNote}</p>
                )}
              </motion.div>
            );
          })
        ) : !error ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
            <ClipboardCheck size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No attendance records</p>
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}
