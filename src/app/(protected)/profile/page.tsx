'use client';

import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { motion } from 'motion/react';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { profile, logout } = useAuth();

  if (!profile) return null;

  const info = [
    { icon: User, label: 'Roll Number / Username', value: profile.username || 'Not assigned' },
    { icon: Mail, label: 'Email Address', value: profile.email },
    { icon: User, label: 'Full Name', value: profile.displayName },
    { icon: Shield, label: 'Current Role', value: profile.role.toUpperCase() },
    { icon: Calendar, label: 'Date of Birth', value: profile.dob || 'Not provided' },
    { icon: User, label: 'Education Level', value: profile.educationLevel || 'Not provided' },
    { icon: Calendar, label: 'Member Since', value: new Date(profile.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-20">
      <header>
        <p className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1">Account & Security</p>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Identity Profile</h1>
      </header>

      <div className="space-y-6">
        {/* Avatar Card */}
        <div className="bg-white p-10 rounded-[40px] text-center shadow-sm relative overflow-hidden border border-slate-50">
          <div className="relative z-10">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-[40px] bg-slate-50 border-[6px] border-white shadow-xl mx-auto flex items-center justify-center">
                <User size={64} className="text-slate-300" />
              </div>
              <div className="absolute bottom-2 right-2 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                <Shield size={16} />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{profile.displayName}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">
              Official {profile.role}
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-50">
          <div className="space-y-3">
            {info.map((item) => (
              <div key={item.label} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-[24px] border border-slate-50 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-50">
                  <item.icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1.5">{item.label}</p>
                  <p className="text-slate-800 font-bold text-[13px] tracking-tight truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-50">
            <button 
              onClick={logout}
              className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Logout Securely
            </button>
          </div>
        </div>

        {/* Help Banner */}
        <div className="p-8 rounded-[40px] relative overflow-hidden bg-slate-900 text-white">
          <div className="absolute top-0 right-0 w-40 h-40 bg-academy-orange-600 rounded-full -mr-16 -mt-16 opacity-20 blur-3xl"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-black mb-2 tracking-tight">Academic Support</h3>
            <p className="text-slate-400 text-[11px] mb-6 font-medium leading-relaxed">Contact technical department for credentials or course enrollment issues.</p>
            <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
              Help Desk <Shield size={14} className="text-academy-orange-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
