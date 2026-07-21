'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import PageBackButton from '../../../components/PageBackButton';
import { apiFetch } from '../../../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { Send, MessageSquare, Megaphone, Trash2, ShieldAlert, Clock, X } from 'lucide-react';

type TargetAudience = 'all' | 'students' | 'educators' | 'admins';

export default function MessagesPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [channel, setChannel] = useState('general');
  const [target, setTarget] = useState<TargetAudience>('all');
  const [expiryHours, setExpiryHours] = useState<string>('24');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    fetchMessages();
  }, [profile]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/messages');
      setMessages(data.messages || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newTitle.trim() || !newBody.trim()) return;

    try {
      const expiresAt = expiryHours === 'never'
        ? null
        : new Date(Date.now() + parseInt(expiryHours) * 60 * 60 * 1000).toISOString();

      const res = await apiFetch<any>('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          body: newBody,
          channel,
          audience: [target === 'all' ? profile.role : target.replace(/s$/, '')],
          authorName: profile.name || profile.displayName || profile.username,
          expiresAt
        })
      });

      if (res) {
        setNewTitle('');
        setNewBody('');
        fetchMessages();
      }
    } catch (error) {
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await apiFetch(`/messages?id=${msgId}`, { method: 'DELETE' });
      fetchMessages();
    } catch (error) {
    }
  };

  const getIcon = (channel: string) => {
    const ch = (channel || '').toLowerCase();
    if (ch.includes('alert') || ch.includes('urgent')) return <ShieldAlert className="text-red-500" size={18} />;
    if (ch.includes('resource') || ch.includes('study')) return <MessageSquare className="text-emerald-500" size={18} />;
    return <Megaphone className="text-blue-500" size={18} />;
  };

  return (
    <div className="flex flex-col h-full space-y-6 pb-20">
      <header className="flex items-center gap-2">
        <PageBackButton />
        <div className="flex-1">
          <p className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1">Communication Hub</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Messages & Notices</h1>
        </div>
      </header>

      {(profile?.role === 'admin' || profile?.role === 'educator') && (
        <form onSubmit={handleSendMessage} className="bg-white p-6 rounded-2xl space-y-4 shadow-sm border border-slate-100">
          <input
            type="text"
            placeholder="Message title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-academy-orange-600 placeholder:text-slate-300"
          />

          <div className="flex flex-wrap gap-3">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Channel</p>
              <div className="flex bg-slate-50 p-0.5 rounded-lg">
                {(['general', 'academic', 'events', 'urgent'] as const).map(ch => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                      channel === ch ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Target</p>
              <div className="flex bg-slate-50 p-0.5 rounded-lg">
                {(['all', 'students', 'educators'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTarget(t as TargetAudience)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                      target === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Expires</p>
              <div className="flex bg-slate-50 p-0.5 rounded-lg">
                {(['24', '72', 'never'] as const).map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setExpiryHours(h)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                      expiryHours === h ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    {h === 'never' ? 'Never' : `${h}h`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <textarea
            placeholder="What's the update today?"
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm min-h-[100px] resize-none font-medium placeholder:text-slate-300 focus:ring-2 focus:ring-academy-orange-600"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newTitle.trim() || !newBody.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-academy-orange-600 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-40 transition-all"
            >
              <Send size={14} /> Post Message
            </button>
          </div>
        </form>
      )}

      <div className="flex-1 space-y-3">
        {loading ? (
          <div className="text-center py-20 opacity-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto"></div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                    {getIcon(msg.channel)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{msg.title}</span>
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                          {msg.channel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(profile?.role === 'admin') && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{msg.body}</p>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[9px] font-bold text-slate-400">{msg.author}</span>
                      <span className="text-[9px] text-slate-300">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : ''}
                      </span>
                      {msg.expiresAt && (
                        <span className="text-[9px] text-orange-400 flex items-center gap-1">
                          <Clock size={10} /> expires {new Date(msg.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-20 opacity-30">
            <MessageSquare className="mx-auto mb-2" size={48} />
            <p className="font-bold uppercase tracking-widest text-[10px]">No active communications</p>
          </div>
        )}
      </div>
    </div>
  );
}
