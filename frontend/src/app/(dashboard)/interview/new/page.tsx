'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateInterview, CreateInterviewInput } from '@/lib/hooks/useInterviews';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Users, Server, Shuffle, ChevronRight, ChevronLeft, Loader2, Building2, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

type InterviewType = 'BEHAVIORAL' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'MIXED';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

const types: { value: InterviewType; label: string; icon: React.ElementType; desc: string; color: string }[] = [
  { value: 'BEHAVIORAL', label: 'Behavioral', icon: Users, desc: 'STAR method, leadership, teamwork', color: 'blue' },
  { value: 'TECHNICAL', label: 'Technical', icon: Brain, desc: 'DSA, algorithms, code problems', color: 'cyan' },
  { value: 'SYSTEM_DESIGN', label: 'System Design', icon: Server, desc: 'Architecture, scalability, APIs', color: 'purple' },
  { value: 'MIXED', label: 'Mixed', icon: Shuffle, desc: 'Combination of all types', color: 'orange' },
];

const difficulties: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: 'EASY', label: 'Easy', desc: 'Entry-level, 0-2 years XP', color: 'green' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Mid-level, 2-5 years XP', color: 'yellow' },
  { value: 'HARD', label: 'Hard', desc: 'Senior level, 5+ years XP', color: 'red' },
];

export default function NewInterviewPage() {
  const router = useRouter();
  const { mutateAsync: createInterview, isPending } = useCreateInterview();

  const [step, setStep] = useState(1);
  const [type, setType] = useState<InterviewType | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');

  const totalSteps = 4;
  const progress = ((step - 1) / (totalSteps - 1)) * 100;

  const handleStart = async () => {
    if (!type || !difficulty || !role) return;
    const session = await createInterview({ type, difficulty, role, company: company || undefined });
    router.push(`/interview/${session.id}`);
  };

  const canNext = () => {
    if (step === 1) return !!type;
    if (step === 2) return !!difficulty;
    if (step === 3) return role.trim().length > 0;
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-orbitron text-2xl font-bold text-neural-text-primary mb-2">
          New Interview Session
        </h1>
        <p className="text-neural-text-muted font-rajdhani">Step {step} of {totalSteps}</p>
        <div className="mt-3 h-1 bg-neural-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-neural-cyan rounded-full shadow-[0_0_8px_#00f5ff]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-orbitron text-lg font-semibold text-neural-text-primary mb-4">
              Select Interview Type
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {types.map(({ value, label, icon: Icon, desc }) => (
                <Card
                  key={value}
                  onClick={() => setType(value)}
                  className={cn(
                    'cursor-pointer transition-all duration-200 hover:border-neural-cyan/50',
                    type === value
                      ? 'border-neural-cyan bg-neural-cyan/5 shadow-[0_0_20px_rgba(0,245,255,0.15)]'
                      : 'hover:bg-neural-surface/80'
                  )}
                >
                  <CardContent className="p-5">
                    <Icon className={cn('w-8 h-8 mb-3', type === value ? 'text-neural-cyan' : 'text-neural-text-muted')} />
                    <p className={cn('font-orbitron text-sm font-semibold mb-1', type === value ? 'text-neural-cyan' : 'text-neural-text-primary')}>{label}</p>
                    <p className="text-neural-text-muted text-xs font-rajdhani">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-orbitron text-lg font-semibold text-neural-text-primary mb-4">
              Select Difficulty
            </h2>
            <div className="space-y-3">
              {difficulties.map(({ value, label, desc }) => (
                <Card
                  key={value}
                  onClick={() => setDifficulty(value)}
                  className={cn(
                    'cursor-pointer transition-all duration-200',
                    difficulty === value
                      ? 'border-neural-cyan bg-neural-cyan/5 shadow-[0_0_20px_rgba(0,245,255,0.15)]'
                      : 'hover:border-neural-cyan/30'
                  )}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className={cn('font-orbitron text-sm font-semibold', difficulty === value ? 'text-neural-cyan' : 'text-neural-text-primary')}>{label}</p>
                      <p className="text-neural-text-muted text-xs font-rajdhani">{desc}</p>
                    </div>
                    {difficulty === value && (
                      <div className="w-2 h-2 rounded-full bg-neural-cyan shadow-[0_0_6px_#00f5ff]" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-orbitron text-lg font-semibold text-neural-text-primary mb-4">
              Role & Company
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-rajdhani text-neural-text-muted tracking-wide flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Target Role <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="e.g. Senior Software Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-rajdhani text-neural-text-muted tracking-wide flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Company <span className="text-neural-text-muted text-xs">(optional)</span>
                </label>
                <Input
                  placeholder="e.g. Google, Meta, Apple..."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-orbitron text-lg font-semibold text-neural-text-primary mb-4">
              Review & Start
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                {[
                  { label: 'Role', value: role },
                  { label: 'Company', value: company || '—' },
                  { label: 'Type', value: type },
                  { label: 'Difficulty', value: difficulty },
                  { label: 'Questions', value: '5 AI-generated' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-neural-border last:border-0">
                    <span className="text-neural-text-muted font-rajdhani text-sm">{label}</span>
                    <span className="font-orbitron text-sm text-neural-cyan">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <p className="mt-4 text-neural-text-muted text-sm font-rajdhani text-center">
              AI will generate 5 tailored questions. This takes about 10-15 seconds.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        {step < totalSteps ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
            Continue <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleStart} disabled={isPending} size="lg">
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Questions...</>
            ) : (
              <>Start Interview <ChevronRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
