'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { BookOpen, User, Phone, Calendar, School, ChevronRight, Lock, MessageSquareLock } from 'lucide-react';
// import { auth, db } from '../../lib/firebase';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { doc, setDoc } from 'firebase/firestore';
import { normalizeMobile } from '../../lib/phone';

const EDUCATION_LEVELS = [
  'Class 6th', 'Class 7th', 'Class 8th', 'Class 9th', 'Class 10th',
  'Secondary (11th-12th)', 'Graduation', 'Post Graduation (MSc/MA/etc)', 'Diploma', 'Government Service Exams'
];

const getFriendlyErrorMessage = (error: any) => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/user-not-found': return 'No account found with this username.';
    case 'auth/wrong-password': return 'Incorrect password. Please try again.';
    case 'auth/invalid-email': return 'Invalid credentials provided.';
    case 'auth/network-request-failed': return 'Network error. Please check your internet.';
    case 'auth/user-disabled': return 'This account has been disabled.';
    case 'auth/email-already-in-use': return 'Username is already taken.';
    case 'auth/weak-password': return 'Password should be at least 6 characters.';
    case 'auth/operation-not-allowed': return 'Phone OTP login is not enabled in Firebase yet. Turn on Phone sign-in in Firebase Authentication.';
    case 'auth/invalid-phone-number': return 'Enter a valid 10-digit mobile number.';
    case 'auth/invalid-verification-code': return 'The OTP is incorrect. Please try again.';
    case 'auth/code-expired': return 'This OTP has expired. Request a new one.';
    case 'auth/too-many-requests': return 'Too many attempts. Please wait and try again later.';
    default: return error?.message || 'An unexpected error occurred. Please try again.';
  }
};

