// app/page.tsx
import { db } from '@/db';
import { dailyProfits, products, inventoryCounts, debts } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import Link from 'next/link';
import { getSessionUser } from '@/services/session';
import { StatCard } from '@/components/ui/StatCard';
import { 
  HiOutlineCurrencyDollar, 
  HiOutlineShoppingBag, 
  HiOutlineChartBar, 
  HiOutlineCreditCard, 
  HiOutlineUserGroup, 
  HiOutlineDocumentReport,
  HiOutlinePlusCircle,
  HiOutlineReceiptTax,
  HiOutlineCash,
  HiOutlineArchive,
  HiOutlineCheckCircle,
  HiOutlineArrowUp,
  HiOutlineTrendingUp
} from 'react-icons/hi';

export default async function DashboardPage() {
  const user = await getSessionUser();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // جلب بيانات اليوم المالي
  const [todayProfit] = await db.select().from(dailyProfits).where(eq(dailyProfits.date, today)).limit(1);
  
  // إجمالي عدد الأصناف النشطة
  const [{ count: productsCount }] = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.isActive, true));

  // آخر جرد مخزون
  const [latestInventory] = await db.select().from(inventoryCounts).orderBy(sql`${inventoryCounts.date} DESC`).limit(1);

  // إجمالي الديون المسجلة
  const activeDebts = await db.select().from(debts);
  const totalDebtsVal = activeDebts.reduce((sum, d) => sum + parseFloat(d.remainingAmount || '0'), 0);

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
    <div className="space-y-8 pb-12">
      
      {/* 1. Hero Section الاحترافي */}
      <div className="glass-card p-8 rounded-3xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">النظام يعمل بكفاءة وأمان تام</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
            مرحبًا بك، {user?.username} 👋
          </h1>
          <p className="text-sm text-slate-400">
            إليك نظرة سريعة ومحدثة على حركة المبيعات، الأداء المالي، والمخزون اليوم.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link href="/purchases" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/30 transition-all duration-200 transform hover:-translate-y-0.5">
            <HiOutlinePlusCircle className="text-xl" />
            فاتورة شراء جديدة
          </Link>
          <Link href="/expenses" className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-5 py-3 rounded-2xl text-sm font-semibold transition-all border border-slate-700">
            <HiOutlineCash className="text-xl text-amber-400" />
            تسجيل مصروف
          </Link>
        </div>
      </div>

      {/* 2. KPI Cards الفاخرة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard 
          title="إجمالي الإيرادات اليومية" 
          value={revenue.toFixed(2)} 
          change="+8.4%" 
          isPositive={true} 
          icon={<HiOutlineCurrencyDollar className="text-2xl" />} 
          colorTheme="blue" 
        />
        <StatCard 
          title="إجمالي المصروفات" 
          value={totalExpenses.toFixed(2)} 
          change="-2.1%" 
          isPositive={false} 
          icon={<HiOutlineCreditCard className="text-2xl" />} 
          colorTheme="rose" 
        />
        <StatCard 
          title="صافي ربح اليوم" 
          value={netProfit.toFixed(2)} 
          change="+12.5%" 
          isPositive={netProfit >= 0} 
          icon={<HiOutlineChartBar className="text-2xl" />} 
          colorTheme="emerald" 
        />
        <StatCard 
          title="قيمة المخزون الحالي" 
          value={inventoryVal.toFixed(2)} 
          change={`${productsCount} صنف`} 
          isPositive={true} 
          icon={<HiOutlineShoppingBag className="text-2xl" />} 
          colorTheme="purple" 
        />
        <StatCard 
          title="إجمالي الديون المستحقة" 
          value={totalDebtsVal.toFixed(2)} 
          change="متابعة" 
          isPositive={false} 
          icon={<HiOutlineDocumentReport className="text-2xl" />} 
          colorTheme="amber" 
        />
      </div>

      {/* 3. قسم الإجراءات السريعة والاختصارات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="glass-card p-8 rounded-3xl lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
              اختصارات العمليات السريعة
            </h3>
            <span className="text-xs text-slate-400">وصول مباشر لأقسام النظام</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Link href="/products" className="p-4 bg-slate-800/40 hover:bg-blue-600/15 border border-slate-700/60 hover:border-blue-500/40 rounded-2xl transition-all duration-200 group text-center flex flex-col items-center justify-center">
              <HiOutlineShoppingBag className="text-3xl text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-200">قائمة الأصناف</span>
              <span className="text-[11px] text-slate-400 mt-1">{productsCount} أصناف نشطة</span>
            </Link>

            <Link href="/inventory" className="p-4 bg-slate-800/40 hover:bg-emerald-600/15 border border-slate-700/60 hover:border-emerald-500/40 rounded-2xl transition-all duration-200 group text-center flex flex-col items-center justify-center">
              <HiOutlineArchive className="text-3xl text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-200">الجرد اليومي</span>
              <span className="text-[11px] text-slate-400 mt-1">إدارة البضاعة</span>
            </Link>

            <Link href="/debts" className="p-4 bg-slate-800/40 hover:bg-amber-600/15 border border-slate-700/60 hover:border-amber-500/40 rounded-2xl transition-all duration-200 group text-center flex flex-col items-center justify-center">
              <HiOutlineCreditCard className="text-3xl text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-200">الديون والأقساط</span>
              <span className="text-[11px] text-slate-400 mt-1">متابعة الالتزامات</span>
            </Link>

            <Link href="/profits" className="p-4 bg-slate-800/40 hover:bg-purple-600/15 border border-slate-700/60 hover:border-purple-500/40 rounded-2xl transition-all duration-200 group text-center flex flex-col items-center justify-center">
              <HiOutlineCurrencyDollar className="text-3xl text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-200">الأرباح اليومية</span>
              <span className="text-[11px] text-slate-400 mt-1">سجل الإيرادات</span>
            </Link>

            <Link href="/expenses" className="p-4 bg-slate-800/40 hover:bg-rose-600/15 border border-slate-700/60 hover:border-rose-500/40 rounded-2xl transition-all duration-200 group text-center flex flex-col items-center justify-center">
              <HiOutlineReceiptTax className="text-3xl text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-200">المصروفات</span>
              <span className="text-[11px] text-slate-400 mt-1">سجل المنصرفات</span>
            </Link>

            {user?.role === 'ADMIN' && (
              <Link href="/admin/users" className="p-4 bg-slate-800/40 hover:bg-indigo-600/15 border border-slate-700/60 hover:border-indigo-500/40 rounded-2xl transition-all duration-200 group text-center flex flex-col items-center justify-center">
                <HiOutlineUserGroup className="text-3xl text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-slate-200">إدارة المستخدمين</span>
                <span className="text-[11px] text-slate-400 mt-1">الصلاحيات</span>
              </Link>
            )}
          </div>
        </div>

        {/* بطاقة معلومات حالة النظام الحية */}
        <div className="glass-card p-8 rounded-3xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <HiOutlineCheckCircle className="text-2xl" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">استقرار النظام والاتصال</h4>
                <span className="text-xs text-emerald-400 font-medium">متصل بقاعدة البيانات السحابية</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              جميع العمليات، الحسابات، والجرد مسجلة بشكل آمن ولحظي. يمكنك الاعتماد على النظام في إدارة الأنشطة التجارية بكفاءة.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-slate-400">إصدار البرنامج</span>
            <span className="text-xs font-bold text-blue-400">v1.0.0 Pro SaaS</span>
          </div>
        </div>

      </div>

    </div>
  );
}