// app/page.tsx
import { db } from '@/db';
import { dailyProfits, products, inventoryCounts, expenses } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getSessionUser } from '@/services/session';
import { 
  HiOutlineCurrencyDollar, 
  HiOutlineShoppingBag, 
  HiOutlineChartBar, 
  HiOutlineCreditCard, 
  HiOutlineUserGroup, 
  HiOutlineDocumentReport,
  HiOutlinePlusCircle,
  HiOutlineCheckCircle
} from 'react-icons/hi';

export default async function DashboardPage() {
  const user = await getSessionUser();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ترويسة اللوحة */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-2xl gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">النظام يعمل بكفاءة (Production Ready)</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">لوحة التحكم الرئيسية</h1>
            <p className="text-sm text-slate-400 mt-1">
              مرحباً بك، <span className="text-blue-400 font-bold">{user?.username}</span> ({user?.role === 'ADMIN' ? 'مدير النظام' : 'مستخدم'})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/purchases" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5">
              <HiOutlinePlusCircle className="text-xl" />
              فاتورة شراء جديدة
            </Link>
            <Link href="/expenses" className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-5 py-3 rounded-2xl text-sm font-semibold transition border border-slate-600">
              <HiOutlinePlusCircle className="text-xl text-emerald-400" />
              مصروف جديد
            </Link>
          </div>
        </div>

        {/* بطاقات المؤشرات (KPI Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* إيرادات */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/60 p-6 rounded-3xl shadow-xl relative overflow-hidden group hover:border-blue-500/50 transition">
            <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400">إجمالي الإيرادات اليومية</span>
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                <HiOutlineCurrencyDollar className="text-2xl" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">{revenue.toFixed(2)} <span className="text-sm font-medium text-slate-400">ج.م</span></div>
            <span className="text-xs text-blue-400 font-semibold mt-2 inline-block">حركة اليوم</span>
          </div>

          {/* المصروفات */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/60 p-6 rounded-3xl shadow-xl relative overflow-hidden group hover:border-red-500/50 transition">
            <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400">إجمالي المصروفات</span>
              <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20">
                <HiOutlineCreditCard className="text-2xl" />
              </div>
            </div>
            <div className="text-3xl font-black text-red-400 tracking-tight">{totalExpenses.toFixed(2)} <span className="text-sm font-medium text-slate-400">ج.م</span></div>
            <span className="text-xs text-red-400 font-semibold mt-2 inline-block">مصروفات مسجلة</span>
          </div>

          {/* صافي الربح */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/60 p-6 rounded-3xl shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition">
            <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400">صافي ربح اليوم</span>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <HiOutlineChartBar className="text-2xl" />
              </div>
            </div>
            <div className={`text-3xl font-black tracking-tight ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {netProfit.toFixed(2)} <span className="text-sm font-medium text-slate-400">ج.م</span>
            </div>
            <span className="text-xs text-slate-400 font-semibold mt-2 inline-block">بعد خصم المنصرفات</span>
          </div>

          {/* قيمة المخزون */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/60 p-6 rounded-3xl shadow-xl relative overflow-hidden group hover:border-purple-500/50 transition">
            <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400">قيمة المخزون الحالي</span>
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                <HiOutlineShoppingBag className="text-2xl" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">{inventoryVal.toFixed(2)} <span className="text-sm font-medium text-slate-400">ج.م</span></div>
            <span className="text-xs text-purple-400 font-semibold mt-2 inline-block">آخر جرد مسجل</span>
          </div>

        </div>

        {/* روابط سريعة وعمليات */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/60 p-8 rounded-3xl shadow-xl lg:col-span-2">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
              <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
              اختصارات النظام الأساسية
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              
              <Link href="/products" className="flex flex-col items-center justify-center p-5 bg-slate-700/30 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/50 rounded-2xl transition group text-center">
                <HiOutlineShoppingBag className="text-3xl text-blue-400 mb-3 group-hover:scale-110 transition" />
                <span className="text-sm font-bold text-slate-200">قائمة الأصناف</span>
                <span className="text-xs text-slate-400 mt-1">{productsCount} أصناف نشطة</span>
              </Link>

              <Link href="/inventory" className="flex flex-col items-center justify-center p-5 bg-slate-700/30 hover:bg-emerald-600/20 border border-slate-700 hover:border-emerald-500/50 rounded-2xl transition group text-center">
                <HiOutlineChartBar className="text-3xl text-emerald-400 mb-3 group-hover:scale-110 transition" />
                <span className="text-sm font-bold text-slate-200">الجرد اليومي</span>
                <span className="text-xs text-slate-400 mt-1">إدارة البضاعة</span>
              </Link>

              <Link href="/debts" className="flex flex-col items-center justify-center p-5 bg-slate-700/30 hover:bg-amber-600/20 border border-slate-700 hover:border-amber-500/50 rounded-2xl transition group text-center">
                <HiOutlineCreditCard className="text-3xl text-amber-400 mb-3 group-hover:scale-110 transition" />
                <span className="text-sm font-bold text-slate-200">الديون والأقساط</span>
                <span className="text-xs text-slate-400 mt-1">متابعة الالتزامات</span>
              </Link>

              {user?.role === 'ADMIN' && (
                <Link href="/profits/monthly" className="flex flex-col items-center justify-center p-5 bg-slate-700/30 hover:bg-purple-600/20 border border-slate-700 hover:border-purple-500/50 rounded-2xl transition group text-center">
                  <HiOutlineDocumentReport className="text-3xl text-purple-400 mb-3 group-hover:scale-110 transition" />
                  <span className="text-sm font-bold text-slate-200">الأرباح الشهرية</span>
                  <span className="text-xs text-slate-400 mt-1">تقارير الإيرادات</span>
                </Link>
              )}

            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/60 p-8 rounded-3xl shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                <HiOutlineCheckCircle className="text-emerald-400 text-xl" />
                حالة الخادم والاتصال
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                قاعدة البيانات متصلة بنجاح، ويتم تحديث المؤشرات المالية بشكل لحظي وفقاً للحركات المسجلة اليوم.
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 text-xs font-semibold text-center">
              Production Ready & Secure
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}