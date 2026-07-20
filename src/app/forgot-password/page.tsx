'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Send, CheckCircle, User, Mail, Phone, Key } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    lastPassword: '',
    role: 'student',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center bg-slate-200 min-h-screen">
      <div className="w-full max-w-[430px] bg-white min-h-screen relative overflow-hidden shadow-2xl flex flex-col">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-academy-orange-50 rounded-full blur-3xl -mr-32 -mt-16 opacity-60"></div>

        <header className="p-4 flex items-center gap-4 relative z-10">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-2xl transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Forgot Password</h1>
            <p className="text-xs text-slate-500 font-medium">We'll help you recover your account</p>
          </div>
        </header>

        <div className="flex-1 p-8 relative z-10">
          {submitted ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center text-center pt-20"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Request Submitted</h2>
              <p className="text-sm text-slate-500 mb-8 max-w-[280px]">
                Your request has been submitted. Our team will review it and get back to you shortly.
              </p>
              <button 
                onClick={() => router.push('/login')}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm"
              >
                Back to Login
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-500 mb-6">
                Provide your details and we'll verify your identity to reset your password.
              </p>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="relative w-full">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Full Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-academy-orange-600 rounded-2xl text-sm font-medium placeholder:text-slate-400"
                />
              </div>

              <div className="relative w-full">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email"
                  placeholder="Email Address"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-academy-orange-600 rounded-2xl text-sm font-medium placeholder:text-slate-400"
                />
              </div>

              <div className="relative w-full">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-academy-orange-600 rounded-2xl text-sm font-medium placeholder:text-slate-400"
                />
              </div>

              <div className="relative w-full">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Last Known Password"
                  value={formData.lastPassword}
                  onChange={(e) => setFormData({...formData, lastPassword: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-academy-orange-600 rounded-2xl text-sm font-medium placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Your Role</label>
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                  {(['student', 'parent', 'educator'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({...formData, role})}
                      className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold capitalize transition-all ${
                        formData.role === role ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-academy-orange-600 py-4 shadow-lg shadow-academy-orange-100 rounded-2xl mt-6 font-bold text-[15px] text-white disabled:opacity-60"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
                <Send size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
