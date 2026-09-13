import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

export interface SessionUser {
  id: number;
  username: string;
  role: string;
}

const SESSION_COOKIE = 'buffet_session_token';
const encoder = new TextEncoder();

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET غير مضبوط في متغيرات البيئة');
  }
  return secret;
}

function toBase64Url(value: ArrayBuffer | string) {
  const bytes = typeof value === 'string' ? encoder.encode(value) : new Uint8Array(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  return atob(normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '='));
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

async function signaturesMatch(left: string, right: string) {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  if (leftBytes.length !== rightBytes.length) return false;
  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }
  return difference === 0;
}

export async function createSessionToken(user: SessionUser) {
  const payload = toBase64Url(JSON.stringify(user));
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(token?: string): Promise<SessionUser | null> {
  if (!token) return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  try {
    const expectedSignature = await sign(payload);
    if (!(await signaturesMatch(signature, expectedSignature))) return null;

    const user = JSON.parse(fromBase64Url(payload)) as SessionUser;
    if (!Number.isInteger(user.id) || !user.username || !user.role) return null;
    return user;
  } catch {
    return null;
  }
}

export async function getSessionUserFromToken(token?: string) {
  const tokenUser = await verifySessionToken(token);
  if (!tokenUser) return null;

  const [currentUser] = await db
    .select({ id: users.id, username: users.username, role: users.role, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, tokenUser.id))
    .limit(1);

  if (!currentUser?.isActive) return null;
  return { id: currentUser.id, username: currentUser.username, role: currentUser.role };
}

export async function getSessionUser() {
  return getSessionUserFromToken(cookies().get(SESSION_COOKIE)?.value);
}

export { SESSION_COOKIE };
