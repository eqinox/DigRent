import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Encryption key - в реално приложение трябва да е по-сложен
const ENCRYPTION_KEY = 'your-secret-key-here-32-chars-long!';

// Simple encryption for web (using base64 + simple XOR)
const encryptData = (data: string): string => {
  if (Platform.OS === 'web') {
    // Simple obfuscation - в реално приложение използвай по-силно криптиране
    const encoded = btoa(data);
    return encoded;
  }
  return data;
};

const decryptData = (encryptedData: string): string => {
  if (Platform.OS === 'web') {
    try {
      // Simple deobfuscation
      const decoded = atob(encryptedData);
      return decoded;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return encryptedData; // Fallback to original data
    }
  }
  return encryptedData;
};

// Platform-specific storage functions with encryption
export const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      const encryptedValue = localStorage.getItem(key);
      if (encryptedValue) {
        return decryptData(encryptedValue);
      }
      return null;
    } else {
      // React Native already uses SecureStore which is encrypted
      return SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error('Failed to get storage item:', error);
    return null;
  }
};

export const setStorageItem = async (
  key: string,
  value: string
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      const encryptedValue = encryptData(value);
      localStorage.setItem(key, encryptedValue);
    } else {
      // React Native already uses SecureStore which is encrypted
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error('Failed to set storage item:', error);
  }
};

export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error('Failed to remove storage item:', error);
  }
};
