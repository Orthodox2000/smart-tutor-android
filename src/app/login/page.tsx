'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { User, Lock, ChevronRight, GraduationCap, Users, BookOpen, Eye, EyeOff } from 'lucide-react';

const LOGIN_ROLES = [
  { key: 'student', label: 'Student', icon: GraduationCap },
  { key: 'parent', label: 'Parent', icon: Users },
  { key: 'educator', label: 'Faculty', icon: BookOpen },
] as const;

const getFriendlyErrorMessage = (error: any) => {
  const msg = error?.message || '';
  if (msg.includes('not found')) return 'No account found with these credentials.';
  if (msg.includes('Invalid credentials')) return 'Incorrect password. Please try again.';
  if (msg.includes('registered as')) return msg;
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('Network')) return 'Network error. Please check your internet connection.';
  return msg || 'Something went wrong. Please try again.';
};

export default function LoginPage() {
  const { profile, loading: authLoading, signIn } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && profile) {
      router.push('/');
    }
  }, [profile, authLoading, router]);

  if (authLoading || profile) {
    return (
      <div className="flex items-center justify-center h-[100dvh] h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academy-orange-600"></div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(username, password, selectedRole);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex items-center justify-center bg-slate-200 h-[100dvh] h-screen">
        <div className="w-full max-w-[430px] bg-white h-full relative overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8 sm:rounded-3xl sm:h-[85vh] sm:max-h-[780px]" style={{ height: '100%' }}>
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-academy-orange-50 rounded-full blur-3xl -mr-32 -mt-16 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-academy-red-50 rounded-full blur-3xl -ml-32 -mb-16 opacity-60"></div>

        <div className="relative z-10 w-full flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <img 
              src="/image4.jpeg" 
              alt="Smart Tutors" 
              className="h-20 w-20 rounded-2xl object-cover shadow-lg" 
            />
          </motion.div>

          <h1 className="text-lg font-black text-slate-900 tracking-tight mb-1">Smart Tutors</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Welcome back</p>

          {/* Role Selector */}
          <div className="mb-6 flex w-full rounded-2xl bg-slate-100 p-1">
            {LOGIN_ROLES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setSelectedRole(item.key);
                  setError('');
                }}
                className={`flex-1 rounded-xl px-3 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === item.key 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500'
                }`}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </div>

          {error && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-medium mb-6 flex items-center gap-2"
             >
               <span className="w-1 h-1 bg-red-600 rounded-full animate-pulse"></span>
               {error}
             </motion.div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-4">
              <div className="relative w-full">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Username or Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-academy-orange-600 rounded-2xl transition-all text-sm font-medium placeholder:text-slate-400"
                />
              </div>
              <div className="relative w-full">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-academy-orange-600 rounded-2xl transition-all text-sm font-medium placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-academy-orange-600 py-4 shadow-lg shadow-academy-orange-100 rounded-2xl mt-4 font-bold text-[15px] text-white"
            >
              {loading ? 'Processing...' : 'Login Now'}
              <ChevronRight size={20} />
            </button>
          </form>

          <div className="w-full mt-6 text-center">
            <a 
              href="/forgot-password"
              className="text-xs font-bold text-slate-400 hover:text-academy-orange-600 transition-colors"
            >
              Forgot Password?
            </a>
          </div>
          
          <div className="mt-6 text-center">
             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
               Smart Tutors &bull; v3.0
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
