'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from './api';

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  streak: number;
  createdAt: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('intervai_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data.data);
    } catch {
      localStorage.removeItem('intervai_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('intervai_token', data.data.token);
    setUser(data.data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    localStorage.setItem('intervai_token', data.data.token);
    setUser(data.data.user);
  };

  const logout = () => {
    localStorage.removeItem('intervai_token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
