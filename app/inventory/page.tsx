// app/inventory/page.tsx
import { db } from '@/db';
import { products, inventoryCounts, inventoryItems } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { submitDailyInventory } from '@/app/actions/inventory';

export default async function InventoryPage() {
  const sessionCookie = cookies().get('buffet_session_token');
  const user = sessionCookie ? JSON.parse(sessionCookie.value) : null;

  // جلب كافة الأصناف الفعالة لإجراء الجرد
  const activeProducts = await db.select().from(products).where(eq(products.isActive, true));

  // جلب سجل آخر عمليات الجرد السابقة
  const pastInventories = await db.select({
    id: inventoryCounts.id,
    date: inventoryCounts.date,
    totalValue: inventoryCounts.totalValue,
  }).from(inventoryCounts).orderBy(sql`${inventoryCounts.date} DESC`).limit(5);

  return (
    <div className="flex-1 bg-slate-100 p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">الجرد اليومي للمخزون</h1>
          <p className="text-sm text-slate-500">حساب قيمة البضاعة الفعلية عبر العبوات الكاملة والقطع المفتوحة</p>
        </div>
        <Link href="/" className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition">
          الرئيسية
        </Link>
      </div>

      {/* نموذج إدخال الجرد اليومي */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4">إدخال جرد اليوم</h3>
        
        <form action={async (formData: FormData) => {
          'use server';
          // جمع البيانات المدخلة لكل صنف من النموذج
          const itemsMap: Record<number, { fullBoxes: number; looseItems: number }> = {};

          for (const [key, value] of formData.entries()) {
            if (key.startsWith('boxes_')) {
              const productId = Number(key.replace('boxes_', ''));
              if (!itemsMap[productId]) itemsMap[productId] = { fullBoxes: 0, looseItems: 0 };
              itemsMap[productId].fullBoxes = Number(value) || 0;
            }
            if (key.startsWith('loose_')) {
              const productId = Number(key.replace('loose_', ''));
              if (!itemsMap[productId]) itemsMap[productId] = { fullBoxes: 0, looseItems: 0 };
              itemsMap[productId].looseItems = Number(value) || 0;
            }
          }

          const itemsArray = Object.entries(itemsMap).map(([productId, data]) => ({
            productId: Number(productId),
            fullBoxes: data.fullBoxes,
            looseItems: data.looseItems,
          })).filter(item => item.fullBoxes > 0 || item.looseItems > 0);

          if (itemsArray.length === 0) return;

          await submitDailyInventory(itemsArray);
        }} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProducts.map((p) => (
              <div key={p.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                  <span className="text-xs bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full font-semibold">
                    العلبة = {p.itemsPerBox} قطعة
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">العلب الكاملة</label>
                    <input 
                      type="number" 
                      name={`boxes_${p.id}`} 
                      min="0" 
                      defaultValue="0" 
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-sm text-center font-bold focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">القطع المفتوحة</label>
                    <input 
                      type="number" 
                      name={`loose_${p.id}`} 
                      min="0" 
                      max={p.itemsPerBox - 1} 
                      defaultValue="0" 
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-sm text-center font-bold focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition shadow-sm">
            حفظ واعتماد الجرد وحساب قيمة المخزون
          </button>
        </form>
      </div>

      {/* سجل الجرد السابق */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">سجل عمليات الجرد السابقة</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4">رقم الجرد</th>
                <th className="p-4">التاريخ</th>
                <th className="p-4">إجمالي قيمة المخزون</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {pastInventories.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-purple-600">INV-CNT-{inv.id}</td>
                  <td className="p-4">{new Date(inv.date).toLocaleDateString('ar-EG')}</td>
                  <td className="p-4 font-bold text-slate-900">{parseFloat(inv.totalValue).toFixed(2)} ج.م</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}