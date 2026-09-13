// app/profits/monthly/page.tsx
import { db } from '@/db';
import { dailyProfits } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getSessionUser } from '@/services/session';

export default async function MonthlyProfitsPage() {
  const user = await getSessionUser();

  if (user?.role !== 'ADMIN') {
    return <div className="p-8 text-center text-red-600 font-bold">عفواً، هذه الصفحة مخصصة لمدير النظام فقط.</div>;
  }

  // تجميع الأرباح حسب الشهر والسنة باستخدام استعلام SQL
  const monthlyData = await db.select({
    monthYear: sql<string>`TO_CHAR(${dailyProfits.date}, 'YYYY-MM')`,
    totalBuffet: sql<number>`SUM(CAST(${dailyProfits.buffetProfit} AS NUMERIC))`,
    totalIceCream: sql<number>`SUM(CAST(${dailyProfits.iceCreamProfit} AS NUMERIC))`,
    totalBilliard: sql<number>`SUM(CAST(${dailyProfits.billiardProfit} AS NUMERIC))`,
    totalPlaystation: sql<number>`SUM(CAST(${dailyProfits.playstationProfit} AS NUMERIC))`,
    totalBarber: sql<number>`SUM(CAST(${dailyProfits.barberProfit} AS NUMERIC))`,
    totalOther: sql<number>`SUM(CAST(${dailyProfits.otherProfit} AS NUMERIC))`,
    totalExpenses: sql<number>`SUM(CAST(${dailyProfits.totalExpenses} AS NUMERIC))`,
    totalNet: sql<number>`SUM(CAST(${dailyProfits.netProfit} AS NUMERIC))`,
  })
  .from(dailyProfits)
  .groupBy(sql`TO_CHAR(${dailyProfits.date}, 'YYYY-MM')`)
  .orderBy(sql`TO_CHAR(${dailyProfits.date}, 'YYYY-MM') DESC`);

  return (
    <div className="flex-1 bg-slate-100 p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">الأرباح الشهرية ومقارنة الأداء</h1>
          <p className="text-sm text-slate-500">تقارير الإيرادات والمصروفات مجمعة حسب الشهور</p>
        </div>
        <Link href="/" className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition">
          الرئيسية
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="p-4">الشهر (السنة-الشهر)</th>
              <th className="p-4">إيرادات البوفيه</th>
              <th className="p-4">إيرادات الآيس كريم</th>
              <th className="p-4">البلياردو</th>
              <th className="p-4">البلايستيشن</th>
              <th className="p-4">الحلاق</th>
              <th className="p-4">أخرى</th>
              <th className="p-4">إجمالي المصروفات</th>
              <th className="p-4">صافي الربح الشهري</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {monthlyData.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-800">{row.monthYear}</td>
                <td className="p-4">{Number(row.totalBuffet || 0).toFixed(2)} ج.م</td>
                <td className="p-4">{Number(row.totalIceCream || 0).toFixed(2)} ج.م</td>
                <td className="p-4">{Number(row.totalBilliard || 0).toFixed(2)} ج.م</td>
                <td className="p-4">{Number(row.totalPlaystation || 0).toFixed(2)} ج.م</td>
                <td className="p-4">{Number(row.totalBarber || 0).toFixed(2)} ج.م</td>
                <td className="p-4">{Number(row.totalOther || 0).toFixed(2)} ج.م</td>
                <td className="p-4 text-red-500">{Number(row.totalExpenses || 0).toFixed(2)} ج.م</td>
                <td className="p-4 font-bold text-emerald-600">{Number(row.totalNet || 0).toFixed(2)} ج.م</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}