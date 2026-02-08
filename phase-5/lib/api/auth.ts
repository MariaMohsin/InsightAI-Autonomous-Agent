// lib/api/auth.ts

import apiClient from './client';
import { AuthResponse, LoginCredentials, SignupCredentials } from '@/types/auth';
import { setAuthToken, setUserData } from '@/lib/auth/utils';

/**
 * Register a new user
 */
export async function signup(credentials: SignupCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', credentials);

  console.log('📝 Signup response:', response.data);

  // Store token and user data
  if (response.data.access_token) {
    console.log('💾 Storing token:', response.data.access_token.substring(0, 20) + '...');
    setAuthToken(response.data.access_token);
    setUserData(response.data.user);
  } else {
    console.error('❌ No access_token in signup response!');
  }

  return response.data;
}

/**
 * Login an existing user
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

  console.log('🔐 Login response:', response.data);

  // Store token and user data
  if (response.data.access_token) {
    console.log('💾 Storing login token:', response.data.access_token.substring(0, 20) + '...');
    setAuthToken(response.data.access_token);
    setUserData(response.data.user);
    console.log('✅ Token and user data stored');
  } else {
    console.error('❌ No access_token in login response!');
  }

  return response.data;
}

/**
 * Logout current user (client-side only, clears local storage)
 */
export function logout(): void {
  // Clear local storage is handled in utils
  // Backend doesn't have a logout endpoint in the spec
}
