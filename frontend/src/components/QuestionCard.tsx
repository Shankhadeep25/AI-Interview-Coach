'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Question } from '@/lib/types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  total: number;
}

const typeBadgeColors: Record<string, string> = {
  Technical: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Behavioral: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Situational: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  HR: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const difficultyColors: Record<string, string> = {
  Easy: 'bg-green-500/20 text-green-300 border-green-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Hard: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function QuestionCard({ question, questionNumber, total }: QuestionCardProps) {
  const [showHints, setShowHints] = useState(false);

  return (
    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400 font-medium">
          Question {questionNumber} of {total}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full border font-medium ${typeBadgeColors[question.type] || typeBadgeColors.HR}`}
          >
            {question.type}
          </span>
          <span
            className={`text-xs px-2.5 py-1 rounded-full border font-medium ${difficultyColors[question.difficulty] || difficultyColors.Medium}`}
          >
            {question.difficulty}
          </span>
        </div>
      </div>

      {/* Category */}
      <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-2">
        {question.category}
      </p>

      {/* Question */}
      <p className="text-lg text-white font-medium leading-relaxed">
        {question.question}
      </p>

      {/* Hints toggle */}
      {question.hints && question.hints.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {showHints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showHints ? 'Hide Hints' : 'Show Hints'}
          </button>
          {showHints && (
            <ul className="mt-3 space-y-1.5 pl-4">
              {question.hints.map((hint, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-300 before:content-['💡'] before:mr-2"
                >
                  {hint}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
