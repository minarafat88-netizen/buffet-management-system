// components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiOutlineBell, HiOutlineLogout, HiOutlineMenuAlt3, HiOutlineSearch } from 'react-icons/hi';

interface HeaderProps {
  user: { username: string; role: string };
  onOpenMobileMenu?: () => void;
}

export function Header({ user, onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const pageNames: Record<string, string> = {
    '/': 'لوحة التحكم',
    '/products': 'المنتجات',
    '/purchases': 'فواتير الشراء',
    '/inventory': 'المخزون والجرد',
    '/expenses': 'المصروفات',
    '/debts': 'الديون والأقساط',
    '/profits/daily': 'الأرباح اليومية',
    '/profits/monthly': 'الأرباح الشهرية',
    '/admin/users': 'المستخدمون والصلاحيات',
    '/audit-logs': 'سجل العمليات',
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between gap-4 transition-all shadow-[0_1px_8px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-4">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden text-slate-500 hover:text-[#176b87] p-2 rounded-xl hover:bg-cyan-50 transition"
            aria-label="فتح القائمة"
          >
            <HiOutlineMenuAlt3 className="text-2xl" />
          </button>
        )}
        <Link href="/" className="flex items-center gap-3 shrink-0" aria-label="العودة إلى لوحة التحكم">
          <div className="h-10 w-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-slate-900/15">
            ب
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">نظام إدارة البوفيه</h1>
            <span className="text-xs text-emerald-600 font-medium">متصل بالخدمة السحابية</span>
          </div>
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-3 min-w-0 flex-1 justify-center">
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap">
          <span>الرئيسية</span>
          <span>/</span>
          <strong className="text-slate-700">{pageNames[pathname] ?? 'النظام'}</strong>
        </div>
        <label className="relative w-full max-w-xs">
          <span className="sr-only">بحث في النظام</span>
          <HiOutlineSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input type="search" placeholder="بحث سريع..." className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pr-10 pl-3 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-cyan-300 focus:outline-none" />
        </label>
      </div>

      <div className="flex items-center gap-2 shrink-0">
          <button className="relative p-2.5 bg-slate-50 hover:bg-cyan-50 text-slate-500 hover:text-[#176b87] rounded-lg border border-slate-200 transition" aria-label="الإشعارات">
          <span className="absolute top-2 right-2 h-2 w-2 bg-amber-500 rounded-full animate-ping"></span>
          <HiOutlineBell className="text-xl" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-r border-slate-200">
          <div className="h-10 w-10 bg-cyan-50 border border-cyan-100 rounded-xl flex items-center justify-center font-bold text-[#176b87]">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-right">
            <span className="block text-xs font-bold text-slate-800">{user.username}</span>
            <span className="block text-[10px] text-slate-400">{user.role === 'ADMIN' ? 'مدير النظام' : 'مستخدم'}</span>
          </div>
        </div>

        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100 transition" title="تسجيل الخروج">
            <HiOutlineLogout className="text-xl" />
          </button>
        </form>
      </div>
    </header>
  );
}