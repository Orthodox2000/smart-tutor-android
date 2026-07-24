'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  ArrowLeft, Search, Send, AlertTriangle,
  MessageCircle, CheckCheck, Check, Users, Phone, Video,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';

type Conversation = {
  userId: string;
  name: string;
  role: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unread: number;
};

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  content: string;
  contentType: 'text' | 'image' | 'file';
  fileUrl?: string;
  read: boolean;
  createdAt: string;
};

const BLOCK_PATTERNS = [
  { regex: /\b\d{10}\b/, label: 'phone number' },
  { regex: /\b[\w.-]+@[\w.-]+\.\w+\b/, label: 'email' },
  { regex: /@\w{3,}/, label: 'social handle' },
  { regex: /\b(instagram|whatsapp|telegram|snapchat|facebook)\b/i, label: 'social media' },
  { regex: /\bhttps?:\/\/\S+/i, label: 'link' },
  { regex: /\b\d{5,}\b/, label: 'number' },
];

function checkBlocked(c: string) {
  for (const p of BLOCK_PATTERNS) if (p.regex.test(c)) return p.label;
  return null;
}

const GRADIENT_MAP: Record<string, string> = {
  admin: 'from-rose-500 to-pink-600',
  educator: 'from-emerald-500 to-teal-600',
  teacher: 'from-emerald-500 to-teal-600',
  student: 'from-blue-500 to-indigo-600',
  parent: 'from-violet-500 to-purple-600',
};

const SOLID_MAP: Record<string, string> = {
  admin: 'bg-rose-500',
  educator: 'bg-emerald-500',
  teacher: 'bg-emerald-500',
  student: 'bg-blue-500',
  parent: 'bg-violet-500',
};

