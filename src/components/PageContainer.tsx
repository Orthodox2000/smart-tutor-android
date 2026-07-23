'use client';

import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-[#F4F7FC] text-slate-800 font-sans selection:bg-indigo-100 overflow-x-hidden relative flex justify-center`}>
      <div className={`relative w-full max-w-md bg-[#F4F7FC] min-h-screen flex flex-col overflow-hidden ${className}`}>
        <main className="flex-1 overflow-y-auto pb-28 px-5 pt-2">
          {children}
        </main>
      </div>
    </div>
  );
}
