'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { analyze, interview, upload } from '@/lib/api';
import AnalysisSummary from '@/components/AnalysisSummary';
import type { AnalysisResult } from '@/lib/types';
import toast from 'react-hot-toast';
import { Loader2, Send, MessageSquare, FileEdit, Copy, X, UploadCloud } from 'lucide-react';
import { AxiosError } from 'axios';

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>}>
      <AnalyzeContent />
    </Suspense>
  );
}

function AnalyzeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get('session');

  const [step, setStep] = useState<1 | 2 | 3>(sessionParam ? 3 : 1);
  const [form, setForm] = useState({
    jobTitle: '', companyName: '', jobDescription: '', resumeText: '',
  });
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(sessionParam);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Cover letter modal
  const [coverLetterModal, setCoverLetterModal] = useState(false);
  const [coverLetterData, setCoverLetterData] = useState<{ subject: string; coverLetter: string } | null>(null);
  const [clLoading, setClLoading] = useState(false);
  const [interviewLoading, setInterviewLoading] = useState(false);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);

  // Load existing session if ?session= param
  useEffect(() => {
    if (sessionParam) {
      analyze.getSession(sessionParam).then((res) => {
        const s = res.data;
        setAnalysisResult(s.analysisResult);
        setSessionId(s._id);
        setJobTitle(s.jobTitle);
        setCompanyName(s.companyName);
        setStep(2);
      }).catch(() => {
        toast.error('Session not found');
        setStep(1);
      });
    }
  }, [sessionParam]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStep(3);
    try {
      const res = await analyze.run(form);
      setAnalysisResult(res.data.analysisResult);
      setSessionId(res.data._id);
      setJobTitle(form.jobTitle);
      setCompanyName(form.companyName);
      setStep(2);
      toast.success('Analysis complete!');
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : 'Analysis failed';
      toast.error(msg || 'Analysis failed');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    if (!sessionId) return;
    setInterviewLoading(true);
    try {
      await interview.generate(sessionId);
      router.push(`/interview/${sessionId}`);
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : 'Failed to generate questions';
      toast.error(msg || 'Failed to generate questions');
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleCoverLetter = async () => {
    if (!sessionId) return;
    setClLoading(true);
    try {
      const res = await analyze.coverLetter(sessionId);
      setCoverLetterData(res.data);
      setCoverLetterModal(true);
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : 'Failed to generate cover letter';
      toast.error(msg || 'Failed to generate cover letter');
    } finally {
      setClLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx') && !file.name.endsWith('.txt')) {
      toast.error('Only PDF, DOCX, and TXT files are supported.');
      return;
    }

    await extractResumeText(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await extractResumeText(file);
  };

  const extractResumeText = async (file: File) => {
    setExtracting(true);
    try {
      const res = await upload.extractText(file);
      setForm((prev) => ({ ...prev, resumeText: res.data.text }));
      toast.success('Resume text extracted successfully!');
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : 'Failed to extract text';
      toast.error(msg || 'Failed to extract text');
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Step 1: Input Form */}
      {step === 1 && (
        <div className="animate-fadeIn">
          <h1 className="text-3xl font-bold text-white mb-2">Analyze Your Resume</h1>
          <p className="text-slate-400 mb-8">Paste the job description and your resume to get an AI-powered analysis.</p>

          <form onSubmit={handleAnalyze} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Title</label>
                <input type="text" required value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="e.g. Full Stack Developer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Company Name</label>
                <input type="text" required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="e.g. Google" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Description</label>
              <textarea required rows={8} value={form.jobDescription} onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none" placeholder="Paste the full job description here..." />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">Resume Content</label>
              
              {/* Drag and drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 p-6 flex flex-col items-center justify-center gap-3 text-center cursor-pointer ${
                  isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/20 hover:bg-slate-800/40'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <div className={`p-3 rounded-full ${isDragging ? 'bg-indigo-500/20' : 'bg-slate-800'}`}>
                  {extracting ? (
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  ) : (
                    <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-indigo-400' : 'text-slate-400'}`} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {extracting ? 'Extracting text...' : 'Click or drag resume file to extract text'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, TXT (Max 5MB)</p>
                </div>
              </div>

              {/* Text area fallback */}
              <div className="relative">
                <textarea required rows={8} value={form.resumeText} onChange={(e) => setForm({ ...form, resumeText: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none font-mono text-sm" placeholder="Paste your resume here, or drop a file above to auto-extract..." />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Send className="w-5 h-5" /> Analyze My Resume</>}
            </button>
          </form>
        </div>
      )}

      {/* Step 3: Loading */}
      {step === 3 && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
          <p className="text-slate-400 text-lg">AI is analyzing your resume...</p>
        </div>
      )}

      {/* Step 2: Results */}
      {step === 2 && analysisResult && (
        <div className="animate-fadeIn">
          <AnalysisSummary analysis={analysisResult} jobTitle={jobTitle} companyName={companyName} />

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button onClick={handleStartInterview} disabled={interviewLoading}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {interviewLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><MessageSquare className="w-5 h-5" /> Start Interview Practice</>}
            </button>
            <button onClick={handleCoverLetter} disabled={clLoading}
              className="flex-1 py-3.5 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {clLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><FileEdit className="w-5 h-5" /> Generate Cover Letter</>}
            </button>
          </div>
        </div>
      )}

      {/* Cover Letter Modal */}
      {coverLetterModal && coverLetterData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Cover Letter</h3>
              <button onClick={() => setCoverLetterModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-indigo-400 font-medium mb-4">Subject: {coverLetterData.subject}</p>
            <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5 mb-4">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{coverLetterData.coverLetter}</p>
            </div>
            <button onClick={() => copyToClipboard(coverLetterData.coverLetter)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors text-sm font-medium">
              <Copy className="w-4 h-4" /> Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
