'use client';

import { useState, useCallback } from 'react';
import { Loader2, Crown, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { payment } from '@/lib/api';

// ─── Razorpay type declarations ─────────────────────────────────────────────
// Razorpay's checkout.js attaches itself to window.Razorpay. We declare the
// minimal type surface we need so TypeScript doesn't complain.
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// ─── Load Razorpay Script ───────────────────────────────────────────────────
// Dynamically injects checkout.js only when needed. Caches the promise so
// subsequent calls are instant. We don't use next/script because we need
// programmatic control over when it loads.
let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    // Already loaded (e.g., from a previous page navigation)
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      razorpayScriptPromise = null; // allow retry on failure
      reject(new Error('Failed to load Razorpay SDK'));
    };
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

// ─── Component Props ────────────────────────────────────────────────────────
interface PayButtonProps {
  userName: string;
  userEmail: string;
  userPlan: 'free' | 'pro';
  onSuccess?: () => void; // callback after successful upgrade
}

export default function PayButton({ userName, userEmail, userPlan, onSuccess }: PayButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = useCallback(async () => {
    setLoading(true);

    try {
      // ── Step 1: Load Razorpay SDK ─────────────────────────────────────
      await loadRazorpayScript();

      // ── Step 2: Create order on our backend ───────────────────────────
      const { data } = await payment.createOrder();
      const { orderId, amount, currency, keyId } = data;

      // ── Step 3: Open Razorpay Checkout Modal ──────────────────────────
      const options: RazorpayOptions = {
        key: keyId,
        amount,
        currency,
        name: 'AI Interview Coach',
        description: 'Pro Plan — Monthly Subscription',
        order_id: orderId,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: '#6366f1', // indigo-500 to match our brand
        },
        handler: async (response: RazorpayResponse) => {
          // ── Step 4: Verify payment on our backend ───────────────────
          try {
            await payment.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('🎉 Welcome to Pro! Your account has been upgraded.');
            onSuccess?.();
          } catch {
            toast.error('Payment received but verification failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            // User closed the modal without paying — no error, just reset
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Something went wrong. Please try again.';
      toast.error(message);
      setLoading(false);
    }
  }, [userName, userEmail, onSuccess]);

  // ── Already on Pro ────────────────────────────────────────────────────────
  if (userPlan === 'pro') {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-semibold text-sm">
        <CheckCircle2 className="w-4 h-4" />
        You&apos;re on Pro
      </div>
    );
  }

  // ── Pay Button ────────────────────────────────────────────────────────────
  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Crown className="w-4 h-4" />
          Upgrade to Pro — ₹499/mo
        </>
      )}
    </button>
  );
}
