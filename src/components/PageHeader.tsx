'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PageBackButton from './PageBackButton';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  gradient?: 'blue' | 'green' | 'rose' | 'amber' | 'purple';
  showBack?: boolean;
  rightAction?: React.ReactNode;
  children?: React.ReactNode;
}

const gradients = {
  blue: 'from-blue-600 via-indigo-600 to-purple-700',
  green: 'from-emerald-500 via-teal-600 to-cyan-700',
  rose: 'from-rose-500 via-pink-600 to-purple-700',
  amber: 'from-amber-500 via-orange-600 to-red-600',
  purple: 'from-violet-500 via-purple-600 to-indigo-700',
};

export default function PageHeader({
  title,
  subtitle,
  gradient = 'blue',
  showBack = true,
  rightAction,
  children,
}: PageHeaderProps) {
  const { profile } = useAuth();

  return (
    <section className="mb-6 -mx-5 px-0 relative">
      <div className={`bg-gradient-to-br ${gradients[gradient]} p-5 shadow-xl overflow-hidden relative`}>
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-fuchsia-500 opacity-20 rounded-full blur-3xl mix-blend-screen" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-sky-400 opacity-20 rounded-full blur-2xl mix-blend-screen" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {showBack && <PageBackButton />}
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
                <Sparkles size={12} className="text-yellow-300" />
                {subtitle || 'Smart Tutors'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {rightAction}
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
            {title}
          </h1>

          {children && (
            <div className="mt-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
