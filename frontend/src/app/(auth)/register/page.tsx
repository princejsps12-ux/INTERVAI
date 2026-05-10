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
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { useState } from 'react';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await authRegister(data.name, data.email, data.password);
      router.push('/dashboard');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-orbitron text-3xl font-black text-neural-cyan tracking-widest">
              INTER<span className="text-neural-purple">VAI</span>
            </span>
          </Link>
          <p className="text-neural-text-muted mt-2 font-rajdhani">Create your account and start practicing</p>
        </div>

        <div className="bg-neural-surface border border-neural-border rounded-lg p-8 shadow-[0_0_40px_rgba(0,245,255,0.05)]">
          <h1 className="font-orbitron text-xl font-bold text-neural-text-primary mb-6">
            Join InterVAI
          </h1>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-rajdhani">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-rajdhani text-neural-text-muted tracking-wide flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <Input placeholder="John Doe" autoComplete="name" {...register('name')} />
              {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-rajdhani text-neural-text-muted tracking-wide flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <Input type="email" placeholder="you@company.com" autoComplete="email" {...register('email')} />
              {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-rajdhani text-neural-text-muted tracking-wide flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              <Input type="password" placeholder="Min 8 characters" autoComplete="new-password" {...register('password')} />
              {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-rajdhani text-neural-text-muted tracking-wide flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Confirm Password
              </label>
              <Input type="password" placeholder="Repeat password" autoComplete="new-password" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-neural-bg border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Create Account
                </div>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neural-text-muted font-rajdhani">
            Already have an account?{' '}
            <Link href="/login" className="text-neural-cyan hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
