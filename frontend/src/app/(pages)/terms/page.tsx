import { FileText } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions — AI Interview Coach',
  description: 'Read the Terms and Conditions governing your use of AI Interview Coach.',
};

const sections = [
  { title: '1. Acceptance of Terms', content: `By accessing or using AI Interview Coach ("the Service"), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the Service.` },
  { title: '2. Description of Service', content: `AI Interview Coach is a web-based SaaS platform that uses Google Gemini AI to provide resume analysis, personalized interview question generation, answer evaluation, and cover letter generation. The Service is available through free and paid subscription plans.` },
  { title: '3. User Accounts', content: `You must register for an account to access the Service. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. You must provide accurate, current information and be at least 16 years of age.` },
  { title: '4. Subscription & Payments', content: `Free plan: Limited to 5 sessions per month at no charge. Pro plan: ₹499/month for unlimited sessions and premium features. Payments are processed via Razorpay. Subscriptions auto-renew monthly unless cancelled. Prices are in INR and inclusive of applicable taxes.` },
  { title: '5. Acceptable Use', content: `You agree not to: use the Service for unlawful purposes; upload malicious content; attempt to reverse-engineer the Service; share your account credentials; scrape or automated-access the Service; or impersonate others.` },
  { title: '6. Intellectual Property', content: `All content, design, and technology of the Service are owned by AI Interview Coach. You retain ownership of your resume and personal data. AI-generated outputs (analysis, questions, cover letters) are provided for your personal use only.` },
  { title: '7. AI-Generated Content Disclaimer', content: `The Service uses AI to generate analysis and feedback. While we strive for accuracy, AI outputs may contain errors or inaccuracies. The Service does not guarantee job placement or interview success. Use AI-generated content as guidance, not definitive advice.` },
  { title: '8. Limitation of Liability', content: `To the maximum extent permitted by law, AI Interview Coach shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the amount paid by you in the preceding 12 months.` },
  { title: '9. Termination', content: `We reserve the right to suspend or terminate your account for violation of these Terms. You may delete your account at any time by contacting support@aiinterviewcoach.in.` },
  { title: '10. Governing Law', content: `These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Kolkata, West Bengal, India.` },
  { title: '11. Changes to Terms', content: `We may update these Terms periodically. Continued use of the Service after changes constitutes acceptance. We will notify users of material changes via email.` },
  { title: '12. Contact', content: `For questions regarding these Terms, email us at support@aiinterviewcoach.in.` },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
            <FileText className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">Terms &amp; Conditions</h1>
          <p className="text-sm text-slate-400">Last updated: April 27, 2026</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 space-y-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-xl font-bold text-white mb-3">{s.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
