'use client';

import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  bg?: string;
  trend?: string;
  delay?: number;
}

export default function StatCard({ title, value, icon: Icon, color = 'text-blue-500', bg = 'bg-blue-50', trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`w-10 h-10 rounded-[14px] ${bg} ${color} flex items-center justify-center`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">{title}</span>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-extrabold text-slate-800 leading-none">{value}</span>
        </div>
        {trend && (
          <span className={`text-[10px] font-semibold mt-2 inline-block px-2 py-0.5 rounded-md ${bg} ${color}`}>
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
}
