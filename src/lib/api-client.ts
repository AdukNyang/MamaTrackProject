import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'mamatrack_auth_token';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000/api';

type ApiErrorBody = {
  error?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
  }

  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function setStoredToken(token: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    if (token) {
      globalThis.localStorage?.setItem(TOKEN_KEY, token);
    } else {
      globalThis.localStorage?.removeItem(TOKEN_KEY);
    }
    return;
  }

  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export async function getAuthToken() {
  return getStoredToken();
}

export async function setAuthToken(token: string | null) {
  await setStoredToken(token);
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  options?: { auth?: boolean },
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  if (options?.auth !== false) {
    const token = await getStoredToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const body = (await response.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!response.ok) {
    throw new ApiError(body.error ?? 'Request failed', response.status);
  }

  return body;
}

export const api = {
  auth: {
    signIn: (email: string, password: string) =>
      request<{ requiresVerification: boolean; signingIn: boolean }>(
        '/auth?action=sign-in',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
        { auth: false },
      ),
    verify: (email: string, code: string) =>
      request<{ signingIn: boolean; token: string }>(
        '/auth?action=verify',
        {
          method: 'POST',
          body: JSON.stringify({ email, code }),
        },
        { auth: false },
      ),
    signOut: () =>
      request<{ success: boolean }>('/auth?action=sign-out', {
        method: 'POST',
      }),
  },
  users: {
    viewer: () => request('/users/viewer'),
  },
  dashboard: {
    getWorkspace: () => request('/dashboard?resource=workspace'),
    getOverview: () => request('/dashboard?resource=overview'),
    listRecentActivity: () => request('/dashboard?resource=recent-activity'),
  },
  patients: {
    listForWorkspace: () => request('/patients'),
    createBySupervisor: (data: Record<string, unknown>) =>
      request('/patients', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  chwUsers: {
    listByClinic: (clinicId: string) => request(`/chw-users?clinicId=${clinicId}`),
    create: (data: Record<string, unknown>) =>
      request('/chw-users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  antenatalVisits: {
    listForWorkspace: () => request('/antenatal-visits'),
  },
  riskFlags: {
    listForWorkspace: () => request('/risk-flags'),
  },
  smsLogs: {
    listForWorkspace: () => request('/sms-logs'),
  },
  supervisors: {
    listByClinic: (clinicId: string) => request(`/supervisors?clinicId=${clinicId}`),
  },
};
