import { Brain, Target, Users, Shield, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us — AI Interview Coach',
  description:
    'Learn about AI Interview Coach — our mission to democratize interview preparation with AI-powered tools that help every candidate succeed.',
};

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description:
      'We believe everyone deserves access to high-quality interview preparation, regardless of background or budget.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Sparkles,
    title: 'AI-First Approach',
    description:
      'Powered by Google Gemini AI, we deliver personalized coaching that adapts to your unique profile and target role.',
    gradient: 'from-indigo-500 to-violet-500',
  },
  {
    icon: Users,
    title: 'Candidate-Centric',
    description:
      'Every feature is designed with the candidate in mind — actionable feedback, real practice, and measurable progress.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Shield,
    title: 'Privacy & Trust',
    description:
      'Your resume and interview data are encrypted and never shared. We respect your privacy at every step.',
    gradient: 'from-green-500 to-emerald-500',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            About AI Interview Coach
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            We&apos;re on a mission to level the playing field in job interviews
            by giving every candidate access to personalized, AI-powered
            coaching.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            Why We Built This
          </h2>
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>
              Job interviews are one of the most stressful experiences in a
              professional&apos;s life. Yet, access to quality coaching and mock
              interviews has traditionally been expensive and limited to those
              who can afford private career consultants.
            </p>
            <p>
              <strong className="text-white">AI Interview Coach</strong> was
              born from a simple idea: what if cutting-edge AI could provide
              the same level of personalized interview preparation that elite
              coaches offer — but made accessible to everyone?
            </p>
            <p>
              Powered by Google&apos;s Gemini AI, our platform analyzes your
              resume against job descriptions, generates tailored interview
              questions across technical, behavioral, and HR categories,
              evaluates your answers in real time, and even crafts professional
              cover letters — all in one seamless experience.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Our Values</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            The principles that guide everything we build.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${v.gradient} flex items-center justify-center mb-4`}
              >
                <v.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {v.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Product Description */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            What is AI Interview Coach?
          </h2>
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>
              <strong className="text-white">AI Interview Coach</strong> is a
              web-based SaaS platform that uses advanced artificial intelligence
              (Google Gemini) to help job seekers prepare for interviews. The
              service provides:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>
                  <strong className="text-white">Resume-JD Analysis:</strong>{' '}
                  Upload your resume and job description to receive a match
                  score, strengths, gaps, and keyword analysis.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>
                  <strong className="text-white">
                    AI Interview Questions:
                  </strong>{' '}
                  Practice with personalized questions tailored to the role
                  across technical, behavioral, and HR categories.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>
                  <strong className="text-white">Answer Evaluation:</strong>{' '}
                  Get instant scoring and detailed feedback on your responses
                  with a model answer for comparison.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>
                  <strong className="text-white">
                    Cover Letter Generation:
                  </strong>{' '}
                  Generate professional cover letters customized to the role and
                  company.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
