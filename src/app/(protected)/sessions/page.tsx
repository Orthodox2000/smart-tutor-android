'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Video, 
  Plus, 
  ExternalLink, 
  Link as LinkIcon
} from 'lucide-react';
import { apiFetch } from '../../../lib/api';
import PageBackButton from '../../../components/PageBackButton';
import { motion, AnimatePresence } from 'motion/react';

export default function SessionsPage() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newSession, setNewSession] = useState({ title: '', meetLink: '', target: 'all' as 'all' | 'students' | 'teachers', batchTarget: '' });

  useEffect(() => {
    if (!profile) return;
    fetchSessions();
  }, [profile]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>(`/sessions?role=${profile?.role}&batch=${profile?.batchNumber || ''}`);
      setSessions(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const res = await apiFetch<any>('/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSession,
          teacherId: profile.uid,
          teacherName: profile.displayName || profile.username,
          isActive: true
        })
      });
      if (res) {
        setShowCreate(false);
        setNewSession({ title: '', meetLink: '', target: 'all', batchTarget: '' });
        fetchSessions();
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
               <p className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1">Live Learning</p>
               <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Active Sessions</h1>
            </div>
            {(profile?.role === 'admin' || profile?.role === 'educator') && (
               <button 
                 onClick={() => setShowCreate(true)}
                 className="w-10 h-10 bg-academy-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-academy-orange-100"
               >
                  <Plus size={24} />
               </button>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showCreate && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-6 rounded-2xl border border-academy-orange-100 shadow-sm mb-6"
          >
             <h3 className="font-bold text-slate-800 mb-4">Start New Session</h3>
             <form onSubmit={handleCreateSession} className="space-y-4">
                <input 
                  placeholder="Session Topic" 
                  value={newSession.title}
                  onChange={e => setNewSession({...newSession, title: e.target.value})}
                  className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"
                />
                <input 
                  placeholder="Google Meet Link" 
                  value={newSession.meetLink}
                  onChange={e => setNewSession({...newSession, meetLink: e.target.value})}
                  className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"
                />
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Target Audience</p>
                  <div className="flex bg-slate-50 p-1 rounded-2xl w-fit">
                    {(['all', 'students', 'teachers'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewSession({...newSession, target: t})}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                          newSession.target === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                {newSession.target === 'students' && (
                  <input 
                    placeholder="Specific Batch Number (Optional)" 
                    value={newSession.batchTarget}
                    onChange={e => setNewSession({...newSession, batchTarget: e.target.value})}
                    className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"
                  />
                )}
                <div className="flex gap-2 pt-2">
                   <button type="submit" className="flex-1 bg-academy-orange-600 text-white py-4 rounded-2xl font-bold text-sm">Create Session</button>
                   <button type="button" onClick={() => setShowCreate(false)} className="px-6 bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm">Cancel</button>
                </div>
             </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 opacity-40">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto"></div>
          </div>
        ) : (
          sessions.map((session) => (
            <motion.div 
              key={session._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-academy-orange-50 text-academy-orange-600 rounded-2xl flex items-center justify-center">
                    <Video size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-tight">{session.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className={`w-1.5 h-1.5 rounded-full ${session.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {session.isActive ? 'Live Now' : 'Completed'}
                          {session.batchTarget ? ` • Batch ${session.batchTarget}` : ''}
                       </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Instructor</p>
                  <p className="text-[11px] font-bold text-slate-700">{session.teacherName}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100">
                       <LinkIcon size={14} className="text-slate-400" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 truncate max-w-[120px]">
                      {session.meetLink.replace('https://', '')}
                    </span>
                 </div>
                 <a 
                   href={session.meetLink} 
                   target="_blank" 
                   rel="noreferrer"
                   className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-200 hover:bg-academy-orange-600 transition-all"
                 >
                   Join Session <ExternalLink size={14} />
                 </a>
              </div>
            </motion.div>
          )
        ))}

        {!loading && sessions.length === 0 && (
           <div className="py-20 text-center opacity-30">
              <Video className="mx-auto mb-2" size={48} />
              <p className="font-bold uppercase tracking-widest text-[10px]">No active sessions</p>
           </div>
        )}
      </div>
    </div>
  );
}
