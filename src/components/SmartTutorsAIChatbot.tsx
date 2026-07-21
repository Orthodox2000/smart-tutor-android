'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, X, Send, Bot, Minimize2, Maximize2,
  Sparkles, ArrowLeft, Search, Paperclip,
  FileText, Download, AlertTriangle, Ban, Check, CheckCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';

type ChatMode = 'ai' | 'direct';
type DirectView = 'list' | 'chat';

interface Conversation {
  userId: string;
  name: string;
  role: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unread: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  content: string;
  contentType?: 'text' | 'image' | 'file';
  fileUrl?: string;
  read: boolean;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-500',
  educator: 'bg-blue-500',
  teacher: 'bg-blue-500',
  student: 'bg-emerald-500',
  parent: 'bg-violet-500',
};

const ROLE_BADGE_COLORS: Record<string, string> = {
  admin: 'bg-red-50 text-red-600 border-red-200',
  educator: 'bg-blue-50 text-blue-600 border-blue-200',
  teacher: 'bg-blue-50 text-blue-600 border-blue-200',
  student: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  parent: 'bg-violet-50 text-violet-600 border-violet-200',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  educator: 'Faculty',
  teacher: 'Faculty',
  student: 'Student',
  parent: 'Parent',
};

const CONTACT_MODERATION_PATTERNS = [
  /\b\d{10}\b/,
  /\b[\w.-]+@[\w.-]+\.\w+\b/,
  /@\w{3,}/,
  /\b(instagram|whatsapp|telegram|snapchat|facebook)\b/i,
];

