'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import ScoreCircle from './ScoreCircle';
import type { AnalysisResult } from '@/lib/types';

interface AnalysisSummaryProps {
  analysis: AnalysisResult;
  jobTitle: string;
  companyName: string;
}

const verdictColors: Record<string, string> = {
  'Strong Match': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Good Match': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Partial Match': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'Weak Match': 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function AnalysisSummary({ analysis, jobTitle, companyName }: AnalysisSummaryProps) {
  return (
    <div className="space-y-8">
      {/* Header + Score */}
      <div className="flex flex-col items-center text-center gap-4">
        <h2 className="text-2xl font-bold text-white">
          {jobTitle} at {companyName}
        </h2>
        <ScoreCircle score={analysis.matchScore} size="lg" label="Match Score" />
        <span
          className={`text-sm px-4 py-1.5 rounded-full border font-semibold ${verdictColors[analysis.verdict] || verdictColors['Partial Match']}`}
        >
          {analysis.verdict}
        </span>
        <p className="text-slate-400 max-w-2xl leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Strengths & Gaps — 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3">
            Strengths
          </h3>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Gaps */}
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">
            Gaps
          </h3>
          <ul className="space-y-2">
            {analysis.gaps.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
          Keywords
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-green-400 font-medium mb-2 uppercase tracking-wider">
              Matched
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.matched.map((kw, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-full bg-green-500/15 text-green-300 border border-green-500/25"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-red-400 font-medium mb-2 uppercase tracking-wider">
              Missing
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.missing.map((kw, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/25"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Improvement Suggestions
          </h3>
          <div className="space-y-4">
            {analysis.suggestions.map((s, i) => (
              <div
                key={i}
                className="bg-slate-800/50 border border-white/10 rounded-xl p-5"
              >
                <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                  {s.type}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <p className="text-xs text-red-400 font-medium mb-1">Original</p>
                    <p className="text-sm text-slate-400">{s.original}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                    <p className="text-xs text-green-400 font-medium mb-1">Improved</p>
                    <p className="text-sm text-slate-300">{s.improved}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
