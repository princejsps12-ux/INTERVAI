'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ParticleCanvas } from '@/components/layout/ParticleCanvas';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-neural-bg flex items-center justify-center relative px-4">
      <ParticleCanvas />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-orbitron text-3xl font-black text-neural-cyan tracking-widest">
              INTER<span className="text-neural-purple">VAI</span>
            </span>
          </Link>
          <p className="text-neural-text-muted mt-2 font-rajdhani">Sign in to continue your journey</p>
        </div>

        {/* Card */}
        <div className="bg-neural-surface border border-neural-border rounded-lg p-8 shadow-[0_0_40px_rgba(0,245,255,0.05)]">
          <h1 className="font-orbitron text-xl font-bold text-neural-text-primary mb-6">
            Welcome Back
          </h1>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-rajdhani">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-rajdhani text-neural-text-muted tracking-wide flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <Input
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-rajdhani text-neural-text-muted tracking-wide flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-neural-bg border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Sign In
                </div>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neural-text-muted font-rajdhani">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-neural-cyan hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
