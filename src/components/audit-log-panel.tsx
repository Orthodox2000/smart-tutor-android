'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ScrollText, Search, ChevronDown, Filter, RefreshCw,
  Activity, Users, Globe, TrendingUp, Smartphone, Monitor
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';

type AuditLogEntry = {
  id: string;
  action: string;
  category: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  userRole: string | null;
  details: string;
  metadata: Record<string, unknown> | null;
  ip: string;
  platform: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  referer: string | null;
  path: string;
  method: string;
  statusCode: number | null;
  timestamp: string;
};

const ACTIONS = ['login', 'logout', 'create', 'update', 'delete', 'approve', 'reject', 'restore', 'import', 'bulk_operation'];
const CATEGORIES = ['auth', 'fees', 'payout', 'courses', 'users', 'roles', 'students', 'attendance', 'messages', 'library', 'performance', 'settings', 'exams', 'homework', 'certificates', 'placement', 'crm', 'leave', 'communication', 'complaints', 'feedback', 'enquiries', 'payroll', 'expenses', 'other'];

const ACTION_COLORS: Record<string, string> = {
  login: 'bg-emerald-50 text-emerald-600',
  logout: 'bg-slate-100 text-slate-500',
  create: 'bg-blue-50 text-blue-600',
  update: 'bg-amber-50 text-amber-600',
  delete: 'bg-red-50 text-red-600',
  approve: 'bg-emerald-50 text-emerald-600',
  reject: 'bg-rose-50 text-rose-600',
  restore: 'bg-teal-50 text-teal-600',
  import: 'bg-violet-50 text-violet-600',
  bulk_operation: 'bg-purple-50 text-purple-600',
};

function formatTime(ts: string) {
  try {
    return new Date(ts).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return ts;
  }
}

export default function AuditLogPanel() {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [category, setCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState('');

  const limit = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (search) params.set('search', search);
      if (action) params.set('action', action);
      if (category) params.set('category', category);
      const data = await apiFetch<any>(`/admin/audit-logs?${params.toString()}`);
      setLogs(data.logs || []);
      setTotal(data.pagination?.total || 0);
    } catch (e: any) {
      setError(e.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [page, search, action, category]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiFetch<any>('/admin/audit-logs?stats=true');
      setStats(data);
    } catch {}
  }, []);

  useEffect(() => {
    if (!profile || profile.role !== 'admin') return;
    fetchLogs();
    fetchStats();
  }, [profile, fetchLogs, fetchStats]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchLogs();
    }, 400);
    return () => clearTimeout(delay);
  }, [search, action, category]);

  if (!profile || profile.role !== 'admin') return null;

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      <header className="px-4">
        <p className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1">Admin Console</p>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Logs</h1>
      </header>

      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Logs</span>
              <Activity size={14} className="text-indigo-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-800">{stats.totalLogs}</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-1">{stats.todayLogs} today</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Unique Users</span>
              <Users size={14} className="text-blue-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-800">{stats.uniqueUsers}</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-1">{stats.uniqueIps} unique IPs</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Top Action</span>
              <TrendingUp size={14} className="text-emerald-500" />
            </div>
            <p className="text-lg font-extrabold text-slate-800 capitalize">{stats.topAction || '—'}</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-1">{stats.byAction?.[stats.topAction] || 0} events</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Top Category</span>
              <Globe size={14} className="text-amber-500" />
            </div>
            <p className="text-lg font-extrabold text-slate-800 capitalize">{stats.topCategory || '—'}</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-1">{stats.byCategory?.[stats.topCategory] || 0} events</p>
          </motion.div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, IP, path, details..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-academy-orange-400"
            />
          </div>
          <button
            onClick={() => { setShowFilters(!showFilters); fetchLogs(); }}
            className={`px-3.5 rounded-2xl border flex items-center gap-1.5 text-xs font-bold transition-colors ${showFilters ? 'bg-academy-orange-500 border-academy-orange-500 text-white' : 'bg-white border-slate-200 text-slate-500'}`}
          >
            <Filter size={14} />
            Filter
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-2 gap-2 pt-1">
                <select value={action} onChange={(e) => setAction(e.target.value)} className="px-3 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-academy-orange-400">
                  <option value="">All Actions</option>
                  {ACTIONS.map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
                </select>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-academy-orange-400">
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="text-center py-20 opacity-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <p className="text-xs font-bold text-red-500">{error}</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
          <ScrollText size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No audit logs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const isOpen = expanded === log.id;
            const color = ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-500';
            const platform = log.platform === 'android-app';
            return (
              <motion.div key={log.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : log.id)} className="w-full text-left p-4 flex items-start gap-3">
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full mt-0.5 ${color}`}>
                    {log.action}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-snug">{log.details}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[10px] text-slate-400 font-semibold">
                      <span className="capitalize">{log.category}</span>
                      <span>•</span>
                      <span>{formatTime(log.timestamp)}</span>
                      {log.userName && <><span>•</span><span className="text-slate-500">{log.userName}</span></>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                        {platform ? <Smartphone size={9} className="text-emerald-500" /> : <Monitor size={9} className="text-indigo-500" />}
                        {platform ? 'Android App' : log.os || 'Web'}
                      </span>
                      {log.ip && <span className="text-[9px] font-bold text-slate-300">{log.ip}</span>}
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-slate-300 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-0 border-t border-slate-50">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3 text-[10px]">
                          {[
                            ['User', log.userName || '—'],
                            ['Email', log.userEmail || '—'],
                            ['Role', log.userRole || '—'],
                            ['User ID', log.userId || '—'],
                            ['Method', log.method || '—'],
                            ['Path', log.path || '—'],
                            ['Status', log.statusCode != null ? String(log.statusCode) : '—'],
                            ['Browser', log.browser || '—'],
                            ['Device', log.device || '—'],
                            ['Platform', platform ? 'Android App' : 'Web'],
                            ['Referer', log.referer || '—'],
                            ['IP', log.ip || '—'],
                          ].map(([k, v]) => (
                            <div key={k}>
                              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wide">{k}</p>
                              <p className="text-[10px] font-semibold text-slate-600 break-all">{v}</p>
                            </div>
                          ))}
                        </div>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="mt-3">
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wide mb-1">Metadata</p>
                            <pre className="text-[9px] text-slate-500 bg-slate-50 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-[10px] font-bold text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-xl bg-academy-orange-500 text-white text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}

          <button
            onClick={() => { fetchLogs(); fetchStats(); }}
            className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-colors"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
