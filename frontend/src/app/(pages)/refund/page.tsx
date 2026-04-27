import { RotateCcw } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — AI Interview Coach',
  description: 'Understand our refund and cancellation policy for AI Interview Coach subscriptions.',
};

const sections = [
  { title: '1. Free Plan', content: `The Free plan requires no payment and can be used indefinitely with no cancellation needed. Free plan users may upgrade to Pro at any time.` },
  { title: '2. Pro Plan Subscription', content: `The Pro plan is billed at ₹499/month. Subscriptions auto-renew at the beginning of each billing cycle unless cancelled before the renewal date.` },
  { title: '3. Cancellation Policy', content: `You may cancel your Pro subscription at any time by contacting us at support@aiinterviewcoach.in. Upon cancellation: your Pro features will remain active until the end of the current billing period; after that, your account will revert to the Free plan; your session history and data will be preserved.` },
  { title: '4. Refund Policy', content: `We offer a full refund within 7 days of your first Pro subscription payment if you are not satisfied with the service. To request a refund, email support@aiinterviewcoach.in with your registered email and reason for the refund. Refunds after the 7-day window are considered on a case-by-case basis. Refunds are processed via the original payment method (Razorpay) within 5–10 business days.` },
  { title: '5. Non-Refundable Scenarios', content: `Refunds will not be issued for: partial month usage after the 7-day refund window; accounts suspended or terminated due to Terms violations; or change of mind after the refund period has elapsed.` },
  { title: '6. Modifications to Pricing', content: `We reserve the right to change subscription pricing with at least 30 days' advance notice. Existing subscribers will be notified via email before any price change takes effect. You may cancel before the new pricing applies.` },
  { title: '7. Contact for Refunds', content: `For refund requests or billing inquiries, contact us at: Email: support@aiinterviewcoach.in | Phone: +91-6289-XXX-XXX. We aim to respond to all refund requests within 48 hours.` },
];

export default function RefundPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
            <RotateCcw className="w-4 h-4" />
            Billing
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">Refund &amp; Cancellation Policy</h1>
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
