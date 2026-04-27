import Link from 'next/link';
import { Brain } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Pricing', href: '/pricing' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Refund & Cancellation', href: '/refund' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                AI Interview Coach
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-4">
              AI-powered resume analysis, mock interviews, and personalized
              feedback to help you ace every interview.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <a
                href="mailto:support@aiinterviewcoach.in"
                className="hover:text-indigo-400 transition-colors"
              >
                support@aiinterviewcoach.in
              </a>
              <span className="text-slate-700">|</span>
              <a
                href="tel:+916289XXXXXX"
                className="hover:text-indigo-400 transition-colors"
              >
                +91-6289-XXX-XXX
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} AI Interview Coach. All rights
            reserved.
          </p>
          <p className="text-xs text-slate-500">
            Built with ❤️ and Gemini AI
          </p>
        </div>
      </div>
    </footer>
  );
}
