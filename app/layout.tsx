import './globals.css';
import { Cairo } from 'next/font/google';

const cairo = Cairo({ 
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'برنامج إدارة وحسابات البوفيه',
  description: 'نظام احترافي لإدارة البوفيه والمخزون والحسابات',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.className}>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}