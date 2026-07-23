'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Search, Send, ShieldAlert, AlertTriangle,
  MessageCircle, User, X, CheckCheck, Check, Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';

/* ── types ─────────────────────────────────────────────── */
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

/* ── content moderation ────────────────────────────────── */
const BLOCK_PATTERNS = [
  { regex: /\b\d{10}\b/, label: 'phone number' },
  { regex: /\b[\w.-]+@[\w.-]+\.\w+\b/, label: 'email address' },
  { regex: /@\w{3,}/, label: 'social handle' },
  { regex: /\b(instagram|whatsapp|telegram|snapchat|facebook)\b/i, label: 'social media' },
  { regex: /\bhttps?:\/\/\S+/i, label: 'link' },
  { regex: /\b\d{5,}\b/, label: 'phone number' },
];

function checkBlocked(content: string): string | null {
  for (const p of BLOCK_PATTERNS) {
    if (p.regex.test(content)) return p.label;
  }
  return null;
}

function formatTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function roleBadge(role: string) {
  if (role === 'admin') return { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Admin' };
  if (role === 'educator' || role === 'teacher') return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Faculty' };
  if (role === 'parent') return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Parent' };
  return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Student' };
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

/* ── typing dots ───────────────────────────────────────── */
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-[3px] px-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-[5px] h-[5px] rounded-full bg-slate-400"
          style={{
            animation: `typingBounce 1.2s ${i * 0.2}s infinite ease-in-out`,
          }}
        />
      ))}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </span>
  );
}

