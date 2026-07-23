'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Library,
  Search,
  Download,
  Plus,
  X,
  Eye,
  BookOpen,
  FileText,
  GraduationCap,
  Lightbulb,
  Folder,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';
import PageContainer from '../../../components/PageContainer';
import PageHeader from '../../../components/PageHeader';

const PARENT_API = 'https://smarttutors.co.in/api';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Library },
  { id: 'school-learning', label: 'School', icon: BookOpen },
  { id: 'competitive-exam', label: 'Competitive', icon: GraduationCap },
  { id: 'technology-ai', label: 'Tech & AI', icon: Lightbulb },
  { id: 'personality-development', label: 'Personality', icon: FileText },
  { id: 'biography', label: 'Biography', icon: Folder },
  { id: 'non-fiction', label: 'Non-Fiction', icon: Folder },
  { id: 'government-exam', label: 'Govt Exams', icon: GraduationCap },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  'school-learning': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', gradient: 'from-blue-400 to-blue-600' },
  'competitive-exam': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', gradient: 'from-violet-400 to-violet-600' },
  'technology-ai': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', gradient: 'from-emerald-400 to-emerald-600' },
  'personality-development': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', gradient: 'from-amber-400 to-amber-600' },
  'biography': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', gradient: 'from-rose-400 to-rose-600' },
  'non-fiction': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', gradient: 'from-cyan-400 to-cyan-600' },
  'government-exam': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', gradient: 'from-orange-400 to-orange-600' },
};

export default function DigitalLibraryPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${PARENT_API}/digital-library`);
      const data = await res.json();
      const rawBooks = data?.books || data || [];
      const normalized = (Array.isArray(rawBooks) ? rawBooks : []).map((b: any) => ({
        ...b,
        author: b.author || 'Smart Tutors',
        category: b.categoryId || 'school-learning',
        categoryLabel: b.categoryLabel || b.categoryId || 'Other',
        thumbnailUrl: b.thumbnailUrl || null,
        megaFileUrl: b.downloadUrl ? `${PARENT_API}${b.downloadUrl}` : null,
        pathname: b.pathname || null,
        price: b.price || null,
      }));
      setItems(normalized);
    } catch (e) {
      console.error('Failed to fetch library:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        item.title?.toLowerCase().includes(q) ||
        item.author?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);
      const matchesFilter =
        filter === 'all' || item.category === filter || item.categoryId === filter || item.categoryLabel === filter;
      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  const categoryCounts = useMemo(() => {
    return items.reduce((acc: Record<string, number>, item: any) => {
      const cat = item.categoryId || item.category || 'school-learning';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const handlePreview = (item: any) => {
    if (item.pathname) {
      window.open(`${PARENT_API}/digital-library/preview?pathname=${item.pathname}`, '_blank');
    } else {
      alert('Preview not available');
    }
  };

  const handleDownload = (item: any) => {
    if (item.megaFileUrl) {
      window.open(item.megaFileUrl, '_blank');
    } else if (item.url || item.blobUrl) {
      window.open(item.url || item.blobUrl, '_blank');
    } else {
      alert('Download not available');
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Digital Library" subtitle="Resource Center" gradient="blue" showBack>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-white/70 bg-white/15 px-2.5 py-1 rounded-lg border border-white/10">
            {items.length} {items.length === 1 ? 'book' : 'books'}
          </span>
          {profile?.role === 'admin' && (
            <button className="w-9 h-9 rounded-xl bg-white/15 text-white flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-md">
              <Plus size={18} />
            </button>
          )}
        </div>
      </PageHeader>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search books, notes, authors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 focus:ring-2 focus:ring-academy-orange-600 rounded-2xl shadow-sm text-sm font-medium transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1">
        {CATEGORIES.map((cat) => {
          const count = cat.id === 'all' ? items.length : categoryCounts[cat.id] || 0;
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
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest">Loading Library...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item, i) => {
            const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Other'];
            const isFree = !item.price || item.price.toLowerCase() === 'free';
            return (
              <motion.div
                key={item._id || item.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* Cover Image */}
                <div className="relative h-40 overflow-hidden rounded-t-2xl">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${catStyle.gradient} flex flex-col items-center justify-center gap-2`}
                    >
                      <span className="text-4xl">📖</span>
                      <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">
                        {item.category || 'Book'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-3 space-y-2">
                  {/* Category badge */}
                  <span
                    className={`inline-block text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}
                  >
                    {item.categoryLabel || item.category || 'Other'}
                  </span>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-800 leading-tight line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Author */}
                  {item.author && (
                    <p className="text-[10px] text-slate-400 font-medium">by {item.author}</p>
                  )}

                  {/* Price */}
                  {item.price && (
                    <span
                      className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md ${
                        isFree
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isFree ? 'Free' : `₹${item.price.replace(/[₹]/g, '')}`}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="px-3 pb-3 flex gap-2">
                  <button
                    onClick={() => handlePreview(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-xl border border-slate-100 hover:bg-slate-100 transition-all active:scale-[0.98]"
                  >
                    <Eye size={12} />
                    Preview
                  </button>
                  <button
                    onClick={() => handleDownload(item)}
                    className="w-10 flex items-center justify-center py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
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
    </PageContainer>
  );
}
