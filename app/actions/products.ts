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