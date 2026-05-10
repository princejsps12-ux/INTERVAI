'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInterviews } from '@/lib/hooks/useInterviews';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getDifficultyColor, getScoreColor, formatDuration } from '@/lib/utils';
import { Clock, ChevronRight, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function getSessionAvgScore(session: { questions: Array<{ answer?: { evaluation?: { overallScore: number } } }> }) {
  const evals = session.questions.flatMap((q) =>
    q.answer?.evaluation ? [q.answer.evaluation.overallScore] : []
  );
  if (!evals.length) return null;
  return evals.reduce((a, b) => a + b, 0) / evals.length;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function HistoryPage() {
  const { data: sessions = [], isLoading } = useInterviews();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold text-neural-text-primary">Interview History</h1>
          <p className="text-neural-text-muted font-rajdhani mt-1">{sessions.length} sessions total</p>
        </div>
        <Button asChild>
          <Link href="/interview/new"><PlusCircle className="w-4 h-4 mr-2" /> New Interview</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-neural-surface border border-neural-border animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && sessions.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-neural-text-muted font-rajdhani text-lg mb-4">No interviews yet. Start practicing!</p>
            <Button asChild>
              <Link href="/interview/new">Start Your First Interview</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {sessions.map((s, i) => {
          const avg = getSessionAvgScore(s);
          const answered = s.questions.filter((q) => q.answer).length;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/interview/${s.id}/results`}>
                <Card className="hover:border-neural-cyan/30 hover:shadow-[0_0_15px_rgba(0,245,255,0.07)] transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-neural-text-primary font-rajdhani">{s.role}</span>
                        {s.company && <span className="text-neural-text-muted text-sm">@ {s.company}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(s.difficulty)}`}>{s.difficulty}</Badge>
                        <Badge variant="outline" className="text-xs border-neural-border text-neural-text-muted">{s.type}</Badge>
                        <span className="text-xs text-neural-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDuration(s.duration)}
                        </span>
                        <span className="text-xs text-neural-text-muted">{formatDate(s.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-neural-text-muted font-rajdhani">{answered}/{s.questions.length} done</p>
                        {avg !== null ? (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-20">
                              <Progress value={avg} indicatorColor={getScoreColor(avg)} className="h-1.5" />
                            </div>
                            <span className="font-orbitron font-bold text-sm" style={{ color: getScoreColor(avg) }}>
                              {Math.round(avg)}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs mt-1">In progress</Badge>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-neural-text-muted" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
