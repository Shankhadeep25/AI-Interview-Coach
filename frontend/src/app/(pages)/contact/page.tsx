import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — AI Interview Coach',
  description: 'Get in touch with the AI Interview Coach team. Reach us via email, phone, or the contact form.',
};

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'support@aiinterviewcoach.in', href: 'mailto:support@aiinterviewcoach.in' },
  { icon: Phone, label: 'Phone', value: '+91-6289-XXX-XXX', href: 'tel:+916289XXXXXX' },
  { icon: MapPin, label: 'Address', value: 'Kolkata, West Bengal, India', href: null },
  { icon: Clock, label: 'Support Hours', value: 'Mon–Sat, 10 AM – 7 PM IST', href: null },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
            <MessageCircle className="w-4 h-4" />
            Get in Touch
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">Contact Us</h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Have a question, feedback, or need support? We&apos;d love to hear from you.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-6">Reach Us Directly</h2>
            {contactInfo.map((c) => (
              <div key={c.label} className="flex items-start gap-4 bg-slate-900/50 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
                <div className="p-2.5 rounded-lg bg-indigo-500/10">
                  <c.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="text-sm text-white hover:text-indigo-300 transition-colors">{c.value}</a>
                  ) : (
                    <p className="text-sm text-white">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Send a Message</h2>
            <form className="space-y-5" action="mailto:support@aiinterviewcoach.in" method="POST" encType="text/plain">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input id="contact-name" name="name" type="text" required placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all" />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input id="contact-email" name="email" type="email" required placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all" />
              </div>
              <div>
                <label htmlFor="contact-subject" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                <input id="contact-subject" name="subject" type="text" required placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all" />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Message</label>
                <textarea id="contact-message" name="message" rows={4} required placeholder="Tell us more..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none" />
              </div>
              <button type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