function containsContactInfo(text: string): boolean {
  return CONTACT_MODERATION_PATTERNS.some(p => p.test(text));
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function SmartTutorsAIChatbot({ open, onOpenChange }: { open?: boolean; onOpenChange?: (v: boolean) => void }) {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isControlled = open !== undefined;
  const visible = isControlled ? open : isOpen;
  const setVisible = (v: boolean) => { if (isControlled) onOpenChange?.(v); else setIsOpen(v); };

  const [mode, setMode] = useState<ChatMode>('ai');
  const [isMinimized, setIsMinimized] = useState(false);

  // AI Chat state
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Direct Chat state
  const [directView, setDirectView] = useState<DirectView>('list');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [directLoading, setDirectLoading] = useState(false);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [directInput, setDirectInput] = useState('');
  const [directSending, setDirectSending] = useState(false);
  const [contactSearch, setContactSearch] = useState('');

  // Chat disabled state
  const [chatEnabled, setChatEnabled] = useState(true);
  const [chatDisabledBanner, setChatDisabledBanner] = useState(false);

  // Attachment state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingAttachment, setPendingAttachment] = useState<{ file: File; preview: string; type: 'image' | 'file' } | null>(null);

  // Moderation warning state
  const [showModerationWarning, setShowModerationWarning] = useState(false);
  const [pendingModerationContent, setPendingModerationContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [aiMessages, chatMessages]);

  // Check chat settings
  const checkChatSettings = useCallback(async () => {
    try {
      const data = await apiFetch<{ chatEnabled: boolean }>('/chat-settings');
      setChatEnabled(data.chatEnabled);
      setChatDisabledBanner(!data.chatEnabled);
    } catch {
      setChatEnabled(true);
    }
  }, []);

  useEffect(() => {
    checkChatSettings();
    const interval = setInterval(checkChatSettings, 30000);
    return () => clearInterval(interval);
  }, [checkChatSettings]);

  // Load conversations when switching to direct mode
  const loadConversations = useCallback(async () => {
    if (!profile) return;
    setDirectLoading(true);
    try {
      const data = await apiFetch<any>('/direct-messages');
      setConversations(data.conversations || []);
    } catch {} finally { setDirectLoading(false); }
  }, [profile]);

  useEffect(() => {
    if (mode === 'direct' && directView === 'list') {
      loadConversations();
    }
  }, [mode, directView, loadConversations]);

  // Load chat messages when opening a conversation
  const openChat = async (conv: Conversation) => {
    setActiveChat(conv);
    setDirectView('chat');
    setChatMessages([]);
    try {
      const data = await apiFetch<any>(`/direct-messages?userId=${conv.userId}`);
      setChatMessages(data.messages || []);
    } catch {}
  };

  // Poll for new messages in active chat
  useEffect(() => {
    if (mode !== 'direct' || directView !== 'chat' || !activeChat) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const data = await apiFetch<any>(`/direct-messages?userId=${activeChat.userId}`);
        setChatMessages(data.messages || []);
      } catch {}
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [mode, directView, activeChat]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB');
      return;
    }
    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = () => {
      setPendingAttachment({
        file,
        preview: reader.result as string,
        type: isImage ? 'image' : 'file',
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = () => {
    setPendingAttachment(null);
  };

  // Send direct message
  const handleSendDirect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!directInput.trim() && !pendingAttachment) || !activeChat || directSending) return;

    let content = directInput.trim();
    let contentType: 'text' | 'image' | 'file' = 'text';
    let fileUrl: string | undefined;

    if (pendingAttachment) {
      contentType = pendingAttachment.type === 'image' ? 'image' : 'file';
      fileUrl = pendingAttachment.preview;
      if (!content) {
        content = contentType === 'image' ? '📷 Image' : `📎 ${pendingAttachment.file.name}`;
      }
    }

    // Client-side moderation
    if (contentType === 'text' && containsContactInfo(content)) {
      setPendingModerationContent(content);
      setShowModerationWarning(true);
      return;
    }

    setDirectInput('');
    setPendingAttachment(null);
    setDirectSending(true);

    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: profile?.id || '',
      senderName: profile?.displayName || profile?.username || '',
      senderRole: profile?.role || '',
      receiverId: activeChat.userId,
      receiverName: activeChat.name,
      receiverRole: activeChat.role,
      content,
      contentType,
      fileUrl,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, optimisticMsg]);

    try {
      const data = await apiFetch<any>('/direct-messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId: activeChat.userId, content, contentType, fileUrl }),
      });
      if (data?.message) {
        setChatMessages(prev => prev.map(m => m.id === optimisticMsg.id ? { ...data.message } : m));
      }
    } catch {
      setChatMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    } finally { setDirectSending(false); }
  };

  // Handle moderation warning actions
  const handleModerationCancel = () => {
    setShowModerationWarning(false);
    setPendingModerationContent('');
  };

  const handleModerationSendAnyway = () => {
    setShowModerationWarning(false);
    const content = pendingModerationContent;
    setPendingModerationContent('');
    if (!activeChat || !content) return;

    setDirectSending(true);
    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: profile?.id || '',
      senderName: profile?.displayName || profile?.username || '',
      senderRole: profile?.role || '',
      receiverId: activeChat.userId,
      receiverName: activeChat.name,
      receiverRole: activeChat.role,
      content,
      contentType: 'text',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, optimisticMsg]);

    apiFetch<any>('/direct-messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId: activeChat.userId, content, contentType: 'text' }),
    }).then(data => {
      if (data?.message) {
        setChatMessages(prev => prev.map(m => m.id === optimisticMsg.id ? { ...data.message } : m));
      }
    }).catch(() => {
      setChatMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    }).finally(() => setDirectSending(false));
  };

  // AI Chat send
  const handleSendAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;
    const userMessage = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setAiLoading(true);
    try {
      const data = await apiFetch<{ reply?: string }>('/smarttutors-chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userMessage,
          memory: {
            name: profile?.displayName || profile?.username,
            classGrade: profile?.educationLevel || '',
            targetExam: '',
            weakSubject: '',
            studyGoal: '',
            courseInterest: '',
          },
          history: aiMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
        })
      });
      setAiMessages(prev => [...prev, { role: 'model', text: data?.reply || 'Sorry, I encountered an error. Please try again.' }]);
    } catch {
      setAiMessages(prev => [...prev, { role: 'model', text: 'Connection lost. Please check your internet.' }]);
    } finally { setAiLoading(false); }
  };

  const switchMode = (m: ChatMode) => {
    setMode(m);
    setDirectView('list');
    setActiveChat(null);
    setContactSearch('');
  };

  const goBackToList = () => {
    setDirectView('list');
    setActiveChat(null);
    loadConversations();
  };

  const getAvatarColor = (role: string) => ROLE_COLORS[role] || 'bg-slate-400';
  const getRoleBadgeStyle = (role: string) => ROLE_BADGE_COLORS[role] || 'bg-slate-50 text-slate-600 border-slate-200';
  const getRoleLabel = (role: string) => ROLE_LABELS[role] || role;

  const filteredConversations = conversations.filter(c =>
    !contactSearch || c.name.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const hasMessages = filteredConversations.filter(c => c.lastMessage);
  const noMessages = filteredConversations.filter(c => !c.lastMessage);
  const sortedConversations = [...hasMessages, ...noMessages.sort((a, b) => a.name.localeCompare(b.name))];

  if (!profile) return null;

  return (
    <div className="absolute bottom-20 right-4 z-[100] sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${
              isMinimized ? 'h-16 w-64' : 'h-[550px] w-[360px] sm:w-[400px]'
            }`}
          >
            {/* Header */}
            <header className="p-3 bg-emerald-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                {mode === 'direct' && directView === 'chat' && activeChat ? (
                  <button onClick={goBackToList} className="p-1.5 hover:bg-white/10 rounded-lg -ml-1 mr-0.5 transition-colors">
                    <ArrowLeft size={18} />
                  </button>
                ) : null}
                {mode === 'ai' ? (
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Bot size={18} />
                  </div>
                ) : directView === 'chat' && activeChat ? (
                  <div className={`w-9 h-9 ${getAvatarColor(activeChat.role)} rounded-full flex items-center justify-center text-sm font-bold shadow-sm`}>
                    {activeChat.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <MessageSquare size={18} />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold leading-tight">
                    {mode === 'ai' ? 'SmartTutor AI' : directView === 'chat' && activeChat ? activeChat.name : 'Chats'}
                  </h3>
                  <span className="text-[10px] font-medium text-emerald-100">
                    {mode === 'ai' ? 'Online' : directView === 'chat' && activeChat ? getRoleLabel(activeChat.role) : 'Direct Messages'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
                </button>
                <button onClick={() => setVisible(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={16} />
                </button>
              </div>
            </header>

            {!isMinimized && (
              <>
                {/* Mode Toggle */}
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 shrink-0">
                  <div className="flex bg-white rounded-xl p-0.5 border border-slate-200 shadow-sm">
                    <button onClick={() => switchMode('ai')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'ai' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                      <Sparkles size={12} />
                      AI Chat
                    </button>
                    <button onClick={() => switchMode('direct')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'direct' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                      <MessageSquare size={12} />
                      1-to-1 Chat
                    </button>
                  </div>
                </div>

                {/* AI Mode */}
                {mode === 'ai' && (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#ECE5DD] custom-scrollbar">
                      {aiMessages.length === 0 && (
                        <div className="text-center py-10">
                          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                            <Sparkles className="text-emerald-600" size={32} />
                          </div>
                          <p className="text-sm font-bold text-slate-800">AI Study Assistant</p>
                          <p className="text-xs text-slate-500 mt-1 px-8 leading-relaxed">Ask me about courses, study plans, or any academic topic!</p>
                        </div>
                      )}
                      {aiMessages.map((m, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }} animate={{ opacity: 1, x: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-green-100 text-slate-800 rounded-tr-none shadow-sm border border-green-200/50' : 'bg-white text-slate-700 rounded-tl-none shadow-sm border border-slate-100'}`}>
                            {m.text}
                            <div className={`text-[9px] mt-1 ${m.role === 'user' ? 'text-green-600/60 text-right' : 'text-slate-300'}`}>
                              {formatTime(new Date().toISOString())}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {aiLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-slate-100 px-4 py-3 rounded-xl rounded-tl-none shadow-sm">
                            <div className="flex gap-1.5">
                              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendAI} className="p-2.5 bg-[#F0F0F0] border-t border-slate-200 shrink-0">
                      <div className="flex items-center gap-2">
                        <input value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-white border border-slate-200 focus:ring-0 focus:border-emerald-400 rounded-full text-sm transition-all outline-none" />
                        <button type="submit" disabled={!aiInput.trim() || aiLoading} className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-40 transition-all hover:bg-emerald-700 active:scale-95">
                          <Send size={16} />
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {/* Direct Mode - Contact List */}
                {mode === 'direct' && directView === 'list' && (
                  <>
                    {chatDisabledBanner && (
                      <div className="px-3 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2 shrink-0">
                        <Ban size={14} className="text-amber-600 shrink-0" />
                        <span className="text-[11px] font-medium text-amber-700">Chat has been disabled by administrator</span>
                      </div>
                    )}
                    <div className="px-3 py-2 bg-white border-b border-slate-100 shrink-0">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
                        <input value={contactSearch} onChange={e => setContactSearch(e.target.value)} placeholder="Search or start new chat..." className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 rounded-lg text-xs transition-all outline-none" />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-white">
                      {directLoading && (
                        <div className="text-center py-10">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto" />
                        </div>
                      )}
                      {!directLoading && sortedConversations.length === 0 && (
                        <div className="text-center py-10 px-6">
                          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <MessageSquare className="text-emerald-400" size={24} />
                          </div>
                          <p className="text-sm font-bold text-slate-600">No contacts yet</p>
                          <p className="text-[11px] text-slate-400 mt-1">Start chatting with your contacts</p>
                        </div>
                      )}
                      {sortedConversations.map((conv) => (
                        <button key={conv.userId} onClick={() => openChat(conv)} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-100/80 text-left">
                          <div className={`w-11 h-11 ${getAvatarColor(conv.role)} rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm`}>
                            {conv.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-sm font-semibold text-slate-800 truncate">{conv.name}</span>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${getRoleBadgeStyle(conv.role)}`}>
                                  {getRoleLabel(conv.role)}
                                </span>
                              </div>
                              {conv.lastMessageAt && (
                                <span className={`text-[10px] shrink-0 ml-1 ${conv.unread > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                                  {formatTime(conv.lastMessageAt)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                              <p className="text-xs text-slate-400 truncate pr-2">
                                {conv.lastMessage || (
                                  <span className="italic text-slate-300">No messages yet</span>
                                )}
                              </p>
                              {conv.unread > 0 && (
                                <span className="w-5 h-5 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">
                                  {conv.unread > 99 ? '99+' : conv.unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Direct Mode - Chat Thread */}
                {mode === 'direct' && directView === 'chat' && activeChat && (
                  <>
                    {/* Chat disabled banner */}
                    {!chatEnabled && (
                      <div className="px-3 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2 shrink-0">
                        <Ban size={14} className="text-amber-600 shrink-0" />
                        <span className="text-[11px] font-medium text-amber-700">Chat has been disabled by administrator</span>
                      </div>
                    )}

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 bg-[#ECE5DD] custom-scrollbar" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d1d5db\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
                      {chatMessages.length === 0 && (
                        <div className="text-center py-8">
                          <div className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-200/50">
                            <MessageSquare className="text-emerald-500" size={22} />
                          </div>
                          <p className="text-xs font-bold text-slate-600">Start the conversation</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Send a message to {activeChat.name}</p>
                        </div>
                      )}

                      {chatMessages.map((msg, idx) => {
                        const isMine = msg.senderId === profile.id || msg.senderId === profile.uid;
                        const showDateHeader = idx === 0 || !isSameDay(msg.createdAt, chatMessages[idx - 1].createdAt);

                        return (
                          <React.Fragment key={msg.id}>
                            {showDateHeader && (
                              <div className="flex justify-center my-3">
                                <span className="text-[10px] font-medium text-slate-500 bg-white/80 px-3 py-1 rounded-full shadow-sm">
                                  {formatDateHeader(msg.createdAt)}
                                </span>
                              </div>
                            )}
                            <motion.div
                              initial={msg.id.startsWith('temp-') ? { opacity: 0, scale: 0.95 } : false}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}
                            >
                              <div className={`max-w-[78%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                                <div className={`px-2.5 py-1.5 rounded-xl text-[13px] leading-relaxed relative ${
                                  isMine
                                    ? 'bg-green-100 text-slate-800 rounded-tr-none border border-green-200/40 shadow-sm'
                                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm'
                                }`}>
                                  {/* Image message */}
                                  {msg.contentType === 'image' && msg.fileUrl && (
                                    <div className="-mx-0.5 -mt-0.5 mb-1">
                                      <img
                                        src={msg.fileUrl}
                                        alt="Shared image"
                                        className="rounded-lg max-w-full max-h-48 object-cover cursor-pointer"
                                        onClick={() => window.open(msg.fileUrl, '_blank')}
                                      />
                                    </div>
                                  )}

                                  {/* File message */}
                                  {msg.contentType === 'file' && msg.fileUrl && (
                                    <a
                                      href={msg.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors no-underline"
                                    >
                                      <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                        <FileText size={16} className="text-red-500" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-medium text-slate-700 truncate">
                                          {msg.content.replace(/^📎\s*/, '')}
                                        </p>
                                        <p className="text-[10px] text-slate-400">Tap to open</p>
                                      </div>
                                      <Download size={14} className="text-slate-400 shrink-0" />
                                    </a>
                                  )}

                                  {/* Text content */}
                                  {(!msg.contentType || msg.contentType === 'text') && (
                                    <span>{msg.content}</span>
                                  )}
                                  {/* Image caption (hide generic placeholder) */}
                                  {msg.contentType === 'image' && msg.content && msg.content !== '📷 Image' && (
                                    <span>{msg.content}</span>
                                  )}
                                </div>
                                <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                                  <span className="text-[9px] text-slate-400 font-medium">
                                    {formatTime(msg.createdAt)}
                                  </span>
                                  {isMine && (
                                    <span className="text-slate-400">
                                      {msg.read ? <CheckCheck size={12} className="text-blue-400" /> : <Check size={12} />}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </React.Fragment>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input area */}
                    {chatEnabled && (
                      <div className="bg-[#F0F0F0] border-t border-slate-200 shrink-0">
                        {/* Pending attachment preview */}
                        {pendingAttachment && (
                          <div className="px-3 pt-2 pb-1 flex items-center gap-2 bg-white border-b border-slate-100">
                            {pendingAttachment.type === 'image' ? (
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                                <img src={pendingAttachment.preview} alt="Preview" className="w-full h-full object-cover" />
                                <button onClick={removeAttachment} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm">
                                  <X size={10} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 flex-1 min-w-0">
                                <FileText size={16} className="text-red-500 shrink-0" />
                                <span className="text-xs text-slate-600 truncate">{pendingAttachment.file.name}</span>
                                <button onClick={removeAttachment} className="ml-auto shrink-0">
                                  <X size={14} className="text-slate-400 hover:text-red-500" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <form onSubmit={handleSendDirect} className="p-2.5 flex items-end gap-2">
                          <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.txt" className="hidden" />
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-10 h-10 bg-white border border-slate-200 text-slate-500 rounded-full flex items-center justify-center shrink-0 hover:bg-slate-50 transition-colors">
                            <Paperclip size={18} />
                          </button>
                          <div className="flex-1 relative">
                            <input
                              value={directInput}
                              onChange={e => setDirectInput(e.target.value)}
                              placeholder="Type a message"
                              className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:ring-0 focus:border-emerald-400 rounded-full text-sm transition-all outline-none"
                            />
                          </div>
                          <button type="submit" disabled={(!directInput.trim() && !pendingAttachment) || directSending} className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-40 transition-all hover:bg-emerald-700 active:scale-95 shrink-0">
                            <Send size={16} />
                          </button>
                        </form>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moderation Warning Dialog */}
      <AnimatePresence>
        {showModerationWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
            onClick={handleModerationCancel}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="text-amber-600" size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 text-center mb-2">Content Warning</h3>
              <p className="text-sm text-slate-600 text-center mb-5 leading-relaxed">
                This message may contain personal contact information. Sharing phone numbers, emails, or social media handles is not allowed.
              </p>
              <div className="flex gap-3">
                <button onClick={handleModerationCancel} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleModerationSendAnyway} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">
                  Send Anyway
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <div className={`flex flex-col gap-3 ${visible ? 'hidden' : 'flex'}`}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setVisible(true)}
          className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-700 transition-colors relative"
        >
          <MessageSquare size={24} />
          {!chatEnabled && (
            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
              <Ban size={8} />
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
}
