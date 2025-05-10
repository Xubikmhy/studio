import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeInitializer } from '@/components/layout/theme-initializer';


export const metadata: Metadata = {
  title: 'Gorkhali Offset Press - Employee Management',
  description: 'Efficiently manage your printing press employees, tasks, and attendance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`antialiased`} suppressHydrationWarning={true}>
        <ThemeInitializer />
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
