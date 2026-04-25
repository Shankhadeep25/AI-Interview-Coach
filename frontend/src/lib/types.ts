export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro';
  sessionsUsed: number;
}

export interface AnalysisResult {
  matchScore: number;
  summary: string;
  verdict: 'Strong Match' | 'Good Match' | 'Partial Match' | 'Weak Match';
  strengths: string[];
  gaps: string[];
  suggestions: { type: string; original: string; improved: string }[];
  keywords: { matched: string[]; missing: string[] };
}

export interface Question {
  id: string;
  question: string;
  type: 'Technical' | 'Behavioral' | 'Situational' | 'HR';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  hints: string[];
  idealAnswerPoints: string[];
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  betterAnswer: string;
}

export interface Session {
  _id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  resumeText: string;
  matchScore: number;
  analysisResult: AnalysisResult;
  questions: Question[];
  results: {
    questionId: string;
    question: string;
    type: string;
    userAnswer: string;
    score: number;
    feedback: string;
    betterAnswer: string;
  }[];
  averageScore: number;
  coverLetter: string;
  status: 'analyzed' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface SessionSummary {
  _id: string;
  jobTitle: string;
  companyName: string;
  matchScore: number;
  status: string;
  averageScore: number;
  createdAt: string;
}
