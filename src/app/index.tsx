import { Redirect } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';

export default function Index() {
  const { isComplete, isLoading: onboardingLoading } = useOnboardingStatus();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (onboardingLoading || authLoading) {
    return null;
  }

  if (!isComplete) {
    return <Redirect href="/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/home" />;
}
