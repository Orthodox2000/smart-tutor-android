'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Shield, Info, LogOut } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function SettingsPage() {
  const { i18n } = useTranslation();
  const { logout } = useAuth();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-20">
      <header>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Preferences</p>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">App Settings</h1>
      </header>

      <div className="space-y-6">
        {/* Language Selection */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
              <Languages size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">System Language</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Select your preferred language</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'Hindi' },
              { code: 'mr', label: 'Marathi' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  i18n.language === lang.code 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Support & Privacy */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-50">
          <div className="space-y-2">
             <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white transition-all">
                    <Shield size={16} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Privacy Policy</span>
                </div>
                <Info size={16} className="text-slate-200" />
             </button>
             <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white transition-all">
                    <Info size={16} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">App Version</span>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">v2.0.1</span>
             </button>
          </div>
        </div>

        <button 
          onClick={logout}
          className="w-full bg-slate-50 text-red-500 py-5 rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-red-50 transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Logout Securely
        </button>
      </div>
    </div>
  );
}
