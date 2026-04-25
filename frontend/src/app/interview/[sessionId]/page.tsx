'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { analyze, interview } from '@/lib/api';
import QuestionCard from '@/components/QuestionCard';
import EvaluationCard from '@/components/EvaluationCard';
import ScoreCircle from '@/components/ScoreCircle';
import type { Question, EvaluationResult, Session } from '@/lib/types';
import toast from 'react-hot-toast';
import { Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { AxiosError } from 'axios';

export default function InterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluations, setEvaluations] = useState<Record<string, EvaluationResult>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [completionData, setCompletionData] = useState<{ averageScore: number; totalQuestions: number; resultsCount: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await analyze.getSession(sessionId);
        const s: Session = res.data;
        setSession(s);

        if (s.questions && s.questions.length > 0) {
          setQuestions(s.questions);
          // Resume from where user left off
          const answeredCount = s.results?.length || 0;
          setCurrentIndex(Math.min(answeredCount, s.questions.length - 1));
        }

        if (s.status === 'completed') {
          setIsComplete(true);
          setCompletionData({
            averageScore: s.averageScore,
            totalQuestions: s.questions?.length || 0,
            resultsCount: s.results?.length || 0,
          });
        }
      } catch {
        toast.error('Failed to load session');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId, router]);

  const currentQuestion = questions[currentIndex];
  const currentEvaluation = currentQuestion ? evaluations[currentQuestion.id] : null;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !answer.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await interview.evaluate({
        sessionId,
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        type: currentQuestion.type,
        userAnswer: answer,
        idealAnswerPoints: currentQuestion.idealAnswerPoints,
      });
      setEvaluations((prev) => ({ ...prev, [currentQuestion.id]: res.data }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : 'Evaluation failed';
      toast.error(msg || 'Evaluation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setAnswer('');
    }
  };

  const handleComplete = async () => {
    try {
      const res = await interview.complete(sessionId);
      setCompletionData(res.data);
      setIsComplete(true);
      toast.success('Interview session completed!');
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : 'Failed to complete session';
      toast.error(msg || 'Failed to complete session');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  // Completion Screen
  if (isComplete && completionData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-2">Session Complete!</h1>
        <p className="text-slate-400 mb-8">Here&apos;s how you performed</p>

        <div className="flex justify-center mb-8">
          <ScoreCircle score={Math.round(completionData.averageScore * 10)} size="lg" label="Average Score" />
        </div>

        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 mb-8 text-left">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Score Breakdown</h3>
          {session?.results?.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-sm text-slate-300 truncate mr-4 flex-1">Q{i + 1}: {r.question}</span>
              <span className={`text-sm font-bold ${r.score >= 7 ? 'text-green-400' : r.score >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                {r.score}/10
              </span>
            </div>
          ))}
        </div>

        <button onClick={() => router.push('/dashboard')}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <QuestionCard question={currentQuestion} questionNumber={currentIndex + 1} total={questions.length} />

      {/* Answer area */}
      {!currentEvaluation && (
        <div className="mt-6 space-y-4 animate-fadeIn">
          <textarea
            rows={6}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here... (aim for at least 100 characters)"
            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs ${answer.length >= 100 ? 'text-green-400' : 'text-slate-500'}`}>
              {answer.length} characters
            </span>
            <button onClick={handleSubmitAnswer} disabled={isSubmitting || !answer.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center gap-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</> : 'Submit Answer'}
            </button>
          </div>
        </div>
      )}

      {/* Evaluation */}
      {currentEvaluation && (
        <div className="mt-6 space-y-4 animate-fadeIn">
          <EvaluationCard evaluation={currentEvaluation} />
          <button onClick={handleNext}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2">
            {isLastQuestion ? 'Complete Session' : <><span>Next Question</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      )}
    </div>
  );
}
