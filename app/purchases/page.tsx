// app/purchases/page.tsx
import { db } from '@/db';
import { products, purchaseInvoices, purchaseInvoiceItems } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { createPurchaseInvoice } from '@/app/actions/purchases';
import { getSessionUser } from '@/services/session';

export default async function PurchasesPage() {
  const user = await getSessionUser();

  // جلب الأصناف الفعالة للاختيار منها
  const activeProducts = await db.select().from(products).where(eq(products.isActive, true));

  // جلب سجل الفواتير السابقة
  const invoicesList = await db.select({
    id: purchaseInvoices.id,
    invoiceNumber: purchaseInvoices.invoiceNumber,
    date: purchaseInvoices.date,
    totalAmount: purchaseInvoices.totalAmount,
  }).from(purchaseInvoices).orderBy(sql`${purchaseInvoices.date} DESC`).limit(10);

  return (
    <div className="flex-1 bg-slate-100 p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">إدارة فواتير الشراء</h1>
          <p className="text-sm text-slate-500">إدخال المشتريات الجديدة وتجميد الأسعار التاريخية</p>
        </div>
        <Link href="/" className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition">
          الرئيسية
        </Link>
      </div>

      {/* نموذج إدخال فاتورة جديدة */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4">تسجيل فاتورة شراء جديدة</h3>
        
        <form action={async (formData: FormData) => {
          'use server';
          const productId = Number(formData.get('productId'));
          const quantity = Number(formData.get('quantity'));
          
          if (!productId || !quantity || quantity <= 0) return;
          
          await createPurchaseInvoice([{ productId, quantity }]);
        }} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">اختر الصنف</label>
            <select name="productId" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500">
              <option value="">-- اختر المنتج --</option>
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (شراء العلبة: {p.buyPriceBox} ج.م)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">الكمية (عدد العلب)</label>
            <input 
              type="number" 
              name="quantity" 
              min="1" 
              defaultValue="1" 
              required 
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl text-sm font-semibold transition shadow-sm">
            حفظ وإصدار الفاتورة
          </button>
        </form>
      </div>

      {/* جدول الفواتير السابقة */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">أحدث فواتير الشراء المسجلة</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4">رقم الفاتورة</th>
                <th className="p-4">التاريخ</th>
                <th className="p-4">إجمالي المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {invoicesList.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-blue-600">{inv.invoiceNumber}</td>
                  <td className="p-4">{new Date(inv.date).toLocaleDateString('ar-EG')}</td>
                  <td className="p-4 font-bold text-slate-900">{parseFloat(inv.totalAmount).toFixed(2)} ج.م</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}