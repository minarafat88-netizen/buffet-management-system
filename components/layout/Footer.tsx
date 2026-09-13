// components/layout/Footer.tsx
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#17212b] border-t border-slate-700/60 text-slate-400 py-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 bg-[#176b87] rounded-lg flex items-center justify-center font-bold text-white text-sm">
              ب
            </div>
            <span className="text-white font-bold text-base">نظام إدارة البوفيه</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            نظام متكامل لإدارة البوفيه والمبيعات والمخزون والأرباح بكفاءة عالية وأمان تام.
          </p>
        </div>

        <div>
          <h4 className="text-white text-xs font-bold mb-3">روابط سريعة</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/" className="hover:text-white transition">الرئيسية</Link></li>
            <li><Link href="/products" className="hover:text-white transition">المنتجات</Link></li>
            <li><Link href="/inventory" className="hover:text-white transition">المخزون</Link></li>
            <li><Link href="/profits/daily" className="hover:text-white transition">الأرباح اليومية</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-xs font-bold mb-3">معلومات النظام</h4>
          <p className="text-xs text-slate-400">الإصدار الحالي: <span className="text-emerald-400 font-semibold">1.0.0</span></p>
          <p className="text-xs text-slate-500 mt-1">حالة الاتصال: متصل بقاعدة البيانات السحابية (Neon)</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-700/70 text-center text-xs text-slate-500">
        © 2026 نظام إدارة البوفيه - جميع الحقوق محفوظة
      </div>
    </footer>
  );
}