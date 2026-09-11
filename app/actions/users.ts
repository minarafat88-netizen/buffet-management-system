// app/actions/users.ts
'use server';

import { db } from '@/db';
import { users, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/services/session';

// دالة للتحقق من أن المستخدم الحالي هو Admin
async function getAdminUser() {
  const user = await getSessionUser();
  if (!user) throw new Error('غير مصرح بالوصول');
  if (user.role !== 'ADMIN') throw new Error('صلاحيات غير كافية');
  return user;
}

// 1. إنشاء مستخدم جديد
export async function createUser(formData: { username: string; password; role: string }) {
  try {
    const admin = await getAdminUser();

    // تشفير كلمة المرور لأمان تام
    const hashedPassword = await bcrypt.hash(formData.password, 10);

    const [newUser] = await db.insert(users).values({
      username: formData.username,
      passwordHash: hashedPassword,
      role: formData.role || 'USER',
      isActive: true,
    }).returning();

    // تسجيل العملية في Audit Log للرقابة
    await db.insert(auditLogs).values({
      userId: admin.id,
      action: 'CREATE_USER',
      tableName: 'users',
      recordId: newUser.id,
      newValues: { username: newUser.username, role: newUser.role },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
}

// 2. تفعيل أو تعطيل حساب مستخدم
export async function toggleUserStatus(userId: number, newStatus: boolean) {
  try {
    const admin = await getAdminUser();

    const [updatedUser] = await db.update(users)
      .set({ isActive: newStatus })
      .where(eq(users.id, userId))
      .returning();

    // تسجيل العملية في Audit Log
    await db.insert(auditLogs).values({
      userId: admin.id,
      action: newStatus ? 'ACTIVATE_USER' : 'DISABLE_USER',
      tableName: 'users',
      recordId: userId,
      newValues: { isActive: newStatus },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling user status:', error);
    return { success: false, error: error.message };
  }
}