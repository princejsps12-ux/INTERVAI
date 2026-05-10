'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neural-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-neural-cyan border-t-transparent rounded-full animate-spin" />
          <span className="font-orbitron text-neural-cyan text-sm tracking-widest">LOADING</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neural-bg">
      <Navbar />
      <Sidebar />
      <main className="pl-60 pt-16 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
