'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { analyze, interview } from '@/lib/api';
import type { Session } from '@/lib/types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import {
  Loader2,
  Send,
  Bot,
  User,
  CheckCircle,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function InterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const MAX_QUESTIONS = 10;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Load session on mount ────────────────────────────────────────────────
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await analyze.getSession(sessionId);
        const s: Session = res.data;
        setSession(s);

        // If this session already has chat history, resume it
        if (s.status === 'chat_in_progress' || s.status === 'completed') {
          await handleResumeOrStart(true);
        }
        if (s.status === 'completed') setIsComplete(true);
      } catch {
        toast.error('Failed to load session');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ── Auto-scroll to bottom ────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Scroll visibility ────────────────────────────────────────────────────
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollButton(distFromBottom > 120);
  };

  // ── Auto-resize textarea ─────────────────────────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  // ── Start or resume the chat ─────────────────────────────────────────────
  const handleResumeOrStart = async (isResume = false) => {
    setIsStarting(true);
    try {
      const res = await interview.chatStart(sessionId);
      const { reply, isResumed } = res.data;

      if (isResumed || isResume) {
        // Don't duplicate the opening message if resuming
        setMessages([{ role: 'model', text: reply, timestamp: new Date() }]);
      } else {
        setMessages([{ role: 'model', text: reply, timestamp: new Date() }]);
      }
      setChatStarted(true);
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : 'Failed to start interview';
      toast.error(msg || 'Failed to start interview');
    } finally {
      setIsStarting(false);
    }
  };

  // ── Send a message ───────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setInput('');
    setIsSending(true);

    // Optimistically add user message
    const userMsg: Message = { role: 'user', text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await interview.chatMessage(sessionId, text);
      const { reply, isComplete: done, questionCount: qCount, maxQuestions: qMax } = res.data;

      setMessages((prev) => [
        ...prev,
        { role: 'model', text: reply, timestamp: new Date() },
      ]);

      if (qCount) setQuestionCount(qCount);
      if (qMax) { /* already constant */ }

      if (done) {
        setIsComplete(true);
        toast.success('Interview complete! Check your final assessment above.');
      }
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : 'Failed to send message';
      toast.error(msg || 'Failed to send message');
      // Remove the optimistic user message on failure
      setMessages((prev) => prev.filter((m) => m !== userMsg));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Loading screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  // ── Pre-start screen ─────────────────────────────────────────────────────
  if (!chatStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center animate-fadeIn">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 mb-6">
            <Bot className="w-10 h-10 text-indigo-400" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">AI Interview</h1>
          <p className="text-slate-400 mb-2 text-lg font-medium">
            {session?.jobTitle} at {session?.companyName}
          </p>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Your AI interviewer will ask 5–7 questions tailored to your resume and the job description.
            After each answer, you&apos;ll receive instant feedback and a score.
            Speak naturally — there are no wrong ways to answer.
          </p>

          {/* What to expect */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 mb-8 text-left space-y-3">
            {[
              { icon: '🎯', text: 'Questions tailored to your specific resume and the JD' },
              { icon: '💬', text: 'Conversational format — the AI remembers everything you say' },
              { icon: '⭐', text: 'Instant scoring and feedback after every answer' },
              { icon: '📋', text: 'Full assessment with final score at the end' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <span className="text-lg">{icon}</span>
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => handleResumeOrStart(false)}
            disabled={isStarting}
            id="start-interview-btn"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-3"
          >
            {isStarting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Starting Interview...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Begin Interview
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Chat UI ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">

      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/10 bg-slate-950/80 backdrop-blur px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AI Interviewer — Alex</p>
              <p className="text-xs text-slate-400">{session?.jobTitle} · {session?.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Live question progress */}
            {!isComplete && questionCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Q{questionCount} / {MAX_QUESTIONS}</span>
                <div className="w-20 h-1.5 rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${Math.min((questionCount / MAX_QUESTIONS) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {isComplete && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium text-green-400">Interview Complete</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 animate-fadeIn ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                msg.role === 'model'
                  ? 'bg-gradient-to-br from-indigo-500 to-violet-500'
                  : 'bg-slate-700'
              }`}>
                {msg.role === 'model'
                  ? <Bot className="w-4 h-4 text-white" />
                  : <User className="w-4 h-4 text-slate-300" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'model'
                  ? 'bg-slate-800/80 border border-white/10 text-slate-200 rounded-tl-sm'
                  : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator while waiting for AI */}
          {isSending && (
            <div className="flex items-start gap-3 animate-fadeIn">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800/80 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-28 right-6 w-9 h-9 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center hover:bg-slate-600 transition-colors shadow-lg"
        >
          <ChevronDown className="w-4 h-4 text-slate-300" />
        </button>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-white/10 bg-slate-950/80 backdrop-blur px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {isComplete ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-slate-400">Your interview is complete. Scroll up to review your assessment.</p>
              <button
                onClick={() => router.push('/dashboard')}
                id="back-to-dashboard-btn"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
                rows={1}
                placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
                id="chat-input"
                className="flex-1 resize-none px-4 py-3 rounded-2xl bg-slate-800/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm leading-relaxed disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isSending || !input.trim()}
                id="send-message-btn"
                className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSending
                  ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                  : <Send className="w-4 h-4 text-white" />}
              </button>
            </div>
          )}
          {!isComplete && (
            <p className="text-xs text-slate-600 mt-2 text-center">
              The AI remembers your full conversation — answer naturally
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
