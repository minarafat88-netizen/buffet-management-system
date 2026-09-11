// app/actions/purchases.ts
'use server';

import { db } from '@/db';
import { purchaseInvoices, purchaseInvoiceItems, products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logAction } from '@/services/logger';
import { cookies } from 'next/headers';
import { calculateBoxProfit, calculateUnitPrices, roundCurrency } from '@/services/calculations';

interface PurchaseItemInput {
  productId: number;
  quantity: number; // عدد العلب
}

export async function createPurchaseInvoice(items: PurchaseItemInput[]) {
  try {
    const sessionCookie = cookies().get('buffet_session_token');
    if (!sessionCookie) throw new Error('يجب تسجيل الدخول أولاً');
    const user = JSON.parse(sessionCookie.value);

    if (!items || items.length === 0) {
      throw new Error('فشلت العملية: لا توجد أصناف في الفاتورة');
    }

    // توليد رقم فاتورة فريد بناءً على الوقت الحالي
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

    let totalInvoiceAmount = 0;
    const invoiceItemsData: any[] = [];

    // جلب الأسعار الحالية لتجميدها (Snapshot) في الفاتورة
    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
      
      if (!product || !product.isActive) {
        throw new Error(`الصنف غير موجود أو معطل`);
      }

      const buyPrice = parseFloat(product.buyPriceBox);
      const sellPrice = parseFloat(product.sellPriceBox);
      const rowTotal = roundCurrency(buyPrice * item.quantity);
      totalInvoiceAmount += rowTotal;

      invoiceItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        buyPriceAtTime: product.buyPriceBox,
        sellPriceAtTime: product.sellPriceBox,
        itemsPerBoxAtTime: product.itemsPerBox,
      });
    }

    totalInvoiceAmount = roundCurrency(totalInvoiceAmount);

    // تنفيذ العملية داخل Transaction لضمان سلامة قاعدة البيانات
    const result = await db.transaction(async (tx) => {
      // 1. إنشاء الفاتورة الرئيسية
      const [newInvoice] = await tx.insert(purchaseInvoices).values({
        invoiceNumber,
        totalAmount: totalInvoiceAmount.toString(),
        userId: user.id,
      }).returning();

      // 2. إدخال بنود الفاتورة مع الأسعار المجمدة
      for (const row of invoiceItemsData) {
        await tx.insert(purchaseInvoiceItems).values({
          invoiceId: newInvoice.id,
          ...row,
        });
      }

      return newInvoice;
    });

    // تسجيل العملية في Audit Log
    await logAction({
      userId: user.id,
      action: 'ADD_PURCHASE_INVOICE',
      tableName: 'purchase_invoices',
      recordId: result.id,
      newValues: { invoiceNumber, totalAmount: totalInvoiceAmount, itemsCount: items.length },
    });

    return { success: true, invoiceId: result.id, invoiceNumber };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}