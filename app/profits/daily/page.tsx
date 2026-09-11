// app/profits/daily/page.tsx
import { db } from '@/db';
import { dailyProfits, expenses } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function DailyProfitsPage() {
  const sessionCookie = cookies().get('buffet_session_token');
  const user = sessionCookie ? JSON.parse(sessionCookie.value) : null;

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-100">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">غير مصرح لك بالوصول</h2>
          <p className="text-slate-500 mb-4">هذه الصفحة مخصصة لمدير النظام (Admin) فقط.</p>
          <Link href="/" className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayProfit] = await db.select().from(dailyProfits).where(eq(dailyProfits.date, today)).limit(1);

  const buffet = todayProfit ? parseFloat(todayProfit.buffetProfit) : 0;
  const iceCream = todayProfit ? parseFloat(todayProfit.iceCreamProfit) : 0;
  const billiard = todayProfit ? parseFloat(todayProfit.billiardProfit) : 0;
  const playstation = todayProfit ? parseFloat(todayProfit.playstationProfit) : 0;
  const barber = todayProfit ? parseFloat(todayProfit.barberProfit) : 0;
  const other = todayProfit ? parseFloat(todayProfit.otherProfit) : 0;

  const totalRevenue = buffet + iceCream + billiard + playstation + barber + other;
  const totalExpenses = todayProfit ? parseFloat(todayProfit.totalExpenses) : 0;
  const netProfit = todayProfit ? parseFloat(todayProfit.netProfit) : totalRevenue - totalExpenses;

  return (
    <div className="flex-1 bg-slate-100 p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">الأرباح والإيرادات اليومية</h1>
          <p className="text-sm text-slate-500">توزيع الإيرادات وخصم المصروفات لحساب صافي الربح اليومي</p>
        </div>
        <Link href="/" className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition">
          الرئيسية
        </Link>
      </div>

      {/* المؤشرات المالية الكبرى */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-semibold text-slate-400">إجمالي الإيرادات</span>
          <h2 className="text-3xl font-bold text-blue-600 mt-2">{totalRevenue.toFixed(2)} ج.م</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-semibold text-slate-400">إجمالي المصروفات اليومية</span>
          <h2 className="text-3xl font-bold text-red-500 mt-2">{totalExpenses.toFixed(2)} ج.م</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-semibold text-slate-400">صافي الربح الفعلي</span>
          <h2 className={`text-3xl font-bold mt-2 ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {netProfit.toFixed(2)} ج.م
          </h2>
        </div>
      </div>

      {/* تفاصيل الأقسام */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-2xl">
        <h3 className="text-lg font-bold text-slate-800 mb-4">مصادر الإيرادات المسجلة اليوم</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-700">أرباح البوفيه</span>
            <span className="font-bold text-slate-900">{buffet.toFixed(2)} ج.م</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-700">أرباح الآيس كريم</span>
            <span className="font-bold text-slate-900">{iceCream.toFixed(2)} ج.م</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-700">أرباح البلياردو</span>
            <span className="font-bold text-slate-900">{billiard.toFixed(2)} ج.م</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-700">أرباح البلايستيشن</span>
            <span className="font-bold text-slate-900">{playstation.toFixed(2)} ج.م</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-700">أرباح الحلاق</span>
            <span className="font-bold text-slate-900">{barber.toFixed(2)} ج.م</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-700">أرباح أخرى</span>
            <span className="font-bold text-slate-900">{other.toFixed(2)} ج.م</span>
          </div>
        </div>
      </div>
    </div>
  );
}