import type { Metadata } from 'next';
import { GeistSans } from 'next/font/google'; // Corrected import for GeistSans
import { GeistMono } from 'next/font/google'; // Corrected import for GeistMono
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/providers/query-provider';

const geistSans = GeistSans({ // Use GeistSans directly
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = GeistMono({ // Use GeistMono directly
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PressTrack - Employee Management',
  description: 'Efficiently manage your printing press employees, tasks, and attendance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
