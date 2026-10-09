import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, demoRole?: string) => Promise<void>;
  register: (name: string, email: string, role: UserRole, phone?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('roomsnepal_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, demoRole?: string) => {
    const res = await api.login({ email, demoRole });
    setUser(res.user);
    localStorage.setItem('roomsnepal_user', JSON.stringify(res.user));
  }, []);

  const register = useCallback(async (name: string, email: string, role: UserRole, phone?: string) => {
    const res = await api.register({ name, email, role, phone });
    setUser(res.user);
    localStorage.setItem('roomsnepal_user', JSON.stringify(res.user));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('roomsnepal_user');
    localStorage.removeItem('roomsnepal_admin_token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