export default function LoginPage() {
  const { profile, loading: authLoading, signIn, requestOtpForMobile, verifyOtpSignIn } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    mobile: '',
    dob: '',
    educationLevel: 'Graduation',
    displayName: ''
  });

  useEffect(() => {
    if (!authLoading && profile) {
      router.push('/');
    }
  }, [profile, authLoading, router]);

  if (authLoading || profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academy-orange-600"></div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(formData.username, formData.password);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.mobile.length !== 10) {
      setError('Mobile number must be 10 digits');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const email = `${formData.username}@smarttutors.co.in`;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Automatically login after signup
      await signIn(formData.username, formData.password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    setOtpCode('');

    try {
      // Firebase OTP disabled
      /*
      await requestOtpForMobile(formData.mobile, 'recaptcha-container');
      setOtpSent(true);
      */
      setError('OTP login is currently disabled during migration.');
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Firebase OTP disabled
      // await verifyOtpSignIn(otpCode);
      setError('OTP verification is currently disabled during migration.');
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center bg-slate-200 min-h-screen">
      <div className="w-full max-w-[430px] bg-white min-h-screen relative overflow-hidden shadow-2xl flex flex-col items-center p-8">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-academy-orange-50 rounded-full blur-3xl -mr-32 -mt-16 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-academy-red-50 rounded-full blur-3xl -ml-32 -mb-16 opacity-60"></div>

        <div className="relative z-10 w-full flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-academy-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-academy-orange-100 mb-6"
          >
            <BookOpen className="text-white" size={32} />
          </motion.div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2 text-center">
            Smart Tutors
          </h1>
          <p className="text-slate-500 text-sm mb-8 text-center max-w-[240px]">
            {isLogin ? 'Login to continue your learning journey' : 'Join Smart Tutors and start your academic excellence journey.'}
          </p>

          {isLogin && (
            <div className="mb-6 flex w-full rounded-2xl bg-slate-100 p-1">
              {([
                { key: 'password', label: 'Password Login' },
                { key: 'otp', label: 'Mobile OTP' },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setLoginMethod(item.key);
                    setError('');
                    setOtpSent(false);
                    setOtpCode('');
                  }}
                  className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                    loginMethod === item.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

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

          <form
            onSubmit={
              isLogin
                ? (loginMethod === 'password' ? handleLogin : handleVerifyOtp)
                : handleSignup
            }
            className="w-full space-y-4"
          >
            <div className="space-y-4">
              {(!isLogin || loginMethod === 'password') && (
                <InputGroup 
                  icon={User} 
                  placeholder="Username or Email" 
                  value={formData.username} 
                  onChange={(v: string) => setFormData({...formData, username: v})} 
                />
              )}
              {!isLogin && (
                <InputGroup 
                  icon={User} 
                  placeholder="Full Name" 
                  value={formData.displayName} 
                  onChange={(v: string) => setFormData({...formData, displayName: v})} 
                />
              )}
              {(!isLogin || loginMethod === 'password') && (
                <InputGroup 
                  icon={Lock} 
                  placeholder="Password" 
                  type="password"
                  value={formData.password} 
                  onChange={(v: string) => setFormData({...formData, password: v})} 
                />
              )}

              {isLogin && loginMethod === 'otp' && (
                <>
                  <InputGroup 
                    icon={Phone} 
                    placeholder="Mobile Number (10 digits)" 
                    type="tel"
                    value={formData.mobile} 
                    onChange={(v: string) => setFormData({...formData, mobile: normalizeMobile(v)})} 
                  />
                  {otpSent && (
                    <InputGroup
                      icon={MessageSquareLock}
                      placeholder="Enter 6-digit OTP"
                      value={otpCode}
                      onChange={(v: string) => setOtpCode(v.replace(/\D/g, '').slice(0, 6))}
                    />
                  )}
                  <div id="recaptcha-container" />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || normalizeMobile(formData.mobile).length !== 10}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-4 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50"
                  >
                    {loading && !otpSent ? 'Sending OTP...' : (otpSent ? 'Resend OTP' : 'Send OTP')}
                  </button>
                </>
              )}
              
              {!isLogin && (
                <>
                  <InputGroup 
                    icon={Phone} 
                    placeholder="Mobile Number (10 digits)" 
                    type="tel"
                    value={formData.mobile} 
                    onChange={(v: string) => setFormData({...formData, mobile: normalizeMobile(v)})} 
                  />
                  <InputGroup 
                    icon={Calendar} 
                    placeholder="Date of Birth" 
                    type="date"
                    value={formData.dob} 
                    onChange={(v: string) => setFormData({...formData, dob: v})} 
                  />
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-1">
                      <School size={10} /> Education Details
                    </label>
                    <select 
                      value={formData.educationLevel}
                      onChange={(e) => setFormData({...formData, educationLevel: e.target.value})}
                      className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"
                    >
                      {EDUCATION_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <button 
              disabled={loading || (isLogin && loginMethod === 'otp' && (!otpSent || otpCode.length !== 6))}
              className="w-full flex items-center justify-center gap-2 bg-academy-orange-600 py-4 shadow-lg shadow-academy-orange-100 rounded-2xl mt-4 font-bold text-[15px] text-white"
            >
              {loading
                ? 'Processing...'
                : isLogin
                  ? (loginMethod === 'password' ? 'Login Now' : 'Verify OTP')
                  : 'Join Smart Tutors'}
              <ChevronRight size={20} />
            </button>
          </form>

          {/* Signup disabled for now - only admin can create accounts
          <div className="w-full mt-8 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center"><span className="px-4 bg-white text-[10px] font-bold text-slate-300 uppercase tracking-widest">account access</span></div>
            </div>

            <p className="text-center text-sm font-medium text-slate-500">
              {isLogin ? "Don't have an account?" : "Already member?"}{' '}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setOtpSent(false);
                  setOtpCode('');
                  setLoginMethod('password');
                }}
                className="text-academy-orange-600 font-bold"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
          */}
          
          <div className="mt-auto pt-10 text-center">
             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
               Smart Tutors • AM dev • v2.0             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ icon: Icon, placeholder, type = 'text', value, onChange }: any) {
  return (
    <div className="relative w-full">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-academy-orange-600 rounded-2xl transition-all text-sm font-medium placeholder:text-slate-400"
      />
    </div>
  );
}
