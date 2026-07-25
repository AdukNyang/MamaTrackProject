import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { ONBOARDING_STORAGE_KEY } from '@/constants/onboarding';

async function readFlag(): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
  }

  return SecureStore.getItemAsync(ONBOARDING_STORAGE_KEY);
}

async function writeFlag(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(ONBOARDING_STORAGE_KEY, value);
}

export async function getOnboardingComplete(): Promise<boolean> {
  const value = await readFlag();
  return value === 'true';
}

export async function setOnboardingComplete(): Promise<void> {
  await writeFlag('true');
}

export async function clearOnboardingComplete(): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(ONBOARDING_STORAGE_KEY);
}
