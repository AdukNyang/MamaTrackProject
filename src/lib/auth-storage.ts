import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

export const authStorage = Platform.OS === 'web' ? undefined : secureStorage;