/* ── main page ─────────────────────────────────────────── */
export default function ChatPage() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [blockedLabel, setBlockedLabel] = useState<string | null>(null);
  const [showPolicy, setShowPolicy] = useState(true);
  const [showTyping, setShowTyping] = useState(false);
  const [isMobileThread, setIsMobileThread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const myId = profile?.id || profile?.uid || '';

  /* ── fetch contacts ────────────────────────────────── */
  const fetchConversations = useCallback(async () => {
    try {
      const data = await apiFetch<{ conversations: Conversation[] }>('/direct-messages');
      const list = data.conversations || [];
      // Sort: admin first, then by lastMessageAt
      list.sort((a: Conversation, b: Conversation) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (b.role === 'admin' && a.role !== 'admin') return 1;
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });
      setConversations(list);
    } catch {} finally {
      setLoadingConvos(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  /* ── poll conversations for unread ─────────────────── */
  useEffect(() => {
    pollRef.current = setInterval(fetchConversations, 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchConversations]);

  /* ── fetch messages for selected user ──────────────── */
  const fetchMessages = useCallback(async (userId: string) => {
    setLoadingMessages(true);
    try {
      const data = await apiFetch<{ messages: Message[] }>(`/direct-messages?userId=${userId}`);
      setMessages(data.messages || []);
    } catch {} finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selected) {
      fetchMessages(selected.userId);
      // Poll messages every 5s
      const iv = setInterval(() => fetchMessages(selected.userId), 5000);
      return () => clearInterval(iv);
    }
  }, [selected, fetchMessages]);

  /* ── auto scroll ───────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTyping]);

  /* ── send message ──────────────────────────────────── */
  const handleSend = async () => {
    if (!input.trim() || !selected || sending) return;
    const text = input.trim();
    const blocked = checkBlocked(text);
    if (blocked) {
      setBlockedLabel(blocked);
      setTimeout(() => setBlockedLabel(null), 4000);
      return;
    }
    setInput('');
    setSending(true);
    setShowTyping(true);

    try {
      const res = await apiFetch<{ message: Message }>('/direct-messages', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: selected.userId,
          content: text,
          contentType: 'text',
        }),
      });
      if (res.message) {
        setMessages(prev => [...prev, res.message]);
      }
      fetchConversations();
    } catch {} finally {
      setSending(false);
      setTimeout(() => setShowTyping(false), 2000);
      inputRef.current?.focus();
    }
  };

  /* ── filtered contacts ─────────────────────────────── */
  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

  if (!profile) return null;

  return (
    <div className="flex h-[calc(100dvh-8rem)] -mx-5 -mt-2 bg-[#F4F7FC] overflow-hidden relative">
      {/* ── CONTACT LIST ──────────────────────────────── */}
      <div
        className={`w-full md:w-80 lg:w-[340px] border-r border-slate-200 bg-white flex flex-col shrink-0 transition-all duration-300 ${
          isMobileThread ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-extrabold text-slate-800">Messages</h1>
            <div className="w-8 h-8 rounded-full bg-academy-orange-50 flex items-center justify-center">
              <MessageCircle size={16} className="text-academy-orange-600" />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-academy-orange-200 border border-slate-100"
            />
          </div>
        </div>

        {/* Policy Banner */}
        <AnimatePresence>
          {showPolicy && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mx-3 mt-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <ShieldAlert size={15} className="text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-amber-800 leading-tight">
                    Do not share personal contacts, phone numbers, emails or social media handles. All messages are monitored.
                  </p>
                </div>
                <button onClick={() => setShowPolicy(false)} className="text-amber-400 hover:text-amber-600 shrink-0">
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loadingConvos ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-academy-orange-500 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {search ? 'No users found' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            filtered.map(c => {
              const badge = roleBadge(c.role);
              const isActive = selected?.userId === c.userId;
              return (
                <button
                  key={c.userId}
                  onClick={() => {
                    setSelected(c);
                    setIsMobileThread(true);
                    setMessages([]);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left border-b border-slate-50 ${
                    isActive
                      ? 'bg-academy-orange-50 border-l-2 border-l-academy-orange-500'
                      : 'hover:bg-slate-50 border-l-2 border-l-transparent'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                    c.role === 'admin'
                      ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white'
                      : c.role === 'educator' || c.role === 'teacher'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                  }`}>
                    {initials(c.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-800 truncate">{c.name}</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                      {c.lastMessage || 'Start a conversation'}
                    </p>
                  </div>

                  {/* Right side */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {c.lastMessageAt && (
                      <span className="text-[9px] font-bold text-slate-300">{formatTime(c.lastMessageAt)}</span>
                    )}
                    {c.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-academy-orange-500 text-white text-[9px] font-black flex items-center justify-center">
                        {c.unread > 9 ? '9+' : c.unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── MESSAGE THREAD ────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-[#F4F7FC] transition-all duration-300 ${
          isMobileThread ? 'flex' : 'hidden md:flex'
        }`}
      >
        {!selected ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <MessageCircle size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-400 mb-1">Select a conversation</h3>
            <p className="text-xs text-slate-300 font-medium">
              Choose someone from the list to start chatting
            </p>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center gap-3 shrink-0">
              <button
                onClick={() => { setSelected(null); setIsMobileThread(false); }}
                className="md:hidden w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <ArrowLeft size={16} />
              </button>

              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm text-white ${
                selected.role === 'admin'
                  ? 'bg-gradient-to-br from-rose-500 to-pink-600'
                  : selected.role === 'educator' || selected.role === 'teacher'
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600'
              }`}>
                {initials(selected.name)}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-slate-800 truncate">{selected.name}</h3>
                <p className="text-[10px] text-slate-400 font-semibold">{roleBadge(selected.role).label}</p>
              </div>

              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-300 uppercase">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-3">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-academy-orange-500 rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-300 font-bold">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.senderId === myId;
                  const showAvatar = idx === 0 || messages[idx - 1]?.senderId !== msg.senderId;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-3' : 'mt-0.5'}`}
                    >
                      {!isMine && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shrink-0 mr-2 mt-1">
                          <span className="text-[8px] font-bold text-white">{initials(msg.senderName)}</span>
                        </div>
                      )}

                      <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-2.5 text-sm leading-relaxed ${
                            isMine
                              ? 'bg-academy-orange-500 text-white rounded-2xl rounded-br-md shadow-sm shadow-academy-orange-200/50'
                              : 'bg-white text-slate-700 rounded-2xl rounded-bl-md shadow-sm border border-slate-100'
                          }`}
                        >
                          {msg.contentType === 'image' && msg.fileUrl ? (
                            <img src={msg.fileUrl} alt="shared" className="rounded-lg max-w-full max-h-48 object-cover" />
                          ) : (
                            msg.content
                          )}
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[8px] font-bold text-slate-300">{formatTime(msg.createdAt)}</span>
                          {isMine && (
                            msg.read
                              ? <CheckCheck size={10} className="text-academy-orange-400" />
                              : <Check size={10} className="text-slate-300" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}

              {/* Typing indicator */}
              {showTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shrink-0">
                    <span className="text-[8px] font-bold text-white">{initials(selected.name)}</span>
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-slate-100">
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Blocked warning */}
            <AnimatePresence>
              {blockedLabel && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mx-4 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
                >
                  <AlertTriangle size={14} className="text-red-500 shrink-0" />
                  <p className="text-[11px] font-bold text-red-700">
                    Cannot share {blockedLabel} in chat. Message blocked.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Bar */}
            <div className="px-4 py-3 bg-white border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Type a message..."
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-academy-orange-200 border border-slate-100"
                    disabled={sending}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    input.trim() && !sending
                      ? 'bg-academy-orange-500 text-white shadow-lg shadow-academy-orange-200/50 active:scale-95'
                      : 'bg-slate-100 text-slate-300'
                  }`}
                >
                  <Send size={18} className={input.trim() && !sending ? '' : ''} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
