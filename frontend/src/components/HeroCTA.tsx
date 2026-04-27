'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { auth } from '@/lib/api';

export default function HeroCTA() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    auth.me().then(() => setLoggedIn(true)).catch(() => setLoggedIn(false));
  }, []);

  return (
    <Link
      href={loggedIn ? '/dashboard' : '/register'}
      className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-lg hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 animate-pulseGlow flex items-center gap-2"
    >
      {loggedIn ? 'Go to Dashboard' : 'Get Started Free'}
      <ArrowRight className="w-5 h-5" />
    </Link>
  );
}
