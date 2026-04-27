import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — AI Interview Coach',
  description:
    'Choose the plan that fits your interview preparation needs. Free and Pro plans available with AI-powered resume analysis, mock interviews, and feedback.',
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
