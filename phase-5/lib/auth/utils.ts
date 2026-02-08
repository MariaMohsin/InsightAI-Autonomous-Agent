// lib/auth/utils.ts

/**
 * Set authentication token in session storage
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('auth_token', token);
}

/**
 * Get authentication token from session storage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('auth_token');
}

/**
 * Clear authentication token from session storage
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('user_data');
}

/**
 * Store user data in session storage
 */
export function setUserData(userData: any): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('user_data', JSON.stringify(userData));
}

/**
 * Get user data from session storage
 */
export function getUserData(): any | null {
  if (typeof window === 'undefined') return null;
  const userData = sessionStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
