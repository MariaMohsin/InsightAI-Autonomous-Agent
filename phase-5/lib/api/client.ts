// lib/api/client.ts

import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { clearAuthToken, getAuthToken } from '@/lib/auth/utils';

// Define error response type
interface ErrorResponse {
  detail?: string;
  message?: string;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Track if we're already redirecting to prevent loops
let isRedirecting = false;

// Request interceptor: Attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Get token using the utility function
    const token = getAuthToken();

    console.log('🔑 Token check:', token ? `Found: ${token.substring(0, 20)}...` : '❌ No token');

    if (token) {
      // Set Authorization header
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header set:', config.headers.Authorization?.substring(0, 30) + '...');
    } else {
      console.warn('⚠️ No authentication token available');
    }

    console.log('📤 Request to:', config.url);

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response from:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    console.error('❌ Response error:', error.response?.status, error.config?.url);

    // Handle 401 Unauthorized - Session expired or invalid token
    if (error.response?.status === 401) {
      console.error('🚫 401 Unauthorized - Token invalid or expired');

      if (!isRedirecting && typeof window !== 'undefined') {
        isRedirecting = true;
        clearAuthToken();

        // Only show toast if we're not already on login/signup pages
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/signup') {
          toast.error('Your session has expired. Please log in again.');
        }

        // Redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
      return Promise.reject(error);
    }

    // Handle 403 Forbidden - User doesn't have permission or missing token
    if (error.response?.status === 403) {
      console.error('🚫 403 Forbidden - Check if token is being sent');

      const token = getAuthToken();
      if (!token) {
        console.error('💥 No token found! Redirecting to login...');
        if (typeof window !== 'undefined') {
          toast.error('Please log in to continue');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
      } else {
        toast.error('Access denied. Please try logging in again.');
      }
      return Promise.reject(error);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      const message = error.response?.data?.detail || 'Resource not found.';
      toast.error(message);
      return Promise.reject(error);
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }

    // Handle network errors (no response received)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your connection.');
      } else if (error.message === 'Network Error') {
        toast.error('Network error. Please check your internet connection.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      return Promise.reject(error);
    }

    // For other errors, let the calling code handle them
    return Promise.reject(error);
  }
);

export default apiClient;
