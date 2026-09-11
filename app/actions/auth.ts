// app/actions/auth.ts
'use server';

import { verifyUserCredentials } from '@/services/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logAction } from '@/services/logger';
import { createSessionToken, SESSION_COOKIE } from '@/services/session';

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  try {
    const user = await verifyUserCredentials(username, password);
    
    cookies().set(SESSION_COOKIE, await createSessionToken(user), {
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
  cookies().delete(SESSION_COOKIE);
  redirect('/login');
}