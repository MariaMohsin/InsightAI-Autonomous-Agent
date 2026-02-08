// components/auth/AuthProvider.tsx

'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/auth';
import { getUserData, clearAuthToken, isAuthenticated } from '@/lib/auth/utils';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const userData = getUserData();
    if (userData) {
      setUser(userData);
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    clearAuthToken();
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: isAuthenticated(),
    setUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
