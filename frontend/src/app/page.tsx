'use client';

import Link from 'next/link';
import {
  FileText,
  MessageSquare,
  Star,
  FileEdit,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Resume Analyzer',
    description:
      'Get an AI-powered match score and detailed feedback on how your resume aligns with the job description.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MessageSquare,
    title: 'AI Interview Questions',
    description:
      'Practice with personalized questions tailored to the specific role, covering technical, behavioral, and HR topics.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Star,
    title: 'Answer Evaluator',
    description:
      'Receive instant scoring and detailed feedback on your answers with a model answer for comparison.',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    icon: FileEdit,
    title: 'Cover Letter Generator',
    description:
      'Generate a professional cover letter customized to the role and company in seconds.',
    color: 'from-green-500 to-emerald-500',
  },
];

const steps = [
  {
    icon: Target,
    step: '01',
    title: 'Paste JD + Resume',
    description: 'Enter the job description and your resume text to get started.',
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'Get AI Analysis',
    description: 'Receive a detailed match score, strengths, gaps, and keyword analysis.',
  },
  {
    icon: TrendingUp,
    step: '03',
    title: 'Practice & Improve',
    description: 'Answer tailored interview questions and get real-time AI feedback.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ─── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-44">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Powered by Google Gemini AI
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                Ace Every Interview
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                with AI
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Analyze your resume, practice with personalized interview questions, and get instant AI feedback — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-lg hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 animate-pulseGlow flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="px-8 py-3.5 rounded-xl border border-white/10 text-slate-300 font-medium hover:bg-white/5 transition-all"
              >
                See Features
              </a>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
      </section>

      {/* ─── Features ──────────────────────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need to Prepare
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Four powerful tools working together to maximize your interview success.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:bg-slate-800/50 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Three simple steps to transform your interview preparation.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="relative text-center">
              <div className="text-6xl font-black text-indigo-500/10 mb-4">
                {s.step}
              </div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <s.icon className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.1),transparent_60%)]" />
          <div className="relative px-8 py-16 md:py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-indigo-100 mb-8 max-w-lg mx-auto">
              Join thousands of candidates who improved their interview performance with AI-powered coaching.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
            >
              Start Free — No Credit Card
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} AI Interview Coach. Built with ❤️ and Gemini AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
