// app/actions/debts.ts
'use server';

import { db } from '@/db';
import { debts, installments, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

    // إدخال الدين الرئيسي
    const [newDebt] = await db.insert(debts).values({
      creditorName: data.creditorName,
      phone: data.phone || null,
      totalAmount: data.totalAmount.toString(),
      remainingAmount: data.totalAmount.toString(),
      notes: data.notes || null,
      status: 'ACTIVE',
    }).returning();

    // توليد وجدولة الأقساط تلقائياً بناءً على التاريخ والقيمة
    const baseDate = new Date(data.firstDueDate);
    
    for (let i = 1; i <= data.installmentsCount; i++) {
      // حساب تاريخ الاستحقاق لكل قسط (إضافة شهور متتالية)
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));

      await db.insert(installments).values({
        debtId: newDebt.id,
        amount: data.installmentAmount.toString(),
        dueDate: dueDate,
        status: 'PENDING',
      });
    }

    // تسجيل العملية في Audit Log للرقابة
    await db.insert(auditLogs).values({
      userId: admin.id,
      action: 'CREATE_DEBT',
      tableName: 'debts',
      recordId: newDebt.id,
      newValues: { creditorName: data.creditorName, totalAmount: data.totalAmount, installmentsCount: data.installmentsCount },
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

    // تحديث حالة القسط إلى مدفوع
    await db.update(installments)
      .set({ status: 'PAID', paidAt: new Date() })
      .where(eq(installments.id, installmentId));

    // جلب القسط لمعرفة قيمته وتحديث إجمالي المتبقي في الدين
    const [inst] = await db.select().from(installments).where(eq(installments.id, installmentId));
    const [debt] = await db.select().from(debts).where(eq(debts.id, debtId));

    if (debt && inst) {
      const currentRemaining = parseFloat(debt.remainingAmount);
      const paidAmount = parseFloat(inst.amount);
      const newRemaining = Math.max(0, currentRemaining - paidAmount);

      await db.update(debts)
        .set({ 
          remainingAmount: newRemaining.toString(),
          status: newRemaining === 0 ? 'COMPLETED' : 'ACTIVE',
        })
        .where(eq(debts.id, debtId));
    }

    // تسجيل العملية في الـ Audit Log
    await db.insert(auditLogs).values({
      userId: admin.id,
      action: 'PAY_INSTALLMENT',
      tableName: 'installments',
      recordId: installmentId,
      newValues: { debtId, status: 'PAID' },
    });

    revalidatePath('/debts');
    return { success: true };
  } catch (error: any) {
    console.error('Error paying installment:', error);
    return { success: false, error: error.message };
  }
}