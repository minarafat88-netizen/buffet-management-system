// app/actions/inventory.ts
'use server';

import { db } from '@/db';
import { inventoryCounts, inventoryItems, products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logAction } from '@/services/logger';
import { cookies } from 'next/headers';
import { calculateInventoryItemValue, roundCurrency } from '@/services/calculations';
import { getSessionUser } from '@/services/session';

interface InventoryItemInput {
  productId: number;
  fullBoxes: number;
  looseItems: number;
}

export async function submitDailyInventory(items: InventoryItemInput[]) {
  try {
    const user = await getSessionUser();
    if (!user) throw new Error('يجب تسجيل الدخول');

    if (!items || items.length === 0) {
      throw new Error('لا توجد أصناف للجرد');
    }

    if (items.some((item) =>
      !Number.isInteger(item.productId) ||
      !Number.isInteger(item.fullBoxes) || item.fullBoxes < 0 ||
      !Number.isInteger(item.looseItems) || item.looseItems < 0
    )) {
      throw new Error('كميات الجرد يجب أن تكون أعدادًا صحيحة غير سالبة');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalInventoryValue = 0;
    const processedItems: Array<{
      productId: number;
      fullBoxes: number;
      looseItems: number;
      itemValue: string;
    }> = [];

    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
      if (!product || !product.isActive) continue;

      if (item.looseItems >= product.itemsPerBox) {
        throw new Error(`خطأ في صنف "${product.name}": عدد القطع المفتوحة لا يمكن أن يساوي أو يتجاوز عدد القطع في العلبة (${product.itemsPerBox})`);
      }

      const boxBuyPrice = parseFloat(product.buyPriceBox);
      const pieceBuyPrice = boxBuyPrice / product.itemsPerBox;

      const itemValue = calculateInventoryItemValue(
        item.fullBoxes,
        boxBuyPrice,
        item.looseItems,
        pieceBuyPrice
      );

      totalInventoryValue += itemValue;

      processedItems.push({
        productId: product.id,
        fullBoxes: item.fullBoxes,
        looseItems: item.looseItems,
        itemValue: itemValue.toString(),
      });
    }

    totalInventoryValue = roundCurrency(totalInventoryValue);

    const result = await db.transaction(async (tx) => {
      // حفظ رأس الجرد اليومي
      const [newCount] = await tx.insert(inventoryCounts).values({
        date: today,
        userId: user.id,
        totalValue: totalInventoryValue.toString(),
      }).returning();

      // حفظ تفاصيل الأصناف المجردة
      for (const row of processedItems) {
        await tx.insert(inventoryItems).values({
          inventoryCountId: newCount.id,
          ...row,
        });
      }

      return newCount;
    });

    await logAction({
      userId: user.id,
      action: 'SUBMIT_INVENTORY',
      tableName: 'inventory_counts',
      recordId: result.id,
      newValues: { totalValue: totalInventoryValue, itemsCount: items.length },
    });

    return { success: true, inventoryId: result.id, totalValue: totalInventoryValue };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}