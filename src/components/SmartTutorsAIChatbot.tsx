'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2, Sparkles, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SmartTutorsAIChatbot({ open, onOpenChange }: { open?: boolean; onOpenChange?: (v: boolean) => void }) {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isControlled = open !== undefined;
  const visible = isControlled ? open : isOpen;
  const setVisible = (v: boolean) => { if (isControlled) onOpenChange?.(v); else setIsOpen(v); };
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/smarttutors-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          history: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        })
      });

      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Connection lost. Please check your internet.' }]);
    } finally {
      setLoading(false);
    }
  };

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
              isMinimized ? 'h-16 w-64' : 'h-[500px] w-[350px] sm:w-[400px]'
            }`}
          >
            {/* Header */}
            <header className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-academy-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-academy-orange-900/20">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">SmartTutor AI</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={() => setVisible(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50">
                  {messages.length === 0 && (
                    <div className="text-center py-10">
                       <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                          <Sparkles className="text-academy-orange-600" size={32} />
                       </div>
                       <p className="text-sm font-bold text-slate-800">How can I help you today?</p>
                       <p className="text-xs text-slate-400 mt-1 px-10 leading-relaxed">Ask me about your courses, study plans, or any academic topic!</p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed ${
                        m.role === 'user' 
                          ? 'bg-academy-orange-600 text-white rounded-br-lg shadow-lg shadow-academy-orange-100' 
                          : 'bg-white border border-slate-100 text-slate-700 rounded-bl-lg shadow-sm'
                      }`}>
                        {m.text}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-bl-lg shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
                  <div className="relative">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full pl-4 pr-12 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-academy-orange-600 rounded-2xl text-sm font-medium transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-academy-orange-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-academy-orange-100 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex flex-col gap-3 ${visible ? 'hidden' : 'flex'}`}>
        <motion.a
          href="https://wa.me/918850447887"
          target="_blank"
          rel="noreferrer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-[#25D366] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-shadow"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </motion.a>

        <motion.button
          whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(147, 51, 234, 0.4)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setVisible(true)}
          className="w-14 h-14 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-shadow relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <Bot size={24} className="group-hover:animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-purple-600 animate-pulse" />
          </div>
        </motion.button>
      </div>
    </div>
  );
}
