'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Send, MessageSquare, Megaphone, Trash2, ShieldAlert, Image, Clock, Users, X } from 'lucide-react';

type TargetAudience = 'all' | 'students' | 'teachers' | 'admins';

export default function MessagesPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [msgType, setMsgType] = useState<'announcement' | 'resource' | 'alert'>('announcement');
  const [target, setTarget] = useState<TargetAudience>('all');
  const [batchTarget, setBatchTarget] = useState('');
  const [expiryHours, setExpiryHours] = useState<string>('24');
  const [photoURL, setPhotoURL] = useState('');
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    fetchMessages();
  }, [profile]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const url = `/api/messages?role=${profile?.role}&batch=${profile?.batchNumber || ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newMessage.trim()) return;

    try {
      const expiresAt = expiryHours === 'never' 
        ? null 
        : new Date(Date.now() + parseInt(expiryHours) * 60 * 60 * 1000).toISOString();

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: profile.id,
          authorName: profile.name || profile.displayName || profile.username,
          authorRole: profile.role,
          content: newMessage,
          type: msgType,
          target: target,
          batchTarget: batchTarget || null,
          photoURL: photoURL || null,
          expiresAt: expiresAt
        })
      });

      if (res.ok) {
        setNewMessage('');
        setPhotoURL('');
        setBatchTarget('');
        setShowPhotoInput(false);
        fetchMessages();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to send message.');
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await fetch(`/api/messages?id=${msgId}`, { method: 'DELETE' });
      fetchMessages();
    } catch (error) {
      console.error(error);
      alert('Failed to delete message.');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Megaphone className="text-blue-500" size={18} />;
      case 'alert': return <ShieldAlert className="text-red-500" size={18} />;
      case 'resource': return <MessageSquare className="text-emerald-500" size={18} />;
      default: return <MessageSquare size={18} />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 pb-20">
      <header>
        <p className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1">Communication Hub</p>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Messages & Notices</h1>
      </header>

      {(profile?.role === 'admin' || profile?.role === 'teacher') && (
        <form onSubmit={handleSendMessage} className="bg-white p-6 rounded-[32px] space-y-6 shadow-sm border border-slate-100">
          <div className="flex flex-wrap items-center gap-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Type</p>
              <div className="flex bg-slate-50 p-1 rounded-2xl">
                {(['announcement', 'resource', 'alert'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMsgType(type)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all ${
                      msgType === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Target</p>
              <div className="flex bg-slate-50 p-1 rounded-2xl">
                {(['all', 'students', 'teachers'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTarget(t as TargetAudience)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all ${
                      target === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <textarea
              placeholder="What's the update today?"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full px-6 py-5 bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-3xl text-sm min-h-[120px] resize-none font-medium placeholder:text-slate-300"
            />
            
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setShowPhotoInput(!showPhotoInput)}
                className={`p-3 rounded-2xl transition-all ${showPhotoInput ? 'bg-academy-orange-100 text-academy-orange-600' : 'bg-white text-slate-400 shadow-sm'}`}
              >
                <Image size={18} />
              </button>
              <button 
                type="submit"
                className="p-4 bg-academy-orange-600 text-white rounded-2xl shadow-xl shadow-academy-orange-100 transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showPhotoInput && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                  <Image size={18} className="text-slate-400" />
                  <input 
                    type="url" 
                    placeholder="Image URL..."
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="flex-1 bg-transparent border-none text-xs font-bold focus:ring-0"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      )}

      <div className="flex-1 space-y-4">
        {loading ? (
          <div className="text-center py-20 opacity-40">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto"></div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                     {getIcon(msg.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-900 text-sm">{msg.authorName}</span>
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-academy-orange-50 text-academy-orange-600 rounded-lg">
                            {msg.authorRole}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </p>
                          {(profile?.role === 'admin' || profile?.id === msg.authorId) && (
                            <button 
                              onClick={() => handleDeleteMessage(msg._id)}
                              className="p-2 text-slate-300 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                     </div>
                     
                     <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                     
                     {msg.photoURL && (
                       <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100">
                          <img src={msg.photoURL} alt="Attachment" className="w-full h-auto" />
                       </div>
                     )}
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
