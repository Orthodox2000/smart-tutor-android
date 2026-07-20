'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-50">
        <div className="flex items-center justify-center bg-slate-200 min-h-screen">
          <div className="w-full max-w-[430px] bg-white min-h-screen sm:min-h-0 sm:h-[85vh] sm:max-h-[780px] relative overflow-hidden shadow-2xl flex flex-col items-center justify-center sm:rounded-3xl p-8">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-32 -mt-16 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-academy-red-50 rounded-full blur-3xl -ml-32 -mb-16 opacity-60"></div>

            <div className="relative z-10 w-full flex flex-col items-center text-center">
              <div className="mb-6">
                <img 
                  src="/image4.jpeg" 
                  alt="Smart Tutors" 
                  className="h-20 w-20 rounded-2xl object-cover shadow-lg" 
                />
              </div>

              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Critical Error</p>
              <h1 className="text-lg font-black text-slate-900 tracking-tight mb-2">App Error</h1>
              <p className="text-sm text-slate-500 mb-8 max-w-[280px]">
                {error.message || 'Something went wrong. Please try again.'}
              </p>

              <div className="w-full space-y-3">
                <button
                  onClick={() => reset()}
                  className="w-full flex items-center justify-center gap-2 bg-academy-orange-600 py-4 shadow-lg shadow-academy-orange-100 rounded-2xl font-bold text-[15px] text-white transition-all active:scale-[0.98]"
                >
                  <AlertCircle size={18} />
                  Try Again
                </button>
              </div>

              <div className="mt-8">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  Smart Tutors &bull; v3.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
