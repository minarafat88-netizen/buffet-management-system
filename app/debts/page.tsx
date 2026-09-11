// app/debts/page.tsx
import { db } from '@/db';
import { debts, installments } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { createDebtWithInstallments, payInstallment } from '@/app/actions/debts';

export default async function DebtsPage() {
  const sessionCookie = cookies().get('buffet_session_token');
  const user = sessionCookie ? JSON.parse(sessionCookie.value) : null;

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-100">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">غير مصرح لك بالوصول</h2>
          <p className="text-slate-500 mb-4">صفحة إدارة الديون مخصصة لمدير النظام (Admin) فقط.</p>
          <Link href="/" className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  // جلب كافة الديون النشطة مع تفاصيل أقساطها
  const allDebts = await db.select().from(debts).where(sql`${debts.deletedAt} IS NULL`).orderBy(sql`${debts.id} DESC`);

  return (
    <div className="flex-1 bg-slate-100 p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">إدارة الديون والالتزامات والأقساط</h1>
          <p className="text-sm text-slate-500">متابعة حسابات الدائنين وجدولة السداد والمدفوعات</p>
        </div>
        <Link href="/" className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition">
          الرئيسية
        </Link>
      </div>

      {/* نموذج إضافة دين جديد مع الأقساط */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4">إضافة التزام / دين جديد</h3>
        
        <form action={async (formData: FormData) => {
          'use server';
          const creditorName = formData.get('creditorName') as string;
          const phone = formData.get('phone') as string;
          const totalAmount = Number(formData.get('totalAmount'));
          const installmentsCount = Number(formData.get('installmentsCount'));
          const installmentAmount = Number(formData.get('installmentAmount'));
          const firstDueDate = formData.get('firstDueDate') as string;
          const notes = formData.get('notes') as string;

          if (!creditorName || !totalAmount || totalAmount <= 0) return;

          await createDebtWithInstallments({
            creditorName,
            phone,
            totalAmount,
            installmentsCount,
            installmentAmount,
            firstDueDate,
            notes,
          });
        }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">اسم الدائن / جهة الالتزام</label>
            <input type="text" name="creditorName" required placeholder="مثال: شركة المشروبات" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">رقم الهاتف (اختياري)</label>
            <input type="text" name="phone" placeholder="010xxxxxxxx" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">إجمالي مبلغ الدين (ج.م)</label>
            <input type="number" step="0.01" name="totalAmount" required placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">عدد الأقساط</label>
            <input type="number" name="installmentsCount" defaultValue="1" min="1" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">قيمة القسط الواحد (ج.م)</label>
            <input type="number" step="0.01" name="installmentAmount" required placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">تاريخ أول استحقاق</label>
            <input type="date" name="firstDueDate" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-2">ملاحظات إضافية</label>
            <input type="text" name="notes" placeholder="تفاصيل بضاعة أو تعليق" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <div className="flex items-end">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl text-sm font-semibold transition shadow-sm">
              حفظ وتوزيع الأقساط
            </button>
          </div>
        </form>
      </div>

      {/* جدول الديون المسجلة */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">قائمة الديون والالتزامات النشطة</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4">اسم الدائن</th>
                <th className="p-4">رقم الهاتف</th>
                <th className="p-4">إجمالي الدين</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {allDebts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">لا توجد ديون مسجلة حالياً</td>
                </tr>
              ) : (
                allDebts.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-800">{d.creditorName}</td>
                    <td className="p-4 text-slate-500">{d.phone || 'غير متوفر'}</td>
                    <td className="p-4 font-bold text-slate-900">{parseFloat(d.totalAmount).toFixed(2)} ج.م</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${d.status === 'ACTIVE' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {d.status === 'ACTIVE' ? 'نشط وقائم' : 'مكتمل السداد'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{d.notes || '---'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}