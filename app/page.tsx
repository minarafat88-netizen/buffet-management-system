// app/page.tsx
import { db } from '@/db';
import { dailyProfits, products, inventoryCounts, expenses } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { neon } from '@neondatabase/serverless';

export default function Page() {
  async function create(formData: FormData) {
    'use server';
    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);
    const comment = formData.get('comment');
    // Insert the comment from the form into the Postgres database
    await sql('INSERT INTO comments (comment) VALUES ($1)', [comment]);
  }

  return (
    <form action={create}>
      <input type="text" placeholder="write a comment" name="comment" />
      <button type="submit">Submit</button>
    </form>
  );
}

export default async function DashboardPage() {
  const sessionCookie = cookies().get('buffet_session_token');
  const user = sessionCookie ? JSON.parse(sessionCookie.value) : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // جلب بيانات اليوم المالي
  const [todayProfit] = await db.select().from(dailyProfits).where(eq(dailyProfits.date, today)).limit(1);
  
  // إجمالي عدد الأصناف
  const [{ count: productsCount }] = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.isActive, true));

  // آخر جرد مخزون
  const [latestInventory] = await db.select().from(inventoryCounts).orderBy(sql`${inventoryCounts.date} DESC`).limit(1);

  const revenue = todayProfit ? 
    parseFloat(todayProfit.buffetProfit) + 
    parseFloat(todayProfit.iceCreamProfit) + 
    parseFloat(todayProfit.billiardProfit) + 
    parseFloat(todayProfit.playstationProfit) + 
    parseFloat(todayProfit.barberProfit) + 
    parseFloat(todayProfit.otherProfit) : 0;

  const totalExpenses = todayProfit ? parseFloat(todayProfit.totalExpenses) : 0;
  const netProfit = todayProfit ? parseFloat(todayProfit.netProfit) : 0;
  const inventoryVal = latestInventory ? parseFloat(latestInventory.totalValue) : 0;

  return (
    <div className="flex-1 bg-slate-100 p-4 md:p-8">
      {/* ترويسة اللوحة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">لوحة التحكم الرئيسية</h1>
          <p className="text-sm text-slate-500">مرحباً بك، {user?.username} ({user?.role === 'ADMIN' ? 'مدير النظام' : 'مستخدم'})</p>
        </div>
        <div className="flex gap-2">
          <Link href="/purchases" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
            + فاتورة شراء
          </Link>
          <Link href="/expenses" className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
            + مصروف جديد
          </Link>
        </div>
      </div>

      {/* بطاقات المؤشرات (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-semibold text-slate-400">إجمالي الإيرادات اليومية</span>
          <h2 className="text-2xl font-bold text-blue-600 mt-1">{revenue.toFixed(2)} ج.م</h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-semibold text-slate-400">إجمالي المصروفات</span>
          <h2 className="text-2xl font-bold text-red-500 mt-1">{totalExpenses.toFixed(2)} ج.م</h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-semibold text-slate-400">صافي ربح اليوم</span>
          <h2 className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {netProfit.toFixed(2)} ج.م
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-xs font-semibold text-slate-400">قيمة المخزون الحالي</span>
          <h2 className="text-2xl font-bold text-purple-600 mt-1">{inventoryVal.toFixed(2)} ج.م</h2>
        </div>
      </div>

      {/* روابط سريعة وعمليات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4">اختصارات النظام الأساسية</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/products" className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-center border border-slate-200 transition">
              <span className="block font-semibold text-slate-700">قائمة الأصناف</span>
              <span className="text-xs text-slate-400">{productsCount} أصناف نشطة</span>
            </Link>
            <Link href="/inventory" className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-center border border-slate-200 transition">
              <span className="block font-semibold text-slate-700">الجرد اليومي</span>
              <span className="text-xs text-slate-400">إدارة البضاعة والفعل</span>
            </Link>
            <Link href="/debts" className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-center border border-slate-200 transition">
              <span className="block font-semibold text-slate-700">الديون والأقساط</span>
              <span className="text-xs text-slate-400">متابعة الالتزامات</span>
            </Link>
            {user?.role === 'ADMIN' && (
              <Link href="/profits/monthly" className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-center border border-slate-200 transition">
                <span className="block font-semibold text-slate-700">الأرباح الشهرية</span>
                <span className="text-xs text-slate-400">تقارير الإيرادات</span>
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          حالة النظام: <span className="text-emerald-600 font-bold">يعمل بكفاءة (Production Ready)</span>
        </div>
      </div>
    </div>
  );
}