'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, analyze } from '@/lib/api';
import type { User, SessionSummary } from '@/lib/types';
import { Plus, Eye, BarChart3, Award, Zap, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, sessionsRes] = await Promise.all([
          auth.me(),
          analyze.getSessions(),
        ]);
        setUser(userRes.data);
        setSessions(sessionsRes.data);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const avgScore =
    completedSessions.length > 0
      ? Math.round(
          (completedSessions.reduce((sum, s) => sum + (s.averageScore || 0), 0) /
            completedSessions.length) * 10
        ) / 10
      : 0;

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-500/15 text-green-300 border-green-500/25';
    if (score >= 40) return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25';
    return 'bg-red-500/15 text-red-300 border-red-500/25';
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      analyzed: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
      in_progress: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
      completed: 'bg-green-500/15 text-green-300 border-green-500/25',
    };
    return map[status] || map.analyzed;
  };

  const handleView = (session: SessionSummary) => {
    if (session.status === 'analyzed') {
      router.push(`/analyze?session=${session._id}`);
    } else {
      router.push(`/interview/${session._id}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {user.name}</h1>
          <p className="text-slate-400 mt-1">Track your interview preparation progress</p>
        </div>
        <Link href="/analyze" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
          <Plus className="w-5 h-5" /> New Session
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10"><BarChart3 className="w-6 h-6 text-indigo-400" /></div>
          <div>
            <p className="text-sm text-slate-400">Sessions Used</p>
            <p className="text-2xl font-bold text-white">{user.sessionsUsed}{user.plan === 'free' && <span className="text-sm font-normal text-slate-500"> / 5</span>}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10"><Award className="w-6 h-6 text-green-400" /></div>
          <div>
            <p className="text-sm text-slate-400">Average Score</p>
            <p className="text-2xl font-bold text-white">{avgScore > 0 ? `${avgScore}/10` : '—'}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-violet-500/10"><Zap className="w-6 h-6 text-violet-400" /></div>
          <div>
            <p className="text-sm text-slate-400">Plan</p>
            <p className="text-2xl font-bold text-white capitalize">{user.plan}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Your Sessions</h2>
        </div>
        {sessions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-slate-400 mb-4">No sessions yet. Start your first analysis!</p>
            <Link href="/analyze" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold">
              <Plus className="w-5 h-5" /> New Session
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Match</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sessions.map((s) => (
                  <tr key={s._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm text-white font-medium">{s.jobTitle}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{s.companyName}</td>
                    <td className="px-6 py-4"><span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getScoreBg(s.matchScore)}`}>{s.matchScore}%</span></td>
                    <td className="px-6 py-4"><span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${statusBadge(s.status)}`}>{s.status.replace('_', ' ')}</span></td>
                    <td className="px-6 py-4 text-sm text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><button onClick={() => handleView(s)} className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"><Eye className="w-4 h-4" />View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
