import { ApiError } from '@/lib/api-client';

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong.',
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function validateLoginCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return { emailError: 'Enter your email address.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
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
    return { codeError: 'Enter the verification code.' };
  }

  if (!/^\d{8}$/.test(trimmedCode)) {
    return { codeError: 'Enter the 8-digit verification code.' };
  }

  return { trimmedCode };
}

// Backwards-compatible aliases for existing imports
export const getConvexErrorMessage = getApiErrorMessage;
