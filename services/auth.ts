import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function verifyUserCredentials(username: string, passwordPlain: string) {
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

  if (!user || !user.isActive) {
    throw new Error('اسم المستخدم غير صحيح أو الحساب معطل');
  }

  const isValidPassword = await bcrypt.compare(passwordPlain, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('كلمة المرور غير صحيحة');
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}