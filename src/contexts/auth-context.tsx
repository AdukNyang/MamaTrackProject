import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { api, getAuthToken, setAuthToken } from '@/lib/api-client';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ requiresVerification: boolean; signingIn: boolean }>;
  verify: (
    email: string,
    code: string,
  ) => Promise<{ signingIn: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = await getAuthToken();
      if (!cancelled) {
        setIsAuthenticated(Boolean(token));
        setIsLoading(false);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api.auth.signIn(email, password);
    if (result.signingIn) {
      setIsAuthenticated(true);
    }
    return result;
  }, []);

  const verify = useCallback(async (email: string, code: string) => {
    const result = await api.auth.verify(email, code);
    if (result.signingIn && result.token) {
      await setAuthToken(result.token);
      setIsAuthenticated(true);
    }
    return { signingIn: result.signingIn };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.auth.signOut();
    } finally {
      await setAuthToken(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      signIn,
      verify,
      signOut,
    }),
    [isAuthenticated, isLoading, signIn, verify, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useAuthActions() {
  const { signIn, signOut, verify } = useAuth();
  return { signIn, signOut, verify };
}
