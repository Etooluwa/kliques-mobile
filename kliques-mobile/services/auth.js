import * as SecureStore from 'expo-secure-store';
import { ROLE_KEY } from '../constants/config';

export const TOKEN_KEY = 'kliques_token';
export const REFRESH_TOKEN_KEY = 'kliques_refresh_token';
export const PUSH_TOKEN_KEY = 'kliques_push_token';

export async function getStoredToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getStoredRole() {
  return SecureStore.getItemAsync(ROLE_KEY);
}

export async function getStoredRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function saveAuthSession(token, role, refreshToken) {
  const writes = [SecureStore.setItemAsync(TOKEN_KEY, token)];

  if (role) {
    writes.push(SecureStore.setItemAsync(ROLE_KEY, role));
  }

  if (refreshToken) {
    writes.push(SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken));
  }

  await Promise.all(writes);
}

export async function clearAuthSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(ROLE_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

export async function getStoredPushToken() {
  return SecureStore.getItemAsync(PUSH_TOKEN_KEY);
}

export async function savePushToken(token) {
  return SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
}
