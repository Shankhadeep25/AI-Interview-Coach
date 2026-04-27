import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — AI Interview Coach',
  description:
    'Get in touch with the AI Interview Coach team. Reach us via email, phone, or the contact form.',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
