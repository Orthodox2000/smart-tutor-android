'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, User, DollarSign, Plus, Search, Filter } from 'lucide-react';

export default function CoursesPage() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Explore Courses</h1>
          <p className="text-slate-500 text-sm">Pick a course to start your learning journey.</p>
        </div>
        
        {(profile?.role === 'admin' || profile?.role === 'teacher') && (
          <button 
            className="flex items-center justify-center gap-2 bg-academy-orange-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-academy-orange-100 whitespace-nowrap"
          >
            <Plus size={20} /> Create New Course
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-none focus:ring-0 text-slate-700 bg-transparent text-sm font-medium"
          />
        </div>
        <div className="h-6 w-[1px] bg-slate-100"></div>
        <button className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
          <Filter size={16} /> Filter
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mb-4"></div>
           <p className="text-xs font-bold uppercase tracking-widest">Finding Courses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course, i) => (
              <CourseCard key={course._id} course={course} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {!loading && filteredCourses.length === 0 && (
         <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
            <BookOpen className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No matching courses found</p>
         </div>
      )}
    </div>
  );
}

function CourseCard({ course, index }: { course: any; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => setIsExpanded(!isExpanded)}
      className={`bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:border-slate-200 transition-all cursor-pointer group flex flex-col ${isExpanded ? 'col-span-2' : 'h-full'}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">
            {course.category || 'General'}
          </span>
        </div>
        <h3 className="font-bold text-slate-900 leading-tight mb-2 group-hover:text-slate-900 transition-colors">
          {course.title}
        </h3>
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
          {course.summary || course.description}
        </p>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-slate-50 space-y-4"
            >
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Detailed Description</p>
                <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>
              </div>

              {course.subjectsCovered && (
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Subjects Covered</p>
                  <div className="flex flex-wrap gap-2">
                    {course.subjectsCovered.map((s: string) => (
                      <span key={s} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {course.points && (
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Key Highlights</p>
                  <ul className="space-y-2">
                    {course.points.map((p: string, i: number) => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600">
                        <span className="text-slate-300">•</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Duration</p>
                  <p className="text-xs font-bold text-slate-700">{course.duration || 'Flexible'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Mode</p>
                  <p className="text-xs font-bold text-slate-700">{course.mode || 'Offline'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {!isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-1.5 text-slate-400">
              <BookOpen size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Tap to Expand</span>
           </div>
           <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
              <Plus size={16} />
           </div>
        </div>
      )}
    </motion.div>
  );
}
