'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  ArrowRight, 
  Trophy,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  FileText,
  User,
  Plus,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';
import PageBackButton from '../../../components/PageBackButton';

export default function MockTestPage() {
  const { profile } = useAuth();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [fullTestData, setFullTestData] = useState<any>(null);
  const [testError, setTestError] = useState('');

  const fetchTests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<any>('/tests');
      setTests(Array.isArray(data) ? data : (data.tests ?? []));
    } catch {
      setError('Unable to load assessments. Pull to retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const startTest = async (testId: string) => {
    const test = tests.find(t => t._id === testId);
    if (test?.fileUrl) {
      window.open(test.fileUrl, '_blank');
      return;
    }
    setLoading(true);
    setTestError('');
    try {
      const data = await apiFetch<any>(`/tests?id=${testId}`);
      const questions = data?.questions ?? data?.test?.questions ?? [];
      if (!Array.isArray(questions) || questions.length === 0) {
        setTestError('This test has no questions yet.');
        return;
      }
      setFullTestData({ ...data, questions });
      setActiveTestId(testId);
    } catch {
      setTestError('Failed to load test questions.');
    } finally {
      setLoading(false);
    }
  };

  const exitTest = () => { setActiveTestId(null); setFullTestData(null); setTestError(''); };

  if (activeTestId && fullTestData) {
    return <TestSession test={fullTestData} onExit={exitTest} />;
  }

  return (
    <div className="space-y-5 pb-20">
      <header className="flex items-center gap-2">
        <PageBackButton />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1">Testing Arena</p>
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate">Tests & Assignments</h1>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={fetchTests} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                <RefreshCw size={16} />
              </button>
              {(profile?.role === 'admin' || profile?.role === 'educator') && (
                <button className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                  <Plus size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {testError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-[11px] font-bold text-red-600 flex-1">{testError}</p>
          <button onClick={exitTest} className="text-[10px] font-bold text-red-500 underline shrink-0">Dismiss</button>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 opacity-40">
            <Loader2 className="animate-spin mb-3" size={28} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading Assessments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <AlertCircle className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-3">{error}</p>
            <button onClick={fetchTests} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold">Retry</button>
          </div>
        ) : (
          <div className="space-y-3">
             {tests.map((test) => (
               <motion.div 
                 key={test._id ?? test.id}
                 whileHover={{ y: -1 }}
                 className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
               >
                  <div className="flex items-start gap-3 mb-3">
                     <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                        <FileText size={18} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {test.category ?? 'General'}
                          </span>
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400">
                            {test.subject ?? 'All'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-[13px] leading-snug line-clamp-2">{test.title}</h4>
                     </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl">
                     <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-400 shrink-0">
                           <User size={12} />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-0.5">Sent By</p>
                           <p className="text-[10px] font-bold text-slate-600 truncate">{test.senderName ?? 'Academy'}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => startTest(test._id)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-bold shadow-md hover:bg-slate-800 transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
                     >
                        {test.fileUrl ? 'View' : 'Start'} <ArrowRight size={12} />
                     </button>
                  </div>
               </motion.div>
             ))}

             {tests.length === 0 && (
               <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 border-dashed">
                  <FileText className="mx-auto text-slate-200 mb-3" size={40} />
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">No assessments assigned</p>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}

function TestSession({ test, onExit }: { test: any, onExit: () => void }) {
  const { profile } = useAuth();
  const questions: any[] = test?.questions ?? [];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => new Array(questions.length).fill(-1));
  const [timeLeft, setTimeLeft] = useState((test.duration || 60) * 60);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelect = (optionIndex: number) => {
    setAnswers(prev => { const n = [...prev]; n[currentQuestion] = optionIndex; return n; });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data = await apiFetch<any>('/mock-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: test._id,
          studentUid: profile?.uid,
          studentName: profile?.displayName || profile?.username,
          answers
        })
      });
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center p-8">
        <div className="text-center max-w-xs">
          <AlertCircle size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-800 mb-1">Test Unavailable</h3>
          <p className="text-xs text-slate-500 mb-5">This test has no questions or failed to load.</p>
          <button onClick={onExit} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold">Go Back</button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-50 flex justify-center p-4">
        <div className="w-full max-w-[430px] flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 bg-slate-200 text-slate-600 rounded-2xl flex items-center justify-center mb-5">
              <Trophy size={40} />
           </div>
           <h2 className="text-xl font-black text-slate-900 mb-1">Assessment Complete!</h2>
           <p className="text-slate-500 mb-6 font-medium text-sm">You&apos;ve completed {test.title}.</p>
           
           <div className="grid grid-cols-2 gap-3 w-full mb-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Score</p>
                 <p className="text-2xl font-black text-slate-900">{result.score?.toFixed(1) ?? '—'}%</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Correct</p>
                 <p className="text-2xl font-black text-slate-900">{result.correctAnswers ?? 0}/{result.totalQuestions ?? questions.length}</p>
              </div>
           </div>

           <button onClick={onExit} className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform">
             Return to Assessments
           </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="fixed inset-0 z-[200] bg-white flex justify-center">
       <div className="w-full max-w-[430px] flex flex-col h-full bg-slate-50">
          <header className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
             <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 text-[13px] line-clamp-1">{test.title}</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">In Progress · {test.subject ?? 'Test'}</p>
             </div>
             <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-black shrink-0 ml-2 ${timeLeft < 300 ? 'bg-red-50 text-red-600' : 'bg-slate-900 text-white'}`}>
                <Clock size={12} /> {formatTime(timeLeft)}
             </div>
          </header>

          {/* Progress bar */}
          <div className="h-1 bg-slate-100 shrink-0">
             <div className="h-full bg-academy-orange-500 transition-all duration-300" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
             <div className="space-y-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                     Question {currentQuestion + 1} of {questions.length}
                   </p>
                   <p className="text-[14px] font-bold text-slate-800 leading-relaxed">
                      {q?.question ?? 'Question not available'}
                   </p>
                </div>

                <div className="space-y-2.5">
                   {(q?.options ?? []).map((opt: string, i: number) => (
                     <button 
                       key={i}
                       onClick={() => handleSelect(i)}
                       className={`w-full p-4 rounded-xl text-left text-[13px] font-bold transition-all flex items-center gap-3 border-2 ${
                         answers[currentQuestion] === i 
                           ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                           : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                       }`}
                     >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                           answers[currentQuestion] === i ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-400'
                        }`}>
                           {String.fromCharCode(65 + i)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                     </button>
                   ))}
                   {(q?.options ?? []).length === 0 && (
                     <p className="text-xs text-slate-400 text-center py-8">No options available for this question.</p>
                   )}
                </div>
             </div>
          </div>

          <footer className="px-4 py-3 bg-white border-t border-slate-100 flex gap-2.5 shrink-0" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
             <button 
               onClick={() => currentQuestion > 0 ? setCurrentQuestion(p => p - 1) : onExit()} 
               className="px-5 py-3.5 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm"
             >
                {currentQuestion === 0 ? 'Quit' : <ChevronLeft size={18} />}
             </button>
             
             {currentQuestion < questions.length - 1 ? (
                <button 
                  onClick={() => setCurrentQuestion(p => p + 1)}
                  disabled={answers[currentQuestion] === -1}
                  className="flex-1 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                   Next <ChevronRight size={16} />
                </button>
             ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={submitting || answers.includes(-1)}
                  className="flex-1 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                   {submitting ? 'Submitting...' : 'Finish'} <Send size={16} />
                </button>
             )}
          </footer>
       </div>
    </div>
  );
}
