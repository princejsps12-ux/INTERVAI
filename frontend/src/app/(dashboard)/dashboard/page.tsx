'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useInterviews } from '@/lib/hooks/useInterviews';
import { useProfile } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getDifficultyColor, getScoreColor, formatDuration } from '@/lib/utils';
import { PlusCircle, Flame, Target, Award, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getSessionAvgScore(session: { questions: Array<{ answer?: { evaluation?: { overallScore: number } } }> }) {
  const evals = session.questions.flatMap((q) =>
    q.answer?.evaluation ? [q.answer.evaluation.overallScore] : []
  );
  if (!evals.length) return null;
  return evals.reduce((a, b) => a + b, 0) / evals.length;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: sessions = [], isLoading } = useInterviews();
  const { data: profile } = useProfile();

  const totalInterviews = sessions.length;
  const scoredSessions = sessions.map((s) => getSessionAvgScore(s)).filter((s): s is number => s !== null);
  const avgScore = scoredSessions.length
    ? scoredSessions.reduce((a, b) => a + b, 0) / scoredSessions.length
    : 0;
  const bestScore = scoredSessions.length ? Math.max(...scoredSessions) : 0;

  const recentSessions = [...sessions].slice(0, 5);
  const chartData = [...sessions]
    .filter((s) => getSessionAvgScore(s) !== null)
    .slice(-10)
    .reverse()
    .map((s) => ({
      date: formatDate(s.createdAt),
      score: Math.round(getSessionAvgScore(s) ?? 0),
    }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="font-orbitron text-3xl font-bold text-neural-text-primary">
            Welcome back,{' '}
            <span className="text-neural-cyan">{user?.name?.split(' ')[0] || 'Agent'}</span>
          </h1>
          <p className="text-neural-text-muted font-rajdhani mt-1">
            Ready for your next interview challenge?
          </p>
        </motion.div>
        <div className="flex items-center gap-3">
          {(profile?.streak ?? user?.streak ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-orbitron text-sm font-bold">
                {profile?.streak ?? user?.streak}
              </span>
            </div>
          )}
          <Button asChild>
            <Link href="/interview/new">
              <PlusCircle className="w-4 h-4 mr-2" /> New Interview
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Interviews', value: totalInterviews, icon: Target, color: 'cyan' },
          { label: 'Avg Score', value: `${Math.round(avgScore)}%`, icon: TrendingUp, color: 'cyan' },
          { label: 'Best Score', value: `${Math.round(bestScore)}%`, icon: Award, color: 'purple' },
          { label: 'Day Streak', value: profile?.streak ?? user?.streak ?? 0, icon: Flame, color: 'orange' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="hover:border-neural-cyan/30 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-neural-text-muted text-sm font-rajdhani tracking-wide uppercase">{label}</span>
                <Icon className={`w-4 h-4 text-${color === 'purple' ? 'neural-purple' : color === 'orange' ? 'orange-400' : 'neural-cyan'}`} />
              </div>
              <p className="font-orbitron text-3xl font-bold text-neural-text-primary">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Trend Chart */}
        {chartData.length > 1 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 8, color: '#e2e8f0' }}
                    cursor={{ stroke: '#00f5ff20' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#00f5ff"
                    strokeWidth={2}
                    dot={{ fill: '#00f5ff', r: 3 }}
                    activeDot={{ r: 5, fill: '#00f5ff', stroke: '#00f5ff40', strokeWidth: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent sessions list */}
        <Card className={chartData.length > 1 ? '' : 'lg:col-span-3'}>
          <CardHeader>
            <CardTitle className="text-base">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-md bg-neural-border animate-pulse" />
                ))}
              </div>
            )}
            {!isLoading && recentSessions.length === 0 && (
              <div className="text-center py-6">
                <p className="text-neural-text-muted font-rajdhani">No interviews yet.</p>
                <Button variant="outline" className="mt-3" asChild>
                  <Link href="/interview/new">Start your first interview</Link>
                </Button>
              </div>
            )}
            {recentSessions.map((s) => {
              const avg = getSessionAvgScore(s);
              return (
                <Link key={s.id} href={`/interview/${s.id}/results`}>
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-neural-border/50 transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neural-text-primary truncate">{s.role}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className={`text-xs px-1.5 py-0 ${getDifficultyColor(s.difficulty)}`}>
                          {s.difficulty}
                        </Badge>
                        <span className="text-xs text-neural-text-muted">{formatDate(s.createdAt)}</span>
                      </div>
                    </div>
                    {avg !== null ? (
                      <div className="flex items-center gap-2 ml-3">
                        <div className="w-16">
                          <Progress value={avg} indicatorColor={getScoreColor(avg)} className="h-1.5" />
                        </div>
                        <span className="text-sm font-orbitron font-bold" style={{ color: getScoreColor(avg) }}>
                          {Math.round(avg)}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">In progress</Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
