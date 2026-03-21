import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// User interface matching your database schema
export interface User {
  id: string;
  google_id: string;
  name: string;
  email: string;
  no_handphone: string;
  image: string;
  password: string;
  role_id: number;
  is_active: number;
  date_created: string;
  profile_picture: string;
  google_token: string;
  is_google_user: number;
  image_generated: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      
      login: (user: User, token: string) => {
        set({
          isAuthenticated: true,
          user: user,
          token: token,
        });
      },
      
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        });
      },
      
      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'its-ai-auth',
    }
  )
);

// Google OAuth Configuration - from environment variables
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

// For local development, use current origin
// For production, this will be your jagoan hosting URL
export const getRedirectUri = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  return 'http://localhost:3000/auth/callback';
};

// API Base URL - your PHP backend (for future use)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ai.itsacademics.com';

// Role constants
export const ROLE_USER = 3;
