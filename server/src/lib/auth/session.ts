import { SignJWT, jwtVerify } from 'jose';

import { hashToken } from './crypto';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET or AUTH_SECRET must be set');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getJwtSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const userId = payload.sub;

    if (!userId || typeof userId !== 'string') {
      return null;
    }

    return { userId };
  } catch {
    return null;
  }
}

export function getSessionExpiry(): Date {
  return new Date(Date.now() + SESSION_TTL_MS);
}

export function getTokenHash(token: string): string {
  return hashToken(token);
}
