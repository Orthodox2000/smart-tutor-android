'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  ChevronRight,
  Globe,
  Link as LinkIcon,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const SOCIAL_LINKS = [
  {
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-emerald-500',
    href: 'https://wa.me/918850447887',
    label: '+91 88504 47887',
  },
  {
    name: 'Call Now',
    icon: Phone,
    color: 'bg-academy-orange-600',
    href: 'tel:+918850447887',
    label: 'Call Smart Tutors',
  },
  {
    name: 'Instagram',
    icon: LinkIcon,
    color: 'bg-pink-600',
    href: 'https://www.instagram.com/smart_tutor_no1?igsh=MmVnZDllb3h4Y3I3&utm_source=qr',
    label: '@smart_tutor_no1',
  },
];

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-10 pt-4 px-4">
      <header className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-2xl transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contact Us</h1>
          <p className="text-xs text-slate-500 font-medium">
            Connect with Smart Tutors for academic excellence.
          </p>
        </div>
      </header>

      <div className="space-y-4">
        {SOCIAL_LINKS.map((link, i) => (
          <motion.a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group block p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`${link.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  <link.icon size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">
                    {link.name}
                  </p>
                  <p className="text-slate-800 font-bold text-sm">{link.label}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.a>
        ))}
      </div>

      <div className="p-8 rounded-2xl bg-gradient-to-br from-academy-orange-50 to-white border border-academy-orange-100/50 shadow-sm">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-slate-100">
          <BadgeCheck size={32} className="text-academy-orange-600" />
        </div>
        <h3 className="text-lg font-black text-slate-900">Prof. Ravi Rana</h3>
        <p className="text-xs font-bold text-academy-orange-700 mt-1 uppercase tracking-widest">Director & Founder</p>
        <div className="mt-4 space-y-1">
          <p className="text-xs font-medium text-slate-400">Smart Tutors</p>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div className="w-16 h-16 bg-academy-orange-50 rounded-2xl flex items-center justify-center mb-4">
          <Building2 size={32} className="text-academy-orange-600" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-2">Technical Support</h3>
        <p className="text-xs text-slate-500 mb-4 font-medium">Primary contact number and WhatsApp:</p>
        <a
          href="https://wa.me/918850447887"
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-black text-academy-orange-600"
        >
          +91 88504 47887
        </a>
        <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-400">
          <Globe size={16} className="text-slate-300" />
          <span className="uppercase tracking-widest">smart_tutor_no1</span>
        </div>
      </div>
    </div>
  );
}
