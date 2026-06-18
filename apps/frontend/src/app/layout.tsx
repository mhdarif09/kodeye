import type { Metadata } from 'next';

import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Kodeye',
    template: '%s | Kodeye',
  },
  description:
    'AI-powered engineering and automation for codebase audit, business automation, DevOps, and digitalization.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
