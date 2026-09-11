// app/actions/profits.ts
'use server';

import { db } from '@/db';
import { dailyProfits, expenses } from '@/db/schema';
import { eq, and, sql, gte, lte } from 'drizzle-orm';
import { logAction } from '@/services/logger';
import { cookies } from 'next/headers';
import { calculateNetProfit, roundCurrency } from '@/services/calculations';

interface DailyRevenueInput {
  date: string;
  buffetProfit: number;
  iceCreamProfit: number;
  billiardProfit: number;
  playstationProfit: number;
  barberProfit: number;
  otherProfit: number;
}

export async function upsertDailyProfits(data: DailyRevenueInput) {
  try {
    const sessionCookie = cookies().get('buffet_session_token');
    if (!sessionCookie) throw new Error('يجب تسجيل الدخول');
    const user = JSON.parse(sessionCookie.value);

    if (user.role !== 'ADMIN') {
      throw new Error('تسجيل وتعديل الأرباح مخصص للـ Admin فقط');
    }

    const profitDate = new Date(data.date);
    profitDate.setHours(0, 0, 0, 0);

    // حساب إجمالي الإيرادات
    const totalRevenue = roundCurrency(
      data.buffetProfit +
      data.iceCreamProfit +
      data.billiardProfit +
      data.playstationProfit +
      data.barberProfit +
      data.otherProfit
    );

    // جلب المصروفات المسجلة لنفس اليوم تلقائياً
    const dayExpensesList = await db.select().from(expenses).where(
      and(
        eq(expenses.date, profitDate),
        sql`${expenses.deletedAt} IS NULL`
      )
    );

    const totalExpenses = roundCurrency(
      dayExpensesList.reduce((acc, curr) => acc + parseFloat(curr.amount), 0)
    );

    const netProfit = calculateNetProfit(totalRevenue, totalExpenses);

    // التحقق هل يوجد سجل سابق لنفس اليوم لتحديثه أو إضافته
    const [existingRecord] = await db.select().from(dailyProfits).where(eq(dailyProfits.date, profitDate)).limit(1);

    let result;
    if (existingRecord) {
      [result] = await db.update(dailyProfits)
        .set({
          buffetProfit: data.buffetProfit.toString(),
          iceCreamProfit: data.iceCreamProfit.toString(),
          billiardProfit: data.billiardProfit.toString(),
          playstationProfit: data.playstationProfit.toString(),
          barberProfit: data.barberProfit.toString(),
          otherProfit: data.otherProfit.toString(),
          totalExpenses: totalExpenses.toString(),
          netProfit: netProfit.toString(),
        })
        .where(eq(dailyProfits.id, existingRecord.id))
        .returning();
    } else {
      [result] = await db.insert(dailyProfits).values({
        date: profitDate,
        buffetProfit: data.buffetProfit.toString(),
        iceCreamProfit: data.iceCreamProfit.toString(),
        billiardProfit: data.billiardProfit.toString(),
        playstationProfit: data.playstationProfit.toString(),
        barberProfit: data.barberProfit.toString(),
        otherProfit: data.otherProfit.toString(),
        totalExpenses: totalExpenses.toString(),
        netProfit: netProfit.toString(),
      }).returning();
    }

    await logAction({
      userId: user.id,
      action: 'UPSERT_DAILY_PROFITS',
      tableName: 'daily_profits',
      recordId: result.id,
      newValues: data,
    });

    return { success: true, netProfit };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}