function roleLabel(role: string) {
  if (role === 'admin') return 'Admin';
  if (role === 'educator' || role === 'teacher') return 'Faculty';
  if (role === 'parent') return 'Parent';
  return 'Student';
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function fmtTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function dateSeparator(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

async function filterByRole(
  profile: { id: string; role: string; assignedFacultyIds?: string[]; linkedStudentId?: string },
  all: Conversation[]
): Promise<Conversation[]> {
  if (profile.role === 'admin') return all;

  if (profile.role === 'student') {
    const ids = new Set<string>();
    (profile.assignedFacultyIds || []).forEach(id => ids.add(id));
    return all.filter(c => c.role === 'admin' || c.role === 'parent' || ids.has(c.userId));
  }

  if (profile.role === 'parent') {
    const ids = new Set<string>();
    ids.add('admin');
    if (profile.linkedStudentId) {
      try {
        const users = await apiFetch<any[]>('/users');
        const list = Array.isArray(users) ? users : [];
        const st = list.find((u: any) => u.id === profile.linkedStudentId);
        if (st?.assignedFacultyIds) st.assignedFacultyIds.forEach((id: string) => ids.add(id));
      } catch {}
    }
    return all.filter(c => c.role === 'admin' || (c.role === 'educator' && ids.has(c.userId)));
  }

  if (profile.role === 'educator' || profile.role === 'teacher') {
    const ids = new Set<string>();
    try {
      const users = await apiFetch<any[]>('/users');
      (Array.isArray(users) ? users : [])
        .filter((u: any) => u.role === 'student' && (u.assignedFacultyIds || []).includes(profile.id))
        .forEach((u: any) => ids.add(u.id));
    } catch {}
    return all.filter(c => c.role === 'admin' || (c.role === 'student' && ids.has(c.userId)));
  }

  return [];
}

export default function ChatPage() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [blockedLabel, setBlockedLabel] = useState<string | null>(null);
  const [showTyping, setShowTyping] = useState(false);
  const [view, setView] = useState<'list' | 'chat'>('list');

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const myId = profile?.id || profile?.uid || '';

  const fetchConvos = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await apiFetch<{ conversations: Conversation[] }>('/direct-messages');
      const all = data.conversations || [];
      const filtered = await filterByRole(profile, all);
      filtered.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (b.role === 'admin' && a.role !== 'admin') return 1;
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });
      setConversations(filtered);
    } catch {} finally { setLoadingConvos(false); }
  }, [profile]);

  useEffect(() => { fetchConvos(); }, [fetchConvos]);
  useEffect(() => {
    const iv = setInterval(fetchConvos, 8000);
    return () => clearInterval(iv);
  }, [fetchConvos]);

  const fetchMessages = useCallback(async (uid: string) => {
    setLoadingMsgs(true);
    try {
      const data = await apiFetch<{ messages: Message[] }>(`/direct-messages?userId=${uid}`);
      setMessages(data.messages || []);
    } catch {} finally { setLoadingMsgs(false); }
  }, []);

  useEffect(() => {
    if (selected) {
      fetchMessages(selected.userId);
      const iv = setInterval(() => fetchMessages(selected.userId), 5000);
      return () => clearInterval(iv);
    }
  }, [selected, fetchMessages]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, showTyping]);

  const handleSend = async () => {
    if (!input.trim() || !selected || sending) return;
    const text = input.trim();
    const blocked = checkBlocked(text);
    if (blocked) {
      setBlockedLabel(blocked);
      setTimeout(() => setBlockedLabel(null), 3000);
      return;
    }
    setInput('');
    setSending(true);
    setShowTyping(true);
    try {
      const res = await apiFetch<{ message: Message }>('/direct-messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId: selected.userId, content: text, contentType: 'text' }),
      });
      if (res.message) setMessages(prev => [...prev, res.message]);
      fetchConvos();
    } catch {} finally {
      setSending(false);
      setTimeout(() => setShowTyping(false), 2000);
      inputRef.current?.focus();
    }
  };

  const selectContact = (c: Conversation) => {
    setSelected(c);
    setMessages([]);
    setView('chat');
  };

  const goBack = () => {
    setSelected(null);
    setMessages([]);
    setView('list');
    fetchConvos();
  };

  const filtered = useMemo(() =>
    conversations.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase())
    ), [conversations, search]);

  if (!profile) return null;

  return (
    <div className="h-[calc(100dvh-4.5rem)] flex flex-col bg-gray-50 overflow-hidden">

      {/* ═══ LIST VIEW ═══ */}
      <div className={`${view === 'chat' ? 'hidden' : 'flex'} md:flex flex-col h-full`}>
        {/* Gradient Header */}
        <div className="px-4 pt-4 pb-3 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">Chats</h1>
              <p className="text-[10px] font-semibold text-white/70 mt-0.5">
                {filtered.length} conversation{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-300" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search people..."
              className="w-full bg-white/90 backdrop-blur-sm rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium text-gray-700 placeholder:text-orange-300 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm"
            />
          </div>
        </div>

        {/* Contact Cards */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {loadingConvos ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
                <MessageCircle size={28} className="text-orange-300" />
              </div>
              <p className="text-sm font-bold text-gray-400">{search ? 'No results' : 'No conversations'}</p>
              <p className="text-[10px] text-gray-300 mt-1">Start a conversation to see it here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(c => (
                <button
                  key={c.userId}
                  onClick={() => selectContact(c)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
                >
                  {/* Avatar with gradient */}
                  <div className={`relative w-11 h-11 rounded-2xl bg-gradient-to-br ${GRADIENT_MAP[c.role] || GRADIENT_MAP.student} flex items-center justify-center shrink-0 shadow-md`}>
                    <span className="text-white text-xs font-black">{initials(c.name)}</span>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[13px] text-gray-800 truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md text-white ${SOLID_MAP[c.role] || SOLID_MAP.student}`}>
                        {roleLabel(c.role)}
                      </span>
                      <span className="text-[10px] text-gray-400 truncate flex-1">{c.lastMessage || 'Tap to start chatting'}</span>
                    </div>
                  </div>
                  {/* Right side */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {c.lastMessageAt && <span className="text-[9px] font-semibold text-gray-400">{fmtTime(c.lastMessageAt)}</span>}
                    {c.unread > 0 && (
                      <span className="min-w-[18px] h-[18px] rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white text-[9px] font-black flex items-center justify-center px-1">
                        {c.unread > 99 ? '99+' : c.unread}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ CHAT VIEW ═══ */}
      <div className={`${view === 'chat' ? 'flex' : 'hidden'} md:flex flex-col h-full`}>
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center mb-4 shadow-inner">
              <MessageCircle size={32} className="text-orange-300" />
            </div>
            <p className="text-base font-bold text-gray-400">Pick a conversation</p>
            <p className="text-[11px] text-gray-300 mt-1 max-w-[200px]">Select someone from your contacts to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header - Gradient */}
            <div className="px-3 py-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 flex items-center gap-2.5 shrink-0 shadow-md">
              <button onClick={goBack} className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white active:scale-95 md:hidden">
                <ArrowLeft size={16} />
              </button>
              <div className={`w-9 h-9 rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center shrink-0`}>
                <span className="text-white text-[10px] font-black">{initials(selected.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[13px] text-white truncate">{selected.name}</h3>
                <p className="text-[9px] text-white/70 font-medium">{roleLabel(selected.role)}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Phone size={13} className="text-white" />
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Video size={13} className="text-white" />
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {loadingMsgs ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-2">
                    <Send size={20} className="text-orange-300" />
                  </div>
                  <p className="text-[11px] font-bold text-gray-400">Send a message to get started</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {messages.map((msg, idx) => {
                    const mine = msg.senderId === myId;
                    const showDate = idx === 0 || !isSameDay(messages[idx - 1]?.createdAt, msg.createdAt);
                    const showGap = idx === 0 || messages[idx - 1]?.senderId !== msg.senderId;
                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-3">
                            <span className="px-3 py-1 rounded-full bg-gray-200/80 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                              {dateSeparator(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${mine ? 'justify-end' : 'justify-start'} ${showGap ? 'mt-2.5' : 'mt-0.5'}`}>
                          <div className="max-w-[80%]">
                            <div className={`px-3.5 py-2 text-[12px] leading-relaxed ${
                              mine
                                ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl rounded-br-md shadow-sm'
                                : 'bg-white text-gray-700 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                            }`}>
                              {msg.contentType === 'image' && msg.fileUrl ? (
                                <img src={msg.fileUrl} alt="" className="rounded-xl max-w-full max-h-44 object-cover" />
                              ) : msg.content}
                            </div>
                            <div className={`flex items-center gap-1 mt-0.5 px-1 ${mine ? 'justify-end' : ''}`}>
                              <span className="text-[8px] text-gray-400 font-medium">
                                {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {mine && (
                                msg.read
                                  ? <CheckCheck size={10} className="text-emerald-400" />
                                  : <Check size={10} className="text-gray-300" />
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {/* Typing indicator */}
              {showTyping && selected && (
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${GRADIENT_MAP[selected.role] || GRADIENT_MAP.student} flex items-center justify-center`}>
                    <span className="text-white text-[7px] font-black">{initials(selected.name)}</span>
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2.5 border border-gray-100 shadow-sm">
                    <span className="inline-flex gap-1">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-orange-400"
                          style={{ animation: `typingBounce 1.2s ${i * 0.2}s infinite ease-in-out` }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Blocked warning */}
            {blockedLabel && (
              <div className="mx-3 mb-1 px-3 py-2 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertTriangle size={12} className="text-red-500 shrink-0" />
                <p className="text-[10px] font-bold text-red-600">Cannot share {blockedLabel}</p>
              </div>
            )}

            {/* Input bar */}
            <div className="px-3 py-2.5 bg-white border-t border-gray-100 shrink-0" style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-[12px] font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  disabled={sending}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                    input.trim() && !sending
                      ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md active:scale-90'
                      : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
