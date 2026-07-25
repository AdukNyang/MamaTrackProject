import { useCallback, useEffect, useState } from 'react';

import { getOnboardingComplete } from '@/lib/onboarding-storage';

export function useOnboardingStatus() {
  const [isComplete, setIsComplete] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    getOnboardingComplete().then((complete) => {
      if (active) {
        setIsComplete(complete);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const markComplete = useCallback(() => {
    setIsComplete(true);
  }, []);

  return {
    isComplete,
    isLoading: isComplete === null,
    markComplete,
  };
}
