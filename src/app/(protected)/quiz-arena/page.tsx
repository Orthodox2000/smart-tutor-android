'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Clock, CheckCircle, ArrowRight, Sparkles, Send } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function QuizArenaPage() {
  const { profile } = useAuth();
  const [step, setStep] = useState<'config' | 'quiz' | 'result'>('config');
  const [config, setConfig] = useState({ level: 'Intermediate', exam: '', subject: 'Mathematics', difficulty: 'Medium', count: 10 });
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quiz-arena/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        setAnswers(new Array((data.questions || []).length).fill(-1));
        setCurrentQ(0);
        setTimeLeft((data.questions || []).length * 60);
        setStep('quiz');
      }
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (step !== 'quiz' || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const selectAnswer = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
    else setStep('result');
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const correctCount = questions.filter((q, i) => answers[i] === q.correctAnswer).length;
  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  if (step === 'config') {
    return (
      <div className="space-y-6 pb-20">
        <header>
          <p className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1">AI Powered</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quiz Arena</h1>
        </header>

        <div className="bg-slate-900 p-6 rounded-2xl text-white">
          <Sparkles size={24} className="text-academy-orange-400 mb-3" />
          <h3 className="font-bold text-lg mb-1">AI-Generated Quizzes</h3>
          <p className="text-xs text-slate-400">Questions are generated in real-time based on your selection.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Subject</label>
            <select value={config.subject} onChange={e => setConfig({...config, subject: e.target.value})} className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-academy-orange-600">
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Difficulty</label>
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setConfig({...config, difficulty: d})} className={`flex-1 rounded-xl py-3 text-xs font-bold transition-all ${config.difficulty === d ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Level</label>
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              {LEVELS.map(l => (
                <button key={l} onClick={() => setConfig({...config, level: l})} className={`flex-1 rounded-xl py-3 text-[10px] font-bold transition-all ${config.level === l ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Number of Questions</label>
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              {[5, 10, 15, 20].map(n => (
                <button key={n} onClick={() => setConfig({...config, count: n})} className={`flex-1 rounded-xl py-3 text-xs font-bold transition-all ${config.count === n ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <input placeholder="Exam focus (optional, e.g. JEE, NEET)" value={config.exam} onChange={e => setConfig({...config, exam: e.target.value})} className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-academy-orange-600" />

          <button 
            onClick={startQuiz} 
            disabled={loading}
            className="w-full bg-academy-orange-600 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-academy-orange-100"
          >
            {loading ? 'Generating...' : 'Start Quiz'} <Sparkles size={18} />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-50 flex justify-center p-4">
        <div className="w-full max-w-[430px] flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-academy-orange-100 text-academy-orange-600 rounded-2xl flex items-center justify-center mb-6">
            <Trophy size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Quiz Complete!</h2>
          <p className="text-slate-500 mb-8 font-medium text-sm">{config.subject} - {config.difficulty}</p>
          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Score</p>
              <p className="text-3xl font-black text-slate-900">{score}%</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Correct</p>
              <p className="text-3xl font-black text-slate-900">{correctCount}/{questions.length}</p>
            </div>
          </div>
          <button onClick={() => { setStep('config'); setQuestions([]); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm">
            Back to Arena
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="fixed inset-0 z-[200] bg-white flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col h-full bg-slate-50">
        <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{config.subject} Quiz</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Question {currentQ + 1} of {questions.length}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-xs font-black ${timeLeft < 60 ? 'bg-red-50 text-red-600' : 'bg-slate-900 text-white'}`}>
            <Clock size={14} /> {formatTime(timeLeft)}
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm mb-6">
            <p className="text-[15px] font-bold text-slate-800 leading-relaxed">{q?.question}</p>
          </div>
          <div className="space-y-3">
            {q?.options?.map((opt: string, i: number) => (
              <button 
                key={i}
                onClick={() => selectAnswer(i)}
                className={`w-full p-5 rounded-xl text-left text-sm font-bold transition-all flex items-center justify-between border-2 ${
                  answers[currentQ] === i 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                    : 'bg-white border-white text-slate-500 hover:border-slate-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${answers[currentQ] === i ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-400'}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </div>
              </button>
            ))}
          </div>
        </div>

        <footer className="p-6 bg-white border-t border-slate-100 flex gap-3 sticky bottom-0">
          <button onClick={() => currentQ > 0 ? setCurrentQ(currentQ - 1) : setStep('config')} className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm">
            {currentQ === 0 ? 'Quit' : 'Prev'}
          </button>
          <button 
            onClick={nextQuestion}
            disabled={answers[currentQ] === -1}
            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {currentQ === questions.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={18} />
          </button>
        </footer>
      </div>
    </div>
  );
}
