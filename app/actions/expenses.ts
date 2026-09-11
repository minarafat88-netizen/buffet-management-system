// app/actions/expenses.ts
'use server';

import { db } from '@/db';
import { expenses, dailyProfits } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { logAction } from '@/services/logger';
import { cookies } from 'next/headers';
import { calculateNetProfit } from '@/services/calculations';

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
    const sessionCookie = cookies().get('buffet_session_token');
    if (!sessionCookie) throw new Error('يجب تسجيل الدخول');
    const user = JSON.parse(sessionCookie.value);

    const expenseDate = data.date ? new Date(data.date) : new Date();
    // إزالة الوقت للمقارنة اليومية
    expenseDate.setHours(0, 0, 0, 0);

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
      const [existingProfitRecord] = await tx.select().from(dailyProfits).where(eq(dailyProfits.date, expenseDate)).limit(1);

      if (existingProfitRecord) {
        const currentExpenses = parseFloat(existingProfitRecord.totalExpenses) + data.amount;
        const totalRevenue = 
          parseFloat(existingProfitRecord.buffetProfit) +
          parseFloat(existingProfitRecord.iceCreamProfit) +
          parseFloat(existingProfitRecord.billiardProfit) +
          parseFloat(existingProfitRecord.playstationProfit) +
          parseFloat(existingProfitRecord.barberProfit) +
          parseFloat(existingProfitRecord.otherProfit);

        const newNetProfit = calculateNetProfit(totalRevenue, currentExpenses);

        await tx.update(dailyProfits)
          .set({
            totalExpenses: currentExpenses.toString(),
            netProfit: newNetProfit.toString(),
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