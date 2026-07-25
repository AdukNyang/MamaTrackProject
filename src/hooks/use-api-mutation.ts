import { useCallback, useState } from 'react';

export function useApiMutation<TArgs extends unknown[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>,
) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (...args: TArgs) => {
      setIsLoading(true);
      try {
        return await mutationFn(...args);
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn],
  );

  return { mutate, isLoading };
}
