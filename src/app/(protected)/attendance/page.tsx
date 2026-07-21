'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardCheck, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';
import PageBackButton from '../../../components/PageBackButton';

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
    <div className="space-y-6 pb-20">
      <header className="flex items-center gap-2">
        <PageBackButton />
        <div className="flex-1">
          <p className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1">Track Progress</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance</h1>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Present', value: stats.present, color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle },
          { label: 'Absent', value: stats.absent, color: 'bg-red-50 text-red-600', icon: XCircle },
          { label: 'Late', value: stats.late, color: 'bg-amber-50 text-amber-600', icon: Clock },
          { label: 'Rate', value: `${percentage}%`, color: 'bg-orange-50 text-orange-600', icon: ClipboardCheck },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-4 rounded-2xl text-center ${stat.color}`}
          >
            <stat.icon size={20} className="mx-auto mb-1" />
            <p className="text-lg font-black">{stat.value}</p>
            <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-xs font-bold text-red-600">{error}</p>
          <button onClick={fetchAttendance} className="mt-2 text-[10px] font-bold text-red-500 underline">Retry</button>
        </div>
      )}

      {/* Attendance Sheets */}
      <div className="space-y-4">
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{sheet.title || sheet.name || 'Attendance'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={12} className="text-slate-400" />
                      <span className="text-[10px] text-slate-400 font-bold">
                        {sheet.date ? new Date(sheet.date).toLocaleDateString() : 'No date'}
                      </span>
                      {(sheet.subject || sheet.class) && (
                        <span className="text-[8px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
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
                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">{record.remarks || record.teacherNote}</p>
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
    </div>
  );
}
