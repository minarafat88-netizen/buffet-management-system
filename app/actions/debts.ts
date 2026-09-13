// app/actions/debts.ts
'use server';

import { db } from '@/db';
import { debts, installments, auditLogs } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/services/session';

// دالة للتحقق من صلاحيات المدير (Admin)
async function getAdminUser() {
  const user = await getSessionUser();
  if (!user) throw new Error('غير مصرح بالوصول');
  if (user.role !== 'ADMIN') throw new Error('صلاحيات غير كافية لإدارة الديون');
  return user;
}

// 1. إنشاء دين جديد مع جدولة الأقساط تلقائياً
export async function createDebtWithInstallments(data: {
  creditorName: string;
  phone?: string;
  totalAmount: number;
  installmentsCount: number;
  installmentAmount: number;
  firstDueDate: string;
  notes?: string;
}) {
  try {
    const admin = await getAdminUser();

    if (!data.creditorName?.trim()) throw new Error('اسم الدائن مطلوب');
    if (!Number.isFinite(data.totalAmount) || data.totalAmount <= 0) throw new Error('إجمالي الدين غير صالح');
    if (!Number.isInteger(data.installmentsCount) || data.installmentsCount <= 0) throw new Error('عدد الأقساط غير صالح');
    if (!Number.isFinite(data.installmentAmount) || data.installmentAmount <= 0) throw new Error('قيمة القسط غير صالحة');
    if (Math.abs(data.installmentAmount * data.installmentsCount - data.totalAmount) > 0.005) {
      throw new Error('يجب أن يساوي مجموع الأقساط إجمالي الدين');
    }
    const baseDate = new Date(data.firstDueDate);
    if (Number.isNaN(baseDate.getTime())) throw new Error('تاريخ أول قسط غير صالح');

    const newDebt = await db.transaction(async (tx) => {
      const [createdDebt] = await tx.insert(debts).values({
        creditorName: data.creditorName.trim(),
        phone: data.phone || null,
        totalAmount: data.totalAmount.toString(),
        remainingAmount: data.totalAmount.toString(),
        notes: data.notes || null,
        status: 'ACTIVE',
      }).returning();

      for (let i = 1; i <= data.installmentsCount; i++) {
        const dueDate = new Date(baseDate);
        dueDate.setMonth(dueDate.getMonth() + (i - 1));
        await tx.insert(installments).values({
          debtId: createdDebt.id,
          amount: data.installmentAmount.toString(),
          dueDate,
          status: 'PENDING',
        });
      }

      await tx.insert(auditLogs).values({
        userId: admin.id,
        action: 'CREATE_DEBT',
        tableName: 'debts',
        recordId: createdDebt.id,
        newValues: { creditorName: data.creditorName, totalAmount: data.totalAmount, installmentsCount: data.installmentsCount },
      });
      return createdDebt;
    });

    revalidatePath('/debts');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating debt:', error);
    return { success: false, error: error.message };
  }
}

// 2. تسجيل سداد قسط محدد
export async function payInstallment(installmentId: number, debtId: number) {
  try {
    const admin = await getAdminUser();

    if (!Number.isInteger(installmentId) || !Number.isInteger(debtId)) throw new Error('معرف القسط أو الدين غير صالح');

    await db.transaction(async (tx) => {
      const [inst] = await tx.select().from(installments).where(
        and(eq(installments.id, installmentId), eq(installments.debtId, debtId), eq(installments.status, 'PENDING'))
      ).limit(1);
      const [debt] = await tx.select().from(debts).where(eq(debts.id, debtId)).limit(1);
      if (!inst || !debt) throw new Error('القسط غير موجود أو تمت تسويته مسبقًا');

      const [paidInstallment] = await tx.update(installments)
        .set({ status: 'PAID', paidAt: new Date() })
        .where(and(eq(installments.id, installmentId), eq(installments.status, 'PENDING')))
        .returning();
      if (!paidInstallment) throw new Error('تعذر تسجيل السداد، حاول مرة أخرى');

      const newRemaining = Math.max(0, parseFloat(debt.remainingAmount) - parseFloat(inst.amount));
      await tx.update(debts).set({
        remainingAmount: newRemaining.toString(),
        status: newRemaining === 0 ? 'COMPLETED' : 'ACTIVE',
      }).where(eq(debts.id, debtId));

      await tx.insert(auditLogs).values({
        userId: admin.id,
        action: 'PAY_INSTALLMENT',
        tableName: 'installments',
        recordId: installmentId,
        newValues: { debtId, status: 'PAID' },
      });
    });

    revalidatePath('/debts');
    return { success: true };
  } catch (error: any) {
    console.error('Error paying installment:', error);
    return { success: false, error: error.message };
  }
}