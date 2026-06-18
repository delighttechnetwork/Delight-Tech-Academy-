import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-development-only-12345'
);

export async function createSession(userId: string) {
  const jwt = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set('delight_session', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
}

export async function getSessionUserId() {
  const cookieStore = await cookies();
  const session = cookieStore.get('delight_session')?.value;
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, secret);
    return payload.userId as string;
  } catch (err) {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.set('delight_session', '', { maxAge: 0, path: '/' });
}
