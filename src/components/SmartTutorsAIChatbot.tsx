'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, X, Send, Bot, Minimize2, Maximize2,
  Sparkles, ArrowLeft, Search, Paperclip,
  FileText, Download, AlertTriangle, Ban, Check, CheckCheck, Flag
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

  // Report state
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

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

  // Load conversations when switching to direct mode — restricted by role
  const loadConversations = useCallback(async () => {
    if (!profile) return;
    setDirectLoading(true);
    try {
      const data = await apiFetch<any>('/direct-messages');
      let allConvs: Conversation[] = data.conversations || [];

      if (profile.role === 'admin') {
        setConversations(allConvs);
      } else if (profile.role === 'student') {
        const allowedIds = new Set<string>();
        allowedIds.add('admin');
        (profile.assignedFacultyIds || []).forEach(id => allowedIds.add(id));
        setConversations(allConvs.filter(c =>
          c.role === 'admin' || c.role === 'parent' || allowedIds.has(c.userId)
        ));
      } else if (profile.role === 'parent') {
        const allowedIds = new Set<string>();
        allowedIds.add('admin');
        if (profile.linkedStudentId) {
          try {
            const users = await apiFetch<any[]>('/users');
            const student = (Array.isArray(users) ? users : []).find((u: any) => u.id === profile.linkedStudentId);
            if (student?.assignedFacultyIds) {
              student.assignedFacultyIds.forEach((id: string) => allowedIds.add(id));
            }
          } catch {}
        }
        setConversations(allConvs.filter(c =>
          c.role === 'admin' || (c.role === 'educator' && allowedIds.has(c.userId))
        ));
      } else if (profile.role === 'educator' || profile.role === 'teacher') {
        const allowedStudentIds = new Set<string>();
        try {
          const users = await apiFetch<any[]>('/users');
          const allUsers = Array.isArray(users) ? users : [];
          allUsers.filter((u: any) =>
            u.role === 'student' && (u.assignedFacultyIds || []).includes(profile.id)
          ).forEach((u: any) => allowedStudentIds.add(u.id));
        } catch {}
        setConversations(allConvs.filter(c =>
          c.role === 'admin' || (c.role === 'student' && allowedStudentIds.has(c.userId))
        ));
      } else {
        setConversations([]);
      }
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

  const handleReport = async () => {
    if (!activeChat || !reportReason || reportDescription.length < 10) return;
    setReportSubmitting(true);
    try {
      await apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify({
          targetType: 'user',
          targetId: activeChat.userId,
          targetName: activeChat.name,
          reason: reportReason,
          description: reportDescription,
        }),
      });
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportDialog(false);
        setReportSuccess(false);
        setReportReason('');
        setReportDescription('');
      }, 2000);
    } catch {
      alert('Failed to submit report. Please try again.');
    } finally {
      setReportSubmitting(false);
    }
  };

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
                {mode === 'direct' && directView === 'chat' && activeChat && (
                  <button onClick={() => setShowReportDialog(true)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Report user">
                    <Flag size={15} />
                  </button>
                )}
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

      {/* Report User Dialog */}
      <AnimatePresence>
        {showReportDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
            onClick={() => { if (!reportSubmitting) { setShowReportDialog(false); setReportReason(''); setReportDescription(''); setReportSuccess(false); } }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl"
            >
              {reportSuccess ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="text-emerald-600" size={28} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">Report Submitted</h3>
                  <p className="text-sm text-slate-500">Thank you. We&apos;ll review this report.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Flag size={18} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Report {activeChat?.name}</h3>
                      <p className="text-[11px] text-slate-400">{activeChat?.role === 'student' ? 'Student' : activeChat?.role === 'educator' || activeChat?.role === 'teacher' ? 'Faculty' : activeChat?.role === 'parent' ? 'Parent' : 'User'}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <p className="text-xs font-bold text-slate-600">Reason for reporting:</p>
                    {[
                      { value: 'harassment', label: 'Harassment or bullying' },
                      { value: 'inappropriate', label: 'Inappropriate content' },
                      { value: 'spam', label: 'Spam or unwanted messages' },
                      { value: 'fake', label: 'Fake profile or impersonation' },
                      { value: 'other', label: 'Other concern' },
                    ].map(opt => (
                      <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${reportReason === opt.value ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input
                          type="radio"
                          name="report-reason"
                          value={opt.value}
                          checked={reportReason === opt.value}
                          onChange={() => setReportReason(opt.value)}
                          className="w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-slate-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-600 mb-1">Describe the issue (min 10 characters):</p>
                    <textarea
                      value={reportDescription}
                      onChange={e => setReportDescription(e.target.value)}
                      placeholder="Please provide details about why you're reporting this user..."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none h-20 focus:ring-1 focus:ring-red-400 focus:border-red-400 outline-none transition-all"
                      maxLength={500}
                    />
                    <p className="text-[10px] text-slate-400 mt-1 text-right">{reportDescription.length}/500</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowReportDialog(false); setReportReason(''); setReportDescription(''); }}
                      disabled={reportSubmitting}
                      className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReport}
                      disabled={!reportReason || reportDescription.length < 10 || reportSubmitting}
                      className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-40"
                    >
                      {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB — Ask Expert */}
      {!visible && (
        <>
          <style>{`
            @keyframes ae-idle-bob {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
            }
            @keyframes ae-fade-particles {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            @keyframes ae-floatUp {
              0% { transform: translateY(0); opacity: 0; }
              10% { opacity: 1; }
              100% { transform: translateY(-40px); opacity: 0; }
            }
            @keyframes ae-bounce-lines {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-3px); }
            }
            @keyframes ae-spark-1 { to { stroke-dashoffset: -1000; } }
            @keyframes ae-spark-2 { to { stroke-dashoffset: -500; } }
            @keyframes ae-fly-up {
              0% { opacity: 0; transform: translateY(0) scale(0.2); }
              5% { opacity: 1; transform: translateY(-12px) scale(0.4); }
              10%, 100% { opacity: 0; transform: translateY(-24px) scale(0.2); }
            }
            @keyframes ae-fly-down {
              0% { opacity: 0; transform: translateY(0) scale(0.2); }
              5% { opacity: 1; transform: translateY(12px) scale(0.4); }
              10%, 100% { opacity: 0; transform: translateY(24px) scale(0.2); }
            }
            .ae-fab-wrap {
              cursor: pointer;
              position: relative;
              z-index: 100;
              animation: ae-idle-bob 3s ease-in-out infinite;
              transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .ae-fab-wrap:hover { animation-play-state: paused; transform: scale(1.06); }
            .ae-fab-wrap:active { transform: scale(0.95); }
            .ae-fab-wrap #ae-svg-global {
              zoom: 0.85;
              overflow: visible;
            }
            .ae-fab-avatar {
              position: absolute;
              top: 24%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 48px;
              height: 48px;
              border-radius: 50%;
              object-fit: cover;
              z-index: 10;
              pointer-events: none;
              border: 2px solid rgba(147, 197, 253, 0.6);
              box-shadow: 0 0 8px 2px rgba(99, 102, 241, 0.5), 0 0 20px 4px rgba(99, 102, 241, 0.25);
              transition: border-color 0.3s, box-shadow 0.3s, top 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .ae-fab-wrap:hover .ae-fab-avatar {
              top: 18%;
              transform: translate(-50%, -50%) scale(1.08);
              border-color: rgba(147, 197, 253, 1);
              box-shadow: 0 0 16px 6px rgba(99, 102, 241, 0.8), 0 0 40px 12px rgba(99, 102, 241, 0.4), 0 0 60px 20px rgba(99, 102, 241, 0.15);
            }
            .ae-fab-wrap #ae-particles {
              animation: ae-fade-particles 5s infinite alternate;
            }
            .ae-fab-wrap .ae-particle {
              animation: ae-floatUp linear infinite;
            }
            .ae-fab-wrap .ae-p1 { animation-duration: 2.2s; animation-delay: 0s; }
            .ae-fab-wrap .ae-p2 { animation-duration: 2.5s; animation-delay: 0.3s; }
            .ae-fab-wrap .ae-p3 { animation-duration: 2s; animation-delay: 0.6s; }
            .ae-fab-wrap .ae-p4 { animation-duration: 2.8s; animation-delay: 0.2s; }
            .ae-fab-wrap .ae-p5 { animation-duration: 2.3s; animation-delay: 0.4s; }
            .ae-fab-wrap .ae-p6 { animation-duration: 3s; animation-delay: 0.1s; }
            .ae-fab-wrap .ae-p7 { animation-duration: 2.1s; animation-delay: 0.5s; }
            .ae-fab-wrap .ae-p8 { animation-duration: 2.6s; animation-delay: 0.2s; }
            .ae-fab-wrap .ae-p9 { animation-duration: 2.4s; animation-delay: 0.3s; }
            .ae-fab-wrap #ae-line-v1,
            .ae-fab-wrap #ae-line-v2,
            .ae-fab-wrap #ae-node-server,
            .ae-fab-wrap #ae-panel-right,
            .ae-fab-wrap #ae-reflectores,
            .ae-fab-wrap #ae-particles {
              animation: ae-bounce-lines 3s ease-in-out infinite alternate;
            }
            .ae-fab-wrap #ae-line-v1 { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
            .ae-fab-wrap #ae-line-v2 { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s; }
            .ae-fab-wrap:hover #ae-line-v1 { transform: translateY(-8px); }
            .ae-fab-wrap:hover #ae-line-v2 { transform: translateY(-4px); }
            .ae-fab-wrap #ae-line-v2 { animation-delay: 0.2s; }
            .ae-fab-wrap #ae-node-server,
            .ae-fab-wrap #ae-panel-right,
            .ae-fab-wrap #ae-reflectores,
            .ae-fab-wrap #ae-particles { animation-delay: 0.4s; }
          `}</style>
          <div className="ae-fab-wrap" onClick={() => setVisible(true)}>
            <img src="/image5.png" alt="AI Assistant" className="ae-fab-avatar" />
            <svg id="ae-svg-global" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 94 136" height={136} width={94}>
              <path stroke="#4B22B5" d="M87.3629 108.433L49.1073 85.3765C47.846 84.6163 45.8009 84.6163 44.5395 85.3765L6.28392 108.433C5.02255 109.194 5.02255 110.426 6.28392 111.187L44.5395 134.243C45.8009 135.004 47.846 135.004 49.1073 134.243L87.3629 111.187C88.6243 110.426 88.6243 109.194 87.3629 108.433Z" id="ae-line-v1" />
              <path stroke="#5728CC" d="M91.0928 95.699L49.2899 70.5042C47.9116 69.6734 45.6769 69.6734 44.2986 70.5042L2.49568 95.699C1.11735 96.5298 1.11735 97.8767 2.49568 98.7074L44.2986 123.902C45.6769 124.733 47.9116 124.733 49.2899 123.902L91.0928 98.7074C92.4712 97.8767 92.4712 96.5298 91.0928 95.699Z" id="ae-line-v2" />
              <g id="ae-node-server">
                <path fill="url(#ae-p0)" d="M2.48637 72.0059L43.8699 96.9428C45.742 98.0709 48.281 97.8084 50.9284 96.2133L91.4607 71.7833C92.1444 71.2621 92.4197 70.9139 92.5421 70.1257V86.1368C92.5421 86.9686 92.0025 87.9681 91.3123 88.3825C84.502 92.4724 51.6503 112.204 50.0363 113.215C48.2352 114.343 45.3534 114.343 43.5523 113.215C41.9261 112.197 8.55699 91.8662 2.08967 87.926C1.39197 87.5011 1.00946 86.5986 1.00946 85.4058V70.1257C1.11219 70.9289 1.49685 71.3298 2.48637 72.0059Z" />
                <path stroke="url(#ae-p2)" fill="url(#ae-p1)" d="M91.0928 68.7324L49.2899 43.5375C47.9116 42.7068 45.6769 42.7068 44.2986 43.5375L2.49568 68.7324C1.11735 69.5631 1.11735 70.91 2.49568 71.7407L44.2986 96.9356C45.6769 97.7663 47.9116 97.7663 49.2899 96.9356L91.0928 71.7407C92.4712 70.91 92.4712 69.5631 91.0928 68.7324Z" />
                <mask id="ae-m0" maskUnits="userSpaceOnUse" style={{maskType:'luminance'}} x={13} y={50} width={67} height={41}>
                  <path fill="white" d="M78.3486 68.7324L49.0242 51.0584C47.6459 50.2276 45.4111 50.2276 44.0328 51.0584L14.7084 68.7324C13.3301 69.5631 13.3301 70.91 14.7084 71.7407L44.0328 89.4148C45.4111 90.2455 47.6459 90.2455 49.0242 89.4148L78.3486 71.7407C79.7269 70.91 79.727 69.5631 78.3486 68.7324Z" />
                </mask>
                <g mask="url(#ae-m0)">
                  <path fill="#332C94" d="M78.3486 68.7324L49.0242 51.0584C47.6459 50.2276 45.4111 50.2276 44.0328 51.0584L14.7084 68.7324C13.3301 69.5631 13.3301 70.91 14.7084 71.7407L44.0328 89.4148C45.4111 90.2455 47.6459 90.2455 49.0242 89.4148L78.3486 71.7407C79.7269 70.91 79.727 69.5631 78.3486 68.7324Z" />
                  <mask id="ae-m1" maskUnits="userSpaceOnUse" style={{maskType:'luminance'}} x={23} y={56} width={48} height={29}>
                    <path fill="white" d="M68.9898 68.7324L49.0242 56.699C47.6459 55.8683 45.4111 55.8683 44.0328 56.699L24.0673 68.7324C22.6889 69.5631 22.6889 70.91 24.0673 71.7407L44.0328 83.7741C45.4111 84.6048 47.6459 84.6048 49.0242 83.7741L68.9898 71.7407C70.3681 70.91 70.3681 69.5631 68.9898 68.7324Z" />
                  </mask>
                  <g mask="url(#ae-m1)">
                    <path fill="#5E5E5E" d="M68.9898 68.7324L49.0242 56.699C47.6459 55.8683 45.4111 55.8683 44.0328 56.699L24.0673 68.7324C22.6889 69.5631 22.6889 70.91 24.0673 71.7407L44.0328 83.7741C45.4111 84.6048 47.6459 84.6048 49.0242 83.7741L68.9898 71.7407C70.3681 70.91 70.3681 69.5631 68.9898 68.7324Z" />
                    <path fill="#71B1C6" d="M70.1311 69.3884L48.42 56.303C47.3863 55.6799 45.7103 55.6799 44.6765 56.303L22.5275 69.6523C21.4938 70.2754 21.4938 71.2855 22.5275 71.9086L44.2386 84.994C45.2723 85.617 46.9484 85.617 47.9821 84.994L70.1311 71.6446C71.1648 71.0216 71.1648 70.0114 70.1311 69.3884Z" />
                    <path fill="#80C0D4" d="M70.131 70.8923L48.4199 57.8069C47.3862 57.1839 45.7101 57.1839 44.6764 57.8069L22.5274 71.1562C21.4937 71.7793 21.4937 72.7894 22.5274 73.4125L44.2385 86.4979C45.2722 87.1209 46.9482 87.1209 47.982 86.4979L70.131 73.1486C71.1647 72.5255 71.1647 71.5153 70.131 70.8923Z" />
                    <path fill="#89D3EB" d="M69.751 72.1675L48.4199 59.3111C47.3862 58.6881 45.7101 58.6881 44.6764 59.3111L23.2004 72.2548C22.1667 72.8779 22.1667 73.888 23.2004 74.5111L44.5315 87.3674C45.5653 87.9905 47.2413 87.9905 48.2751 87.3674L69.751 74.4238C70.7847 73.8007 70.7847 72.7905 69.751 72.1675Z" />
                    <path fill="#97E6FF" d="M68.5091 72.9231L48.4199 60.8153C47.3862 60.1922 45.7101 60.1922 44.6764 60.8153L24.8146 72.7861C23.7808 73.4091 23.7808 74.4193 24.8146 75.0424L44.9038 87.1502C45.9375 87.7733 47.6135 87.7733 48.6473 87.1502L68.5091 75.1794C69.5428 74.5563 69.5428 73.5462 68.5091 72.9231Z" />
                    <path fill="#97E6FF" d="M66.6747 73.3219L48.4199 62.3197C47.3862 61.6966 45.7101 61.6966 44.6764 62.3197L26.4412 73.3101C25.4075 73.9332 25.4075 74.9433 26.4412 75.5664L44.696 86.5686C45.7297 87.1917 47.4058 87.1917 48.4395 86.5686L66.6747 75.5782C67.7084 74.9551 67.7084 73.945 66.6747 73.3219Z" />
                  </g>
                  <path strokeWidth="0.5" stroke="#F4F4F4" d="M68.9898 68.7324L49.0242 56.699C47.6459 55.8683 45.4111 55.8683 44.0328 56.699L24.0673 68.7324C22.6889 69.5631 22.6889 70.91 24.0673 71.7407L44.0328 83.7741C45.4111 84.6048 47.6459 84.6048 49.0242 83.7741L68.9898 71.7407C70.3681 70.91 70.3681 69.5631 68.9898 68.7324Z" />
                </g>
                <path fillOpacity="0.5" fill="#2C2C2C" d="M84.8371 90.7935L49.1073 69.4308C47.846 68.6706 45.8009 68.6706 44.5395 69.4308L8.80975 90.7935C7.54838 91.5537 7.54838 92.7854 8.80975 93.5456L44.5395 114.908C45.8009 115.669 47.846 115.669 49.1073 114.908L84.8371 93.5456C86.0985 92.7854 86.0985 91.5537 84.8371 90.7935Z" />
                <path fillOpacity="0.2" fill="#91DDFB" d="M84.8371 90.7935L49.1073 69.4308C47.846 68.6706 45.8009 68.6706 44.5395 69.4308L8.80975 90.7935C7.54838 91.5537 7.54838 92.7854 8.80975 93.5456L44.5395 114.908C45.8009 115.669 47.846 115.669 49.1073 114.908L84.8371 93.5456C86.0985 92.7854 86.0985 91.5537 84.8371 90.7935Z" />
              </g>
              <g id="ae-particles">
                <circle fill="url(#ae-p3)" cx="43.5482" cy="28.7976" r="2.2804" className="ae-particle ae-p1" />
                <circle fill="url(#ae-p4)" cx="50.0323" cy="44.5915" r="2.1623" className="ae-particle ae-p2" />
                <path fill="url(#ae-p5)" d="M40.3062 62.6416C41.102 62.6416 41.7471 61.9681 41.7471 61.1374C41.7471 60.3067 41.102 59.6332 40.3062 59.6332C39.5104 59.6332 38.8653 60.3067 38.8653 61.1374C38.8653 61.9681 39.5104 62.6416 40.3062 62.6416Z" className="ae-particle ae-p3" />
                <path fill="url(#ae-p6)" d="M50.7527 73.9229C52.1453 73.9229 53.2743 72.7444 53.2743 71.2906C53.2743 69.8368 52.1453 68.6583 50.7527 68.6583C49.3601 68.6583 48.2311 69.8368 48.2311 71.2906C48.2311 72.7444 49.3601 73.9229 50.7527 73.9229Z" className="ae-particle ae-p4" />
                <path fill="url(#ae-p7)" d="M48.5913 76.9312C49.1882 76.9312 49.672 76.4262 49.672 75.8031C49.672 75.1801 49.1882 74.675 48.5913 74.675C47.9945 74.675 47.5107 75.1801 47.5107 75.8031C47.5107 76.4262 47.9945 76.9312 48.5913 76.9312Z" className="ae-particle ae-p5" />
                <path fill="url(#ae-p8)" d="M52.9153 67.1541C53.115 67.1541 53.2768 66.9858 53.2768 66.7781C53.2768 66.5704 53.115 66.402 52.9153 66.402C52.7156 66.402 52.5538 66.5704 52.5538 66.7781C52.5538 66.9858 52.7156 67.1541 52.9153 67.1541Z" className="ae-particle ae-p6" />
                <path fill="url(#ae-p9)" d="M52.1936 43.8394C52.7904 43.8394 53.2743 43.3344 53.2743 42.7113C53.2743 42.0883 52.7904 41.5832 52.1936 41.5832C51.5967 41.5832 51.1129 42.0883 51.1129 42.7113C51.1129 43.3344 51.5967 43.8394 52.1936 43.8394Z" className="ae-particle ae-p7" />
                <path fill="url(#ae-p10)" d="M57.2367 29.5497C57.8335 29.5497 58.3173 29.0446 58.3173 28.4216C58.3173 27.7985 57.8335 27.2935 57.2367 27.2935C56.6398 27.2935 56.156 27.7985 56.156 28.4216C56.156 29.0446 56.6398 29.5497 57.2367 29.5497Z" className="ae-particle ae-p8" />
                <path fill="url(#ae-p11)" d="M43.9084 34.8144C44.3063 34.8144 44.6289 34.4777 44.6289 34.0623C44.6289 33.647 44.3063 33.3102 43.9084 33.3102C43.5105 33.3102 43.188 33.647 43.188 34.0623C43.188 34.4777 43.5105 34.8144 43.9084 34.8144Z" className="ae-particle ae-p9" />
              </g>
              <g id="ae-reflectores">
                <path fillOpacity="0.2" fill="url(#ae-p12)" d="M49.2037 57.0009L68.7638 68.7786C69.6763 69.3089 69.7967 69.9684 69.794 70.1625V13.7383C69.7649 13.5587 69.6807 13.4657 69.4338 13.3096L48.4832 0.601307C46.9202 -0.192595 46.0788 -0.208238 44.6446 0.601307L23.6855 13.2118C23.1956 13.5876 23.1966 13.7637 23.1956 14.4904L23.246 70.1625C23.2948 69.4916 23.7327 69.0697 25.1768 68.2447L43.9084 57.0008C44.8268 56.4344 45.3776 56.2639 46.43 56.2487C47.5299 56.2257 48.1356 56.4222 49.2037 57.0009Z" />
                <path fillOpacity="0.2" fill="url(#ae-p13)" d="M48.8867 27.6696C49.9674 26.9175 68.6774 14.9197 68.6774 14.9197C69.3063 14.5327 69.7089 14.375 69.7796 13.756V70.1979C69.7775 70.8816 69.505 71.208 68.7422 71.7322L48.9299 83.6603C48.2003 84.1258 47.6732 84.2687 46.5103 84.2995C45.3295 84.2679 44.8074 84.1213 44.0907 83.6603L24.4348 71.8149C23.5828 71.3313 23.2369 71.0094 23.2316 70.1979L23.1884 13.9816C23.1798 14.8398 23.4982 15.3037 24.7518 16.0874C24.7518 16.0874 42.7629 26.9175 44.2038 27.6696C45.6447 28.4217 46.0049 28.4217 46.5452 28.4217C47.0856 28.4217 47.806 28.4217 48.8867 27.6696Z" />
              </g>
              <g id="ae-panel-right">
                <mask id="ae-m2" fill="white">
                  <path d="M72 91.8323C72 90.5121 72.9268 88.9068 74.0702 88.2467L87.9298 80.2448C89.0731 79.5847 90 80.1198 90 81.44V81.44C90 82.7602 89.0732 84.3656 87.9298 85.0257L74.0702 93.0275C72.9268 93.6876 72 93.1525 72 91.8323V91.8323Z" />
                </mask>
                <path fill="#91DDFB" d="M72 91.8323C72 90.5121 72.9268 88.9068 74.0702 88.2467L87.9298 80.2448C89.0731 79.5847 90 80.1198 90 81.44V81.44C90 82.7602 89.0732 84.3656 87.9298 85.0257L74.0702 93.0275C72.9268 93.6876 72 93.1525 72 91.8323V91.8323Z" />
                <path mask="url(#ae-m2)" fill="#489CB7" d="M72 89.4419L90 79.0496L72 89.4419ZM90.6928 81.44C90.6928 82.9811 89.6109 84.8551 88.2762 85.6257L74.763 93.4275C73.237 94.3085 72 93.5943 72 91.8323V91.8323C72 92.7107 72.9268 92.8876 74.0702 92.2275L87.9298 84.2257C88.6905 83.7865 89.3072 82.7184 89.3072 81.84L90.6928 81.44ZM72 94.2227V89.4419V94.2227ZM88.2762 80.0448C89.6109 79.2742 90.6928 79.8989 90.6928 81.44V81.44C90.6928 82.9811 89.6109 84.8551 88.2762 85.6257L87.9298 84.2257C88.6905 83.7865 89.3072 82.7184 89.3072 81.84V81.84C89.3072 80.5198 88.6905 79.8056 87.9298 80.2448L88.2762 80.0448Z" />
                <mask id="ae-m3" fill="white">
                  <path d="M67 94.6603C67 93.3848 67.8954 91.8339 69 91.1962V91.1962C70.1046 90.5584 71 91.0754 71 92.3509V92.5129C71 93.7884 70.1046 95.3393 69 95.977V95.977C67.8954 96.6147 67 96.0978 67 94.8223V94.6603Z" />
                </mask>
                <path fill="#91DDFB" d="M67 94.6603C67 93.3848 67.8954 91.8339 69 91.1962V91.1962C70.1046 90.5584 71 91.0754 71 92.3509V92.5129C71 93.7884 70.1046 95.3393 69 95.977V95.977C67.8954 96.6147 67 96.0978 67 94.8223V94.6603Z" />
                <path mask="url(#ae-m3)" fill="#489CB7" d="M67 92.3509L71 90.0415L67 92.3509ZM71.6928 92.5129C71.6928 94.0093 70.6423 95.8288 69.3464 96.577L69.3464 96.577C68.0505 97.3252 67 96.7187 67 95.2223V94.8223C67 95.6559 67.8954 95.8147 69 95.177L69 95.177C69.7219 94.7602 70.3072 93.7465 70.3072 92.9129L71.6928 92.5129ZM67 97.1317V92.3509V97.1317ZM69.2762 91.0367C70.6109 90.2661 71.6928 90.8908 71.6928 92.4319V92.5129C71.6928 94.0093 70.6423 95.8288 69.3464 96.577L69 95.177C69.7219 94.7602 70.3072 93.7465 70.3072 92.9129V92.7509C70.3072 91.4754 69.7219 90.7794 69 91.1962L69.2762 91.0367Z" />
              </g>
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" x1="1.00946" y1="92.0933" x2="92.5421" y2="92.0933" id="ae-p0">
                  <stop stopColor="#5727CC" /><stop stopColor="#4354BF" offset={1} />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" x1="92.5" y1={70} x2="6.72169" y2="91.1638" id="ae-p1">
                  <stop stopColor="#4559C4" /><stop stopColor="#332C94" offset="0.29" /><stop stopColor="#5727CB" offset={1} />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" x1="92.5" y1={70} x2="3.55544" y2="85.0762" id="ae-p2">
                  <stop stopColor="#91DDFB" /><stop stopColor="#8841D5" offset={1} />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" x1="43.5482" y1="28.7976" x2="43.5482" y2="32.558" id="ae-p3">
                  <stop stopColor="#5927CE" /><stop stopColor="#91DDFB" offset={1} />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" x1="50.0323" y1="44.5915" x2="50.0323" y2="48.3519" id="ae-p4">
                  <stop stopColor="#5927CE" /><stop stopColor="#91DDFB" offset={1} />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" x1="40.3062" y1="59.6332" x2="40.3062" y2="62.6416" id="ae-p5">
                  <stop stopColor="#5927CE" /><stop stopColor="#91DDFB" offset={1} />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" x1="50.7527" y1="68.6583" x2="50.7527" y2="73.9229" id="ae-p6">
                  <stop stopColor="#5927CE" /><stop stopColor="#91DDFB" offset={1} />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" x1="48.5913" y1="74.675" x2="48.5913" y2="76.9312" id="ae-p7">
                  <stop stopColor="#5927CE" /><stop stopColor="#91DDFB" offset={1} />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" x1="52.9153" y1="66.402" x2="52.9153" y2="67.1541" id="ae-p8">
                  <stop stopColor="#5927CE" /><stop stopColor="#91DDFB" offset={1} />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" x1="52.1936" y1="41.5832" x2="52.1936" y2="43.8394" id="ae-p9">
                  <stop stopColor="#5927CE" /><stop stopColor="#91DDFB" offset={1} />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" x1="57.2367" y1="27.2935" x2="57.2367" y2="29.5497" id="ae-p10">
                  <stop stopColor="#5927CE" /><stop stopColor="#91DDFB" offset={1} />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" x1="43.9084" y1="33.3102" x2="43.9084" y2="34.8144" id="ae-p11">
                  <stop stopColor="#5927CE" /><stop stopColor="#91DDFB" offset={1} />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" x1="67.8638" y1="16.0743" x2="62.9858" y2="88.5145" id="ae-p12">
                  <stop stopColor="#97E6FF" /><stop stopOpacity={0} stopColor="white" offset={1} />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" x1="36.2597" y1="39.4139" x2="31.4515" y2="88.0938" id="ae-p13">
                  <stop stopColor="#97E6FF" /><stop stopOpacity={0} stopColor="white" offset={1} />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </>
      )}
    </div>
  );
}
