import { useCallback, useEffect, useState } from 'react';

type QueryState<T> = {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  enabled = true,
): QueryState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setData(undefined);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      setData(result);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError : new Error('Request failed'));
      setData(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, queryFn]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, error, isLoading, refetch };
}
