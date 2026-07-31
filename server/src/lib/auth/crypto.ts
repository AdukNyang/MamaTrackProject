import { createHash, timingSafeEqual } from 'node:crypto';

export async function hashPassword(password: string): Promise<string> {
  return createHash('sha256').update(password).digest('hex');
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const computed = await hashPassword(password);
  const left = Buffer.from(computed);
  const right = Buffer.from(hash);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateOtpCode(): string {
  const value = Math.floor(Math.random() * 100_000);
  return String(value).padStart(5, '0');
}
