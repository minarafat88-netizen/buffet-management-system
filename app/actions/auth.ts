// app/actions/auth.ts
'use server';

import { verifyUserCredentials } from '@/services/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logAction } from '@/services/logger';

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  try {
    const user = await verifyUserCredentials(username, password);
    
    // إنشاء جلسة وهمية آمنة (أو استخدام JWT / NextAuth)
    cookies().set('buffet_session_token', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // أسبوع
      path: '/',
    });

    // تسجيل العملية في Audit Log
    await logAction({
      userId: user.id,
      action: 'LOGIN',
      tableName: 'users',
      recordId: user.id,
      newValues: { username: user.username, role: user.role }
    });

  } catch (error: any) {
    return { error: error.message || 'حدث خطأ أثناء تسجيل الدخول' };
  }

  redirect('/');
}

export async function logoutAction() {
  cookies().delete('buffet_session_token');
  redirect('/login');
}