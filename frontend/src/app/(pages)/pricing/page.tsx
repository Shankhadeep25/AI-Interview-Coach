'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight, Zap, Crown, Loader2 } from 'lucide-react';
import { auth } from '@/lib/api';
import type { User } from '@/lib/types';
import PayButton from '@/components/PayButton';

const features = {
  free: [
    '5 analysis sessions per month',
    'Resume-JD match scoring',
    'AI-generated interview questions',
    'Basic answer evaluation',
    'Cover letter generation',
    'Community support',
  ],
  pro: [
    'Unlimited analysis sessions',
    'Resume-JD match scoring',
    'AI-generated interview questions',
    'Detailed answer evaluation with model answers',
    'Priority cover letter generation',
    'Session history & analytics dashboard',
    'Priority email support',
    'Early access to new features',
  ],
};

export default function PricingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in to show the right CTA
  useEffect(() => {
    auth
      .me()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Re-fetch user after successful payment to reflect plan change
  const handlePaymentSuccess = () => {
    auth
      .me()
      .then((res) => setUser(res.data))
      .catch(() => {});
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Start free and upgrade when you&apos;re ready. No hidden fees, no
            surprises.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
      </section>

      {/* Plans */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ── Free Plan ──────────────────────────────────────────── */}
            <div className="relative bg-slate-900/50 border border-white/10 rounded-2xl p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-400 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Free</h2>
              </div>
              <div className="mb-2">
                <span className="text-4xl font-extrabold text-white">₹0</span>
                <span className="text-slate-400 text-sm ml-1">forever</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Get started with essential interview prep tools at no cost.
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {features.free.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* ── Pro Plan ───────────────────────────────────────────── */}
            <div className="relative bg-slate-900/50 border border-indigo-500/40 rounded-2xl p-8 flex flex-col ring-2 ring-indigo-500/50 shadow-xl shadow-indigo-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-semibold uppercase tracking-wider">
                Most Popular
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Pro</h2>
              </div>
              <div className="mb-2">
                <span className="text-4xl font-extrabold text-white">₹499</span>
                <span className="text-slate-400 text-sm ml-1">/month</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Unlimited access for serious job seekers who want every edge.
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {features.pro.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Show PayButton for logged-in users, register link for guests */}
              {user ? (
                <PayButton
                  userName={user.name}
                  userEmail={user.email}
                  userPlan={user.plan}
                  onSuccess={handlePaymentSuccess}
                />
              ) : (
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                >
                  Upgrade to Pro
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* FAQ note */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 text-sm">
            All prices are in INR and inclusive of applicable taxes. Plans renew
            monthly. Cancel anytime from your dashboard.
          </p>
        </div>
      </section>
    </div>
  );
}
