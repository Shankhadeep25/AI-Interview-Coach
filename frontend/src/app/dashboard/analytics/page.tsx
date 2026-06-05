'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { analyze } from '@/lib/api';
import { Loader2, ArrowLeft, TrendingUp, Target, AlertCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';

interface ProgressData {
  date: string;
  score: number;
  jobTitle: string;
}

interface KeywordData {
  subject: string;
  count: number;
  fullMark?: number;
}

interface AnalyticsData {
  progress: ProgressData[];
  strengths: KeywordData[];
  improvements: KeywordData[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyze.getAnalytics();
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!data || data.progress.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Not Enough Data Yet</h2>
        <p className="text-slate-400 mb-8">
          Complete at least one interview session to see your analytics dashboard.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  // Format strings for chart display
  const formatSubject = (str: string) => {
    if (str.length > 15) return str.slice(0, 15) + '...';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="p-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Performance Analytics</h1>
          <p className="text-slate-400 mt-1">Track your growth across all interview sessions</p>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-indigo-500/10">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Interview Score Progress</h2>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.progress} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#818cf8' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                formatter={(value: any, name: any, props: any) => [`${value}%`, props.payload.jobTitle]}
              />
              <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart: Strengths */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-green-500/10">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Skill Footprint</h2>
              <p className="text-xs text-slate-400">Your most frequently demonstrated strengths</p>
            </div>
          </div>
          {data.strengths.length > 0 ? (
            <div className="h-[300px] w-full flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.strengths.map(s => ({ ...s, subject: formatSubject(s.subject) }))}>
                  <PolarGrid stroke="#ffffff15" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#64748b' }} stroke="#ffffff15" />
                  <Radar name="Frequency" dataKey="count" stroke="#4ade80" fill="#4ade80" fillOpacity={0.3} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
              Not enough data to map skills.
            </div>
          )}
        </div>

        {/* Top Improvements */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-orange-500/10">
              <AlertCircle className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Areas to Improve</h2>
              <p className="text-xs text-slate-400">Skills you frequently miss in interviews</p>
            </div>
          </div>
          {data.improvements.length > 0 ? (
            <div className="space-y-4">
              {data.improvements.map((imp, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5">
                  <span className="text-slate-300 font-medium capitalize">{imp.subject}</span>
                  <span className="text-xs font-semibold text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full">
                    Missed {imp.count} {imp.count === 1 ? 'time' : 'times'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center pb-20 text-slate-500 text-sm">
              No recurring missing skills found! Keep it up.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
