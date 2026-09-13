'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HiOutlineArchive, HiOutlineArrowLeft, HiOutlineCreditCard, HiOutlineTrendingUp } from 'react-icons/hi';

const notices = [
  {
    title: 'راجع حركة اليوم المالية',
    description: 'تابع الإيرادات والمصروفات وصافي الربح من تقرير الأرباح اليومية.',
    href: '/profits/daily',
    label: 'فتح التقرير',
    icon: HiOutlineTrendingUp,
    color: 'text-[#176b87] bg-cyan-50 border-cyan-100',
  },
  {
    title: 'حافظ على جاهزية المخزون',
    description: 'سجل الجرد اليومي وتأكد من توفر الأصناف الأساسية قبل بداية العمل.',
    href: '/inventory',
    label: 'عرض المخزون',
    icon: HiOutlineArchive,
    color: 'text-amber-600 bg-amber-50 border-amber-100',
  },
  {
    title: 'تابع الالتزامات المستحقة',
    description: 'راجع الديون والأقساط المسجلة واتخذ الإجراء المناسب في الوقت المحدد.',
    href: '/debts',
    label: 'عرض الديون',
    icon: HiOutlineCreditCard,
    color: 'text-red-600 bg-red-50 border-red-100',
  },
];

export default function DashboardNoticeCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const notice = notices[activeIndex];
  const Icon = notice.icon;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % notices.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 md:p-6" aria-label="تنبيهات وإجراءات مقترحة">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 shrink-0 rounded-xl border flex items-center justify-center ${notice.color}`}>
            <Icon className="text-2xl" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400">إجراء مقترح</span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{notice.title}</h2>
            <p className="text-sm text-slate-500 mt-1 leading-6">{notice.description}</p>
          </div>
        </div>

        <Link href={notice.href} className="inline-flex items-center justify-center gap-2 text-sm font-bold text-[#176b87] hover:text-[#12566c] whitespace-nowrap">
          {notice.label}
          <HiOutlineArrowLeft className="text-lg" />
        </Link>
      </div>

      <div className="flex items-center gap-1.5 mt-5" role="tablist" aria-label="التنبيهات">
        {notices.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-[#176b87]' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
            aria-label={`عرض التنبيه ${index + 1}`}
            aria-selected={index === activeIndex}
            role="tab"
          />
        ))}
      </div>
    </section>
  );
}
