import { ConvexError } from 'convex/values';

import { OTP_LENGTH } from '@/constants/auth';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Enter your email address.': 'Enter your email address.',
  'Enter a valid email address.': 'Enter a valid email address.',
  'Enter your password.': 'Enter your password.',
  'Invalid credentials': 'Incorrect email or password.',
  'Invalid code': 'That verification code is incorrect or expired.',
  'Could not verify code': 'That verification code is incorrect or expired.',
  'Registration is disabled.': 'New accounts cannot be created. Contact your supervisor.',
  'Invalid password': 'Password must be at least 8 characters.',
  'Missing environment variable `JWT_PRIVATE_KEY`':
    'Sign-in is not fully configured yet. Run `npm run convex:auth:keys` on the server.',
};

function extractFromErrorMessage(message: string): string | null {
  const envMatch = message.match(/Missing environment variable `[^`]+`/);
  if (envMatch?.[0]) {
    return envMatch[0];
  }

  const convexErrorMatch = message.match(/Uncaught ConvexError: ([^\n]+)/);
  if (convexErrorMatch?.[1]) {
    return convexErrorMatch[1].trim();
  }

  const uncaughtErrors = [...message.matchAll(/Uncaught Error: ([^\n]+)/g)];
  const lastUncaughtError = uncaughtErrors.at(-1)?.[1]?.trim();
  if (lastUncaughtError) {
    return lastUncaughtError;
  }

  const prefixedMatch = message.match(/\[CONVEX [^\]]+\]\s+([^\n]+)/);
  if (prefixedMatch?.[1]) {
    const raw = prefixedMatch[1].replace(/^Server Error\s*/i, '').trim();
    if (raw.startsWith('Uncaught ConvexError: ')) {
      return raw.slice('Uncaught ConvexError: '.length).trim();
    }
    if (raw) {
      return raw;
    }
  }

  return null;
}

export function getConvexErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Try again.',
): string {
  if (error instanceof ConvexError) {
    if (typeof error.data === 'string') {
      return AUTH_ERROR_MESSAGES[error.data] ?? error.data;
    }
  }

  if (error instanceof Error) {
    const extracted = extractFromErrorMessage(error.message);
    if (extracted) {
      return AUTH_ERROR_MESSAGES[extracted] ?? extracted;
    }

    if (error.message && !error.message.startsWith('[CONVEX ')) {
      return AUTH_ERROR_MESSAGES[error.message] ?? error.message;
    }
  }

  return fallback;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateLoginCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return { emailError: 'Enter your email address.' };
  }

  if (!isValidEmail(normalizedEmail)) {
    return { emailError: 'Enter a valid email address.' };
  }

  if (!password) {
    return { passwordError: 'Enter your password.' };
  }

  return { normalizedEmail };
}

export function validateVerificationCode(code: string) {
  const trimmedCode = code.trim();

  if (!trimmedCode) {
    return { codeError: 'Enter the verification code from your email.' };
  }

  if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(trimmedCode)) {
    return { codeError: `Enter the ${OTP_LENGTH}-digit code from your email.` };
  }

  return { trimmedCode };
}
