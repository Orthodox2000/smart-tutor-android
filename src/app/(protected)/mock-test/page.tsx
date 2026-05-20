'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PenTool, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Timer,
  AlertCircle,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  FileText,
  User,
  Plus,
  Download
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function MockTestPage() {
  const { profile } = useAuth();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [fullTestData, setFullTestData] = useState<any>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tests');
      const data = await res.json();
      setTests(data);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (testId: string) => {
    const test = tests.find(t => t._id === testId);
    if (test?.fileUrl) {
      window.open(test.fileUrl, '_blank');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/tests?id=${testId}`);
      const data = await res.json();
      setFullTestData(data);
      setActiveTestId(testId);
    } catch (error) {
      console.error('Failed to start test:', error);
    } finally {
      setLoading(false);
    }
  };

  if (activeTestId && fullTestData) {
    return <TestSession test={fullTestData} onExit={() => { setActiveTestId(null); setFullTestData(null); }} />;
  }

  return (
    <div className="space-y-8 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Testing Arena</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tests & Assignments</h1>
        </div>
        {(profile?.role === 'admin' || profile?.role === 'teacher') && (
           <button className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
             <Plus size={20} />
           </button>
        )}
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Assessments...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
             {tests.map((test) => (
               <motion.div 
                 key={test._id}
                 whileHover={{ y: -2 }}
                 className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-6 group"
               >
                  <div className="flex items-start justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                           <FileText size={24} />
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                {test.category}
                              </span>
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400">
                                {test.subject}
                              </span>
                           </div>
                           <h4 className="font-bold text-slate-800 leading-tight">{test.title}</h4>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400">
                           <User size={14} />
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Sent By</p>
                           <p className="text-[10px] font-bold text-slate-700">{test.senderName} ({test.senderRole})</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => startTest(test._id)}
                        className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
                     >
                        {test.fileUrl ? 'View Paper' : 'Start MCQ'} <ArrowRight size={14} />
                     </button>
                  </div>
               </motion.div>
             ))}

             {tests.length === 0 && (
               <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                  <FileText className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No assessments assigned</p>
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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(test.questions.length).fill(-1));
  const [timeLeft, setTimeLeft] = useState((test.duration || 60) * 60);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/mock-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: test._id,
          studentUid: profile?.uid,
          studentName: profile?.displayName || profile?.username,
          answers
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Failed to submit test:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-50 flex justify-center p-4">
        <div className="w-full max-w-[430px] flex flex-col items-center justify-center text-center">
           <div className="w-24 h-24 bg-slate-200 text-slate-600 rounded-[40px] flex items-center justify-center mb-6">
              <Trophy size={48} />
           </div>
           <h2 className="text-2xl font-black text-slate-900 mb-2">Assessment Complete!</h2>
           <p className="text-slate-500 mb-8 font-medium text-sm">You've successfully completed the {test.title}.</p>
           
           <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <div className="bg-white p-6 rounded-[32px] border border-slate-100">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Your Score</p>
                 <p className="text-3xl font-black text-slate-900">{result.score.toFixed(1)}%</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] border border-slate-100">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Correct</p>
                 <p className="text-3xl font-black text-slate-900">{result.correctAnswers}/{result.totalQuestions}</p>
              </div>
           </div>

           <button 
             onClick={onExit}
             className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200"
           >
             Return to Assessments
           </button>
        </div>
      </div>
    );
  }

  const q = test.questions[currentQuestion];

  return (
    <div className="fixed inset-0 z-[200] bg-white flex justify-center">
       <div className="w-full max-w-[430px] flex flex-col h-full bg-slate-50">
          <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
             <div>
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{test.title}</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">In Progress • {test.subject}</p>
             </div>
             <div className={`flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-xs font-black ${timeLeft < 300 ? 'bg-red-50 text-red-600' : 'bg-slate-900 text-white'}`}>
                <Clock size={14} /> {formatTime(timeLeft)}
             </div>
          </header>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
             <div className="space-y-8">
                <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-4 -mt-4"></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 relative z-10">
                     Question {currentQuestion + 1} of {test.questions.length}
                   </p>
                   <p className="text-[15px] font-bold text-slate-800 leading-relaxed relative z-10">
                     {q.question}
                   </p>
                </div>

                <div className="space-y-3">
                   {q.options.map((opt: string, i: number) => (
                     <button 
                       key={i}
                       onClick={() => handleSelect(i)}
                       className={`
                         w-full p-5 rounded-[28px] text-left text-sm font-bold transition-all flex items-center justify-between border-2
                         ${answers[currentQuestion] === i 
                           ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                           : 'bg-white border-white text-slate-500 hover:border-slate-100'}
                       `}
                     >
                        <div className="flex items-center gap-4">
                           <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${
                              answers[currentQuestion] === i ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-400'
                           }`}>
                              {String.fromCharCode(65 + i)}
                           </span>
                           {opt}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                           answers[currentQuestion] === i ? 'bg-white border-white' : 'border-slate-100'
                        }`} />
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <footer className="p-6 bg-white border-t border-slate-100 flex gap-3 sticky bottom-0">
             <button 
               onClick={() => currentQuestion > 0 ? setCurrentQuestion(prev => prev - 1) : onExit()} 
               className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm"
             >
                {currentQuestion === 0 ? 'Quit' : <ChevronLeft size={20} />}
             </button>
             
             {currentQuestion < test.questions.length - 1 ? (
                <button 
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={answers[currentQuestion] === -1}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                   Next Question <ChevronRight size={20} />
                </button>
             ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={submitting || answers.includes(-1)}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                   {submitting ? 'Submitting...' : 'Finish Assessment'} <Send size={18} />
                </button>
             )}
          </footer>
       </div>
    </div>
  );
}
