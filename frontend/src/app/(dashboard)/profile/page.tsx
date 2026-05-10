'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useProfile, useUpdateProfile } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Star, Target, TrendingUp, Flame, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

type FormData = z.infer<typeof schema>;

function PlanBadge({ plan }: { plan: string }) {
  const variants: Record<string, string> = {
    FREE: 'border-neural-border text-neural-text-muted',
    PRO: 'border-neural-cyan/40 bg-neural-cyan/10 text-neural-cyan',
    ENTERPRISE: 'border-neural-purple/40 bg-neural-purple/10 text-neural-purple',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-xs font-orbitron tracking-widest ${variants[plan] || variants.FREE}`}>
      {plan === 'PRO' && <Star className="w-3 h-3" />}
      {plan}
    </span>
  );
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: { name: profile?.name || '' },
  });

  const onSubmit = async (data: FormData) => {
    await updateProfile({ name: data.name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-neural-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-orbitron text-2xl font-bold text-neural-text-primary mb-1">Profile</h1>
        <p className="text-neural-text-muted font-rajdhani">Manage your account settings</p>
      </motion.div>

      {/* Avatar + plan */}
      <Card>
        <CardContent className="p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-neural-cyan/10 border-2 border-neural-cyan/30 flex items-center justify-center shrink-0">
            <span className="font-orbitron text-2xl font-black text-neural-cyan">
              {(profile?.name || profile?.email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-orbitron text-lg font-bold text-neural-text-primary">{profile?.name || '—'}</p>
            <p className="text-neural-text-muted text-sm font-rajdhani mt-0.5">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <PlanBadge plan={profile?.plan || 'FREE'} />
              {profile?.subscription?.status && (
                <span className="text-xs text-neural-text-muted font-rajdhani">
                  {profile.subscription.status}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Target, label: 'Total Sessions', value: profile?.totalSessions ?? 0 },
          { icon: TrendingUp, label: 'Avg Score', value: `${Math.round(profile?.averageScore ?? 0)}%` },
          { icon: Flame, label: 'Day Streak', value: profile?.streak ?? 0 },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <Icon className="w-5 h-5 text-neural-cyan mx-auto mb-2" />
              <p className="font-orbitron text-xl font-bold text-neural-text-primary">{value}</p>
              <p className="text-neural-text-muted text-xs font-rajdhani mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-rajdhani text-neural-text-muted tracking-wide flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <Input placeholder="Your full name" {...register('name')} />
              {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-rajdhani text-neural-text-muted tracking-wide flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <Input value={profile?.email || ''} disabled className="opacity-60" />
              <p className="text-xs text-neural-text-muted">Email cannot be changed</p>
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : saved ? (
                <><Save className="w-4 h-4 mr-2" /> Saved!</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save Changes</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
