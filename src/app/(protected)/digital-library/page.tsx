'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Library, 
  Book, 
  FileText, 
  Search, 
  Download, 
  ChevronRight, 
  Filter,
  Plus,
  X,
  Eye,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Star,
  Folder
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Library },
  { id: 'Textbook', label: 'Textbooks', icon: BookOpen },
  { id: 'Faculty Note', label: 'Faculty Notes', icon: FileText },
  { id: 'Mock Paper', label: 'Mock Papers', icon: GraduationCap },
  { id: 'Reference', label: 'Reference', icon: Lightbulb },
  { id: 'Other', label: 'Other', icon: Folder },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  'Textbook': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500' },
  'Faculty Note': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'text-emerald-500' },
  'Mock Paper': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', icon: 'text-violet-500' },
  'Reference': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'text-amber-500' },
  'Other': { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: 'text-slate-400' },
};

export default function DigitalLibraryPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [previewItem, setPreviewItem] = useState<any>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/digital-library', { credentials: 'include' });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      console.error('Failed to fetch library items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = !search || 
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.author?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categoryCounts = items.reduce((acc: Record<string, number>, item: any) => {
    const cat = item.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5 pb-20">
      <header>
        <p className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1">Resource Center</p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Digital Library</h1>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
              {items.length} {items.length === 1 ? 'book' : 'books'}
            </span>
            {(profile?.role === 'admin' || profile?.role === 'educator') && (
              <button className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                <Plus size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Search books, notes, authors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 focus:ring-2 focus:ring-academy-orange-600 rounded-2xl shadow-sm text-sm font-medium transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1">
        {CATEGORIES.map(cat => {
          const count = cat.id === 'all' ? items.length : (categoryCounts[cat.id] || 0);
          const isActive = filter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              <cat.icon size={14} />
              {cat.label}
              {count > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Book List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest">Loading Library...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="space-y-3">
          {filteredItems.map((item, i) => {
            const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Other'];
            return (
              <motion.div
                key={item._id || item.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                <div className="p-4 flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl ${catStyle.bg} border ${catStyle.border} flex items-center justify-center shrink-0`}>
                    <FileText size={20} className={catStyle.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}>
                        {item.category || 'Other'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight">{item.title}</h3>
                    {item.author && (
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">by {item.author}</p>
                    )}
                    {item.description && (
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                    )}
                  </div>
                </div>

                <div className="px-4 pb-3 flex items-center gap-2">
                  {item.megaFileUrl && (
                    <a 
                      href={item.megaFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
                    >
                      <Download size={14} />
                      Download
                    </a>
                  )}
                  {item.megaFileName && (
                    <span className="text-[9px] text-slate-400 font-bold truncate max-w-[120px]">
                      {item.megaFileName}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
          <Library size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-sm font-bold text-slate-800">No resources found</p>
          <p className="text-xs text-slate-400 mt-1">
            {search ? 'Try a different search term' : 'Books will appear here once uploaded'}
          </p>
        </div>
      )}
    </div>
  );
}
