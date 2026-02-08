// types/auth.ts

export interface User {
  id: number;
  email: string;
  created_at: string; // ISO 8601 datetime
}

export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
}
