import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NestFinder',
  description: 'Find verified PGs, hostels and rooms for rent.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
