import { Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — AI Interview Coach',
  description: 'Read our Privacy Policy to understand how AI Interview Coach collects, uses, and protects your personal information.',
};

const sections = [
  { title: '1. Information We Collect', content: `We collect: (a) Account Information — name, email, and password; (b) Resume Data — resume text and job descriptions submitted for analysis; (c) Interview Data — your answers to practice questions; (d) Usage Data — session counts and feature usage; (e) Payment Information — billing details processed securely via Razorpay (we never store card numbers).` },
  { title: '2. How We Use Your Information', content: `We use your information to: provide and improve our AI coaching services; analyze resumes and generate personalized feedback via Google Gemini AI; manage your account and subscriptions; send service-related communications; and detect/prevent fraud or security incidents.` },
  { title: '3. Data Sharing & Third Parties', content: `We do not sell your personal data. We share data only with: Google Gemini AI (for resume analysis and question generation — Google's privacy policies apply); Razorpay (payment processing); and our secure cloud hosting providers.` },
  { title: '4. Data Security', content: `We implement industry-standard security measures including encryption in transit (TLS/SSL), hashed passwords (bcrypt), and secure HTTP-only cookies for authentication. While no system is 100% secure, we take reasonable precautions to protect your data.` },
  { title: '5. Data Retention', content: `We retain your data while your account is active. You may request deletion of your account and all associated data at any time by emailing support@aiinterviewcoach.in.` },
  { title: '6. Cookies', content: `We use essential cookies for authentication (JWT token in HTTP-only cookie). We do not use tracking or advertising cookies.` },
  { title: '7. Your Rights', content: `You have the right to: access your personal data; request correction of inaccurate data; request deletion of your account; withdraw consent; and export your data in a portable format.` },
  { title: '8. Changes to This Policy', content: `We may update this policy periodically. Significant changes will be communicated via email or in-app notification. Continued use constitutes acceptance.` },
  { title: '9. Contact Us', content: `Questions? Email us at support@aiinterviewcoach.in.` },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Your Privacy Matters
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">Privacy Policy</h1>
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
