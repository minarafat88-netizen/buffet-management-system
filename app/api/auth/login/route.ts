// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { createSessionToken, SESSION_COOKIE } from '@/services/session';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'الرجاء إدخال اسم المستخدم وكلمة المرور' }, { status: 400 });
    }

    // البحث عن المستخدم في قاعدة البيانات
    const [user] = await db.select().from(users).where(eq(users.username, username));

    if (!user || !user.isActive) {
      return NextResponse.json({ message: 'اسم المستخدم غير موجود أو الحساب معطل' }, { status: 401 });
    }

    // التحقق من صحة كلمة المرور المشفرة
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }

    // إنشاء جلسة صالحة وتوقيعها بنفس طريقة الـ middleware
    const sessionData = await createSessionToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    cookies().set(SESSION_COOKIE, sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'حدث خطأ داخلي في الخادم' }, { status: 500 });
  }
}