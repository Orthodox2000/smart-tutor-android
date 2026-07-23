'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface FeatureItem {
  name: string;
  icon: LucideIcon;
  bg: string;
  text: string;
  path: string;
}

interface FeatureGridProps {
  features: FeatureItem[];
  title?: string;
}

export default function FeatureGrid({ features, title = 'Explore Services' }: FeatureGridProps) {
  return (
    <section className="mb-6 -mx-5 px-0">
      <h2 className="text-[15px] font-bold text-slate-800 mb-4 px-5">{title}</h2>
      <div className="bg-white shadow-sm border-y border-slate-100">
        <div className="grid grid-cols-4 gap-y-5 gap-x-0 px-3 py-4">
          {features.map((feature, idx) => (
            <Link key={idx} href={feature.path} className="flex flex-col items-center justify-start group">
              <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-2 group-hover:-translate-y-1 transition-transform duration-200 ease-out`}>
                <feature.icon size={20} className={feature.text} strokeWidth={2} />
              </div>
              <span className="text-[9px] font-bold text-slate-600 text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full px-0.5">
                {feature.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
