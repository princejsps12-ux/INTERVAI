'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { useAuth } from '../auth';

export function useUser() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/api/auth/me');
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const { login } = useAuth();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
  });
}

export function useRegister() {
  const { register } = useAuth();
  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      register(name, email, password),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/api/users/profile');
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name?: string; image?: string | null }) => {
      const { data } = await api.patch('/api/users/profile', body);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
