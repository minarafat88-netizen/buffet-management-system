// app/actions/products.ts
'use server';

import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logAction } from '@/services/logger';
import { cookies } from 'next/headers';
import { getSessionUser } from '@/services/session';

// التحقق من صلاحية Admin
async function verifyAdminSession() {
  const user = await getSessionUser();
  if (!user) throw new Error('غير مسجل الدخول');
  if (user.role !== 'ADMIN') {
    throw new Error('عفواً، هذه العملية مخصصة للـ Admin فقط');
  }
  return user;
}

export async function createProduct(formData: {
  name: string;
  itemsPerBox: number;
  buyPriceBox: number;
  sellPriceBox: number;
}) {
  try {
    const admin = await verifyAdminSession();

    if (!formData.name?.trim()) throw new Error('اسم المنتج مطلوب');
    if (!Number.isInteger(formData.itemsPerBox) || formData.itemsPerBox <= 0) {
      throw new Error('عدد القطع في العلبة يجب أن يكون عددًا صحيحًا أكبر من صفر');
    }
    if (!Number.isFinite(formData.buyPriceBox) || formData.buyPriceBox < 0) {
      throw new Error('سعر الشراء غير صالح');
    }
    if (!Number.isFinite(formData.sellPriceBox) || formData.sellPriceBox < 0) {
      throw new Error('سعر البيع غير صالح');
    }

    const [newProduct] = await db.insert(products).values({
      name: formData.name,
      itemsPerBox: formData.itemsPerBox,
      buyPriceBox: formData.buyPriceBox.toString(),
      sellPriceBox: formData.sellPriceBox.toString(),
      isActive: true,
    }).returning();

    await logAction({
      userId: admin.id,
      action: 'ADD_PRODUCT',
      tableName: 'products',
      recordId: newProduct.id,
      newValues: formData,
    });

    return { success: true, product: newProduct };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}