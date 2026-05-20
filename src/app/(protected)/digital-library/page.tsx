'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Library, 
  Book, 
  FileText, 
  Search, 
  Download, 
  ChevronRight, 
  Filter,
  Plus
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const CATEGORIES = ['All', 'Textbook', 'Faculty Note', 'Mock Paper'];

export default function DigitalLibraryPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchItems();
  }, [filter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const url = filter === 'All' 
        ? '/api/digital-library' 
        : `/api/digital-library?category=${encodeURIComponent(filter)}`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch library items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <header>
        <p className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1">Resource Center</p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Digital Library</h1>
          {profile?.role === 'admin' && (
            <button className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
              <Plus size={20} />
            </button>
          )}
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Search books, notes, or authors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 focus:ring-2 focus:ring-academy-orange-600 rounded-2xl shadow-sm text-sm font-medium transition-all"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`
              px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all
              ${filter === cat 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mb-4"></div>
           <p className="text-xs font-bold uppercase tracking-widest">Loading Library...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-slate-200 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400">
                <FileText size={24} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {item.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{item.title}</h3>
                <p className="text-[10px] text-slate-400 font-medium">By {item.author} • {item.megaFileName}</p>
              </div>

              <a 
                href={item.megaFileUrl}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"
              >
                <Download size={18} />
              </a>
            </motion.div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-20 opacity-30">
               <Library size={48} className="mx-auto mb-4" />
               <p className="text-sm font-bold uppercase tracking-widest">No resources found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
