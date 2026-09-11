// app/expenses/page.tsx
import { db } from '@/db';
import { expenses, installments, debts } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { createExpense } from '@/app/actions/expenses';
import { payInstallment, createDebtWithInstallments } from '@/app/actions/debts';

export default async function ExpensesPage() {
  const sessionCookie = cookies().get('buffet_session_token');
  const user = sessionCookie ? JSON.parse(sessionCookie.value) : null;

  // جلب المصروفات المسجلة حديثاً
  const expensesList = await db.select().from(expenses)
    .where(sql`${expenses.deletedAt} IS NULL`)
    .orderBy(sql`${expenses.date} DESC`)
    .limit(10);

  // جلب الأقساط غير المدفوعة أو القريبة
  const activeInstallments = await db.select({
    id: installments.id,
    amount: installments.installmentAmount,
    dueDate: installments.dueDate,
    isPaid: installments.isPaid,
    debtId: installments.debtId,
    creditorName: debts.creditorName,
  })
  .from(installments)
  .leftJoin(debts, eq(installments.debtId, debts.id))
  .where(eq(installments.isPaid, false))
  .orderBy(sql`${installments.dueDate} ASC`)
  .limit(10);

  return (
    <div className="flex-1 bg-slate-100 p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">إدارة المصروفات والأقساط</h1>
          <p className="text-sm text-slate-500">تسجيل المصروفات اليومية ومتابعة الديون والالتزامات</p>
        </div>
        <Link href="/" className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition">
          الرئيسية
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* نموذج إضافة مصروف جديد */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">إضافة مصروف جديد</h3>
          <form action={async (formData: FormData) => {
            'use server';
            const name = formData.get('name') as string;
            const category = formData.get('category') as string;
            const amount = Number(formData.get('amount'));
            const paymentMethod = formData.get('paymentMethod') as string;
            const notes = formData.get('notes') as string;

            if (!name || !amount || amount <= 0) return;
            await createExpense({ name, category, amount, paymentMethod, notes });
          }} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">اسم المصروف أو البيان</label>
              <input type="text" name="name" required placeholder="مثال: فاتورة الكهرباء" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">التصنيف</label>
                <select name="category" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                  <option value="كهرباء">كهرباء</option>
                  <option value="مياه">مياه</option>
                  <option value="صيانة">صيانة</option>
                  <option value="رواتب">رواتب</option>
                  <option value="مشتريات">مشتريات</option>
                  <option value="نقل">نقل</option>
                  <option value="إيجار">إيجار</option>
                  <option value="أخرى">مصروفات أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">المبلغ (ج.م)</label>
                <input type="number" step="0.01" name="amount" required placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">طريقة الدفع</label>
              <select name="paymentMethod" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                <option value="نقدي">نقدي (كاش)</option>
                <option value="تحويل">تحويل إلكتروني / فودافون كاش</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl text-sm font-semibold transition shadow-sm">
              حفظ المصروف وخصمه من أرباح اليوم
            </button>
          </form>
        </div>

        {/* قسم إدارة الأقساط القادمة */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">الأقساط المستحقة القادمة</h3>
          <div className="space-y-3 max-h-[380px] overflow-y-auto">
            {activeInstallments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">لا توجد أقساط مستحقة حالياً</p>
            ) : (
              activeInstallments.map((inst) => (
                <div key={inst.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{inst.creditorName}</h4>
                    <span className="text-xs text-slate-500">ميعاد الاستحقاق: {new Date(inst.dueDate).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-amber-600 text-sm">{parseFloat(inst.amount).toFixed(2)} ج.م</span>
                    <form action={async () => {
                      'use server';
                      await payInstallment(inst.id);
                    }}>
                      <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                        تسديد
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* جدول المصروفات المسجلة حديثاً */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">سجل المصروفات الحديثة</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4">البيان</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4">المبلغ</th>
                <th className="p-4">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {expensesList.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">{exp.name}</td>
                  <td className="p-4"><span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs">{exp.category}</span></td>
                  <td className="p-4 font-bold text-red-500">{parseFloat(exp.amount).toFixed(2)} ج.م</td>
                  <td className="p-4 text-slate-500">{new Date(exp.date).toLocaleDateString('ar-EG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}