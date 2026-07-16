'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { 
  Languages, Shield, Info, LogOut, User, 
  ChevronRight, FileText, ScrollText, Check, 
  X, Loader2, Phone, Calendar, BookOpen
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function SettingsPage() {
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const { profile, logout } = useAuth();

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 animate-fade-in">
      <header>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{t('settings.subtitle')}</p>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('settings.title')}</h1>
      </header>

      <div className="space-y-4">
        {/* Editable Profile Section */}
        <EditableProfile />

        {/* Language Selection */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-200/50">
              <Languages size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{t('settings.language')}</h3>
              <p className="text-[10px] text-slate-400 font-medium">{t('settings.languageDesc')}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {[
              { code: 'en', label: 'English', native: 'EN' },
              { code: 'hi', label: 'हिन्दी', native: 'HI' },
              { code: 'mr', label: 'मराठी', native: 'MR' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  localStorage.setItem('i18nextLng', lang.code);
                }}
                className={`px-3 py-3 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  i18n.language === lang.code 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] font-black tracking-widest">{lang.native}</span>
                <span className="text-[8px] opacity-60">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Support & Legal */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{t('settings.support')}</p>
          <div className="space-y-1">
            <Link href="/privacy-policy" className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                  <Shield size={16} />
                </div>
                <span className="text-sm font-bold text-slate-700">{t('settings.privacy')}</span>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>
            <Link href="/eula" className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                  <FileText size={16} />
                </div>
                <span className="text-sm font-bold text-slate-700">{t('settings.eula')}</span>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>
            <Link href="/terms-and-conditions" className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <ScrollText size={16} />
                </div>
                <span className="text-sm font-bold text-slate-700">{t('settings.terms')}</span>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>
            <div className="w-full flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                  <Info size={16} />
                </div>
                <span className="text-sm font-bold text-slate-700">{t('settings.appVersion')}</span>
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">v3.0</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={logout}
          className="w-full bg-red-50 text-red-500 py-4 rounded-xl font-black uppercase tracking-[0.15em] text-[10px] hover:bg-red-100 transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> {t('settings.logout')}
        </button>
      </div>
    </div>
  );
}

function EditableProfile() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    displayName: profile?.displayName || '',
    mobile: profile?.mobile || '',
    dob: profile?.dob || '',
  });

  if (!profile) return null;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          uid: profile.uid || undefined,
          id: profile.id,
          displayName: form.displayName,
          mobile: form.mobile,
          dob: form.dob,
        }),
      });

      if (res.ok) {
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        window.location.reload();
      } else {
        const data = await res.json();
        setError(data.error || t('profile.saveError'));
      }
    } catch {
      setError(t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-200/50">
            <User size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">{t('settings.profile')}</h3>
            <p className="text-[10px] text-slate-400 font-medium">{t('settings.profileDesc')}</p>
          </div>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider"
          >
            {t('common.edit')}
          </button>
        )}
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-emerald-50 rounded-xl flex items-center gap-2">
          <Check size={16} className="text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700">{t('profile.saved')}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-xl flex items-center gap-2">
          <X size={16} className="text-red-600" />
          <span className="text-xs font-bold text-red-700">{error}</span>
        </div>
      )}

      <div className="space-y-3">
        {/* Read-only fields */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100">
            <BookOpen size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('profile.username')}</p>
            <p className="text-xs font-bold text-slate-700 truncate">{profile.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100">
            <Shield size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('profile.role')}</p>
            <p className="text-xs font-bold text-orange-600 uppercase">{profile.role}</p>
          </div>
        </div>

        {editing ? (
          <>
            <EditableField
              icon={<User size={14} />}
              label={t('profile.displayName')}
              value={form.displayName}
              onChange={(v) => setForm({ ...form, displayName: v })}
            />
            <EditableField
              icon={<Phone size={14} />}
              label={t('profile.mobile')}
              value={form.mobile}
              onChange={(v) => setForm({ ...form, mobile: v })}
              type="tel"
              placeholder="+91 XXXXX XXXXX"
            />
            <EditableField
              icon={<Calendar size={14} />}
              label={t('profile.dob')}
              value={form.dob}
              onChange={(v) => setForm({ ...form, dob: v })}
              type="date"
            />
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                <User size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('profile.displayName')}</p>
                <p className="text-xs font-bold text-slate-700 truncate">{profile.displayName || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                <Phone size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('profile.mobile')}</p>
                <p className="text-xs font-bold text-slate-700 truncate">{profile.mobile || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                <Calendar size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('profile.dob')}</p>
                <p className="text-xs font-bold text-slate-700 truncate">{profile.dob || 'Not provided'}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {editing && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setEditing(false);
              setForm({
                displayName: profile?.displayName || '',
                mobile: profile?.mobile || '',
                dob: profile?.dob || '',
              });
              setError('');
            }}
            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
          >
            <X size={14} /> {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {t('common.save')}
          </button>
        </div>
      )}
    </div>
  );
}

function EditableField({ 
  icon, label, value, onChange, type = 'text', placeholder = '' 
}: { 
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="p-3 bg-slate-50 rounded-xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100">
          {icon}
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
      />
    </div>
  );
}
