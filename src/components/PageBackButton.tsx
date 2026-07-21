'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PageBackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="w-10 h-10 -ml-2 flex items-center justify-center rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
      aria-label="Go back"
    >
      <ArrowLeft size={22} className="text-slate-700" />
    </button>
  );
}
