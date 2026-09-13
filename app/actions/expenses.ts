// app/actions/expenses.ts
'use server';

import { db } from '@/db';
import { expenses, dailyProfits } from '@/db/schema';
import { eq, and, gte, lt, sql } from 'drizzle-orm';
import { logAction } from '@/services/logger';
import { cookies } from 'next/headers';
import { getSessionUser } from '@/services/session';

interface ExpenseInput {
  name: string;
  category: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  date?: string;
}

export async function createExpense(data: ExpenseInput) {
  try {
    const user = await getSessionUser();
    if (!user) throw new Error('يجب تسجيل الدخول');
    if (!data.name?.trim() || !data.category?.trim() || !data.paymentMethod?.trim()) {
      throw new Error('بيانات المصروف الأساسية مطلوبة');
    }
    if (!Number.isFinite(data.amount) || data.amount <= 0) {
      throw new Error('قيمة المصروف يجب أن تكون أكبر من صفر');
    }

    const expenseDate = data.date ? new Date(data.date) : new Date();
    if (Number.isNaN(expenseDate.getTime())) throw new Error('تاريخ المصروف غير صالح');
    // إزالة الوقت للمقارنة اليومية
    expenseDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(expenseDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const result = await db.transaction(async (tx) => {
      // 1. إدخال المصروف
      const [newExpense] = await tx.insert(expenses).values({
        name: data.name,
        category: data.category,
        amount: data.amount.toString(),
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        date: expenseDate,
      }).returning();

      // 2. تحديث إجمالي المصروفات وصافي الربح في جدول الأرباح اليومية لنفس اليوم إن وجد
      const [existingProfitRecord] = await tx.select().from(dailyProfits).where(
        and(gte(dailyProfits.date, expenseDate), lt(dailyProfits.date, nextDay))
      ).limit(1);

      if (existingProfitRecord) {
        await tx.update(dailyProfits)
          .set({
            totalExpenses: sql`${dailyProfits.totalExpenses} + ${data.amount}`,
            netProfit: sql`ROUND(
              ${dailyProfits.buffetProfit} + ${dailyProfits.iceCreamProfit} +
              ${dailyProfits.billiardProfit} + ${dailyProfits.playstationProfit} +
              ${dailyProfits.barberProfit} + ${dailyProfits.otherProfit} -
              (${dailyProfits.totalExpenses} + ${data.amount}), 2
            )`,
          })
          .where(eq(dailyProfits.id, existingProfitRecord.id));
      }

      return newExpense;
    });

    await logAction({
      userId: user.id,
      action: 'ADD_EXPENSE',
      tableName: 'expenses',
      recordId: result.id,
      newValues: data,
    });

    return { success: true, expense: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}