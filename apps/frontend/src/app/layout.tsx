import type { Metadata } from 'next';

import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Kodeye',
    template: '%s | Kodeye',
  },
  description: 'Simple, trustworthy codebase security audit workflows.',
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
