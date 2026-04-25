'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import type { EvaluationResult } from '@/lib/types';

interface EvaluationCardProps {
  evaluation: EvaluationResult;
}

export default function EvaluationCard({ evaluation }: EvaluationCardProps) {
  const [showBetterAnswer, setShowBetterAnswer] = useState(false);

  const scoreColor =
    evaluation.score >= 7
      ? 'text-green-400 border-green-500/30 bg-green-500/10'
      : evaluation.score >= 4
        ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
        : 'text-red-400 border-red-500/30 bg-red-500/10';

  return (
    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm space-y-5 animate-fadeIn">
      {/* Score Badge */}
      <div className="flex items-center gap-4">
        <div
          className={`text-3xl font-bold px-4 py-2 rounded-xl border ${scoreColor}`}
        >
          {evaluation.score}<span className="text-lg font-normal opacity-60">/10</span>
        </div>
      </div>

      {/* Feedback */}
      <p className="text-slate-300 leading-relaxed">{evaluation.feedback}</p>

      {/* Strengths */}
      {evaluation.strengths && evaluation.strengths.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">
            Strengths
          </h4>
          <ul className="space-y-1.5">
            {evaluation.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {evaluation.improvements && evaluation.improvements.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-2">
            Areas to Improve
          </h4>
          <ul className="space-y-1.5">
            {evaluation.improvements.map((imp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                {imp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Model Answer Toggle */}
      {evaluation.betterAnswer && (
        <div>
          <button
            onClick={() => setShowBetterAnswer(!showBetterAnswer)}
            className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {showBetterAnswer ? (
              <><EyeOff className="w-4 h-4" /> Hide Model Answer</>
            ) : (
              <><Eye className="w-4 h-4" /> See Model Answer</>
            )}
          </button>
          {showBetterAnswer && (
            <div className="mt-3 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {evaluation.betterAnswer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
