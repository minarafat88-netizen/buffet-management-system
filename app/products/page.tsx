// app/products/page.tsx
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { calculateBoxProfit, calculateUnitPrices, calculateProfitPercentage } from '@/services/calculations';

export default async function ProductsPage() {
  const allProducts = await db.select().from(products).where(eq(products.isActive, true));

  return (
    <div className="flex-1 bg-slate-100 p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">قائمة الأصناف والأسعار</h1>
      </div>

      {/* عرض الجدول للكمبيوتر */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-auto min-w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="p-4">اسم الصنف</th>
              <th className="p-4">القطع/العلبة</th>
              <th className="p-4">شراء العلبة</th>
              <th className="p-4">بيع العلبة</th>
              <th className="p-4">ربح العلبة</th>
              <th className="p-4">شراء القطعة</th>
              <th className="p-4">بيع القطعة</th>
              <th className="p-4">ربح القطعة</th>
              <th className="p-4">نسبة الربح</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {allProducts.map((p) => {
              const buyBox = parseFloat(p.buyPriceBox);
              const sellBox = parseFloat(p.sellPriceBox);
              const boxProfit = calculateBoxProfit(buyBox, sellBox);
              const units = calculateUnitPrices(buyBox, sellBox, p.itemsPerBox);
              const profitPct = calculateProfitPercentage(buyBox, boxProfit);

              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-800">{p.name}</td>
                  <td className="p-4">{p.itemsPerBox}</td>
                  <td className="p-4">{buyBox.toFixed(2)} ج.م</td>
                  <td className="p-4">{sellBox.toFixed(2)} ج.م</td>
                  <td className="p-4 text-emerald-600 font-semibold">{boxProfit.toFixed(2)} ج.م</td>
                  <td className="p-4">{units.buyPricePiece.toFixed(2)} ج.م</td>
                  <td className="p-4">{units.sellPricePiece.toFixed(2)} ج.م</td>
                  <td className="p-4 text-emerald-600 font-semibold">{units.pieceProfit.toFixed(2)} ج.م</td>
                  <td className="p-4 font-bold text-blue-600">{profitPct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* عرض البطاقات للهاتف (Mobile First) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {allProducts.map((p) => {
          const buyBox = parseFloat(p.buyPriceBox);
          const sellBox = parseFloat(p.sellPriceBox);
          const boxProfit = calculateBoxProfit(buyBox, sellBox);
          const units = calculateUnitPrices(buyBox, sellBox, p.itemsPerBox);
          const profitPct = calculateProfitPercentage(buyBox, boxProfit);

          return (
            <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-800 text-base">{p.name}</h3>
                <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-semibold">
                  {p.itemsPerBox} قطع للعلبة
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-100 pt-2">
                <div>شراء العلبة: <span className="font-bold text-slate-900">{buyBox.toFixed(2)} ج.م</span></div>
                <div>بيع العلبة: <span className="font-bold text-slate-900">{sellBox.toFixed(2)} ج.م</span></div>
                <div>ربح العلبة: <span className="font-bold text-emerald-600">{boxProfit.toFixed(2)} ج.م</span></div>
                <div>نسبة الربح: <span className="font-bold text-blue-600">{profitPct}%</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}