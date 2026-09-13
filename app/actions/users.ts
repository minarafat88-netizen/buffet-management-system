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
export async function createUser(formData: { username: string; password: string; role: string }) {
  try {
    const admin = await getAdminUser();
    const username = formData.username?.trim();
    if (!username || username.length < 3) throw new Error('اسم المستخدم يجب أن يحتوي على 3 أحرف على الأقل');
    if (!formData.password || formData.password.length < 6) throw new Error('كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل');
    if (formData.role !== 'ADMIN' && formData.role !== 'USER') throw new Error('دور المستخدم غير صالح');

    // تشفير كلمة المرور لأمان تام
    const hashedPassword = await bcrypt.hash(formData.password, 10);

    const [newUser] = await db.insert(users).values({
      username,
      passwordHash: hashedPassword,
      role: formData.role,
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
    if (!Number.isInteger(userId) || typeof newStatus !== 'boolean') throw new Error('بيانات حالة المستخدم غير صالحة');
    if (userId === admin.id && !newStatus) throw new Error('لا يمكن تعطيل حسابك الحالي');

    const [updatedUser] = await db.update(users)
      .set({ isActive: newStatus })
      .where(eq(users.id, userId))
      .returning();
    if (!updatedUser) throw new Error('المستخدم غير موجود');

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