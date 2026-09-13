import './globals.css';
import { Cairo } from 'next/font/google';
import { getSessionUser } from '@/services/session';
import { AppShell } from '@/components/layout/AppShell';

const cairo = Cairo({ 
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'برنامج إدارة وحسابات البوفيه',
  description: 'نظام احترافي لإدارة البوفيه والمخزون والحسابات',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <html lang="ar" dir="rtl" className={cairo.className}>
      <body className="bg-[#f5f7fa] text-[#1f2937] antialiased min-h-screen flex flex-col">
        <AppShell user={user}>{children}</AppShell>
      </body>
    </html>
  );
}