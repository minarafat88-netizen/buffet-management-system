'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

interface AppShellProps {
  children: React.ReactNode;
  user: { username: string; role: string } | null;
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname === '/login' || !user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-page)] text-[var(--color-ink)]">
      <Header
        user={user}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />
      <div className="flex min-h-[calc(100vh-73px)]">
        <Sidebar role={user.role} />
        {mobileMenuOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
              aria-label="إغلاق القائمة"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 z-50 w-72 lg:hidden">
              <Sidebar role={user.role} mobile onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </>
        )}
        <main className="min-w-0 flex-1 flex flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
