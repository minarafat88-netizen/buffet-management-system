// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HiOutlineHome, 
  HiOutlineShoppingBag, 
  HiOutlineReceiptTax, 
  HiOutlineCurrencyDollar, 
  HiOutlineArchive, 
  HiOutlineClipboardCheck, 
  HiOutlineCash, 
  HiOutlineCreditCard, 
  HiOutlineChartPie, 
  HiOutlineUsers, 
  HiOutlineShieldCheck, 
  HiOutlineCog 
} from 'react-icons/hi';

const navGroups = [
  {
    label: 'الرئيسية',
    items: [{ name: 'لوحة التحكم', href: '/', icon: HiOutlineHome }],
  },
  {
    label: 'التشغيل اليومي',
    items: [
      { name: 'المنتجات', href: '/products', icon: HiOutlineShoppingBag },
      { name: 'فواتير الشراء', href: '/purchases', icon: HiOutlineReceiptTax },
      { name: 'المخزون والجرد', href: '/inventory', icon: HiOutlineArchive },
      { name: 'المصروفات', href: '/expenses', icon: HiOutlineCash },
      { name: 'الديون والأقساط', href: '/debts', icon: HiOutlineCreditCard },
    ],
  },
  {
    label: 'التقارير',
    items: [
      { name: 'الأرباح اليومية', href: '/profits/daily', icon: HiOutlineCurrencyDollar },
      { name: 'الأرباح الشهرية', href: '/profits/monthly', icon: HiOutlineChartPie },
    ],
  },
  {
    label: 'الإدارة',
    items: [
      { name: 'المستخدمون والصلاحيات', href: '/admin/users', icon: HiOutlineUsers },
      { name: 'سجل العمليات', href: '/audit-logs', icon: HiOutlineShieldCheck },
    ],
  },
];

export function Sidebar({ role, mobile = false, onNavigate }: { role: string; mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={`w-64 bg-[#17212b] border-l border-slate-700/40 p-4 flex flex-col justify-between ${mobile ? 'h-full' : 'hidden lg:flex min-h-[calc(100vh-73px)]'}`}>
      <div className="space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <span className="text-[10px] font-extrabold tracking-wider text-slate-500 px-3">{group.label}</span>
            <nav className="mt-2 space-y-1">
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
              // تقييد ظهور صفحات الإدارة للمدير فقط
              if (item.href.startsWith('/admin') && role !== 'ADMIN') return null;

              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition duration-200 group ${
                    isActive 
                      ? 'bg-[#176b87] text-white shadow-lg shadow-cyan-950/20' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className={`text-xl transition group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            </nav>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl text-center">
        <span className="block text-xs font-bold text-slate-300">إصدار النظام</span>
        <span className="text-[10px] text-slate-500 mt-0.5 block">v1.0.0 - Production Ready</span>
      </div>
    </aside>
  );
}