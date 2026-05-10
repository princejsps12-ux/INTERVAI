'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useInterview, useSessionEvaluations } from '@/lib/hooks/useInterviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getDifficultyColor, getScoreColor } from '@/lib/utils';
import { PlusCircle, LayoutDashboard, Trophy } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
} from 'recharts';

function CircleScore({ score, size = 'lg' }: { score: number; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 160 : 80;
  const r = size === 'lg' ? 62 : 30;
  const circ = 2 * Math.PI * r;
  const color = getScoreColor(score);
  return (
    <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
      <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke="#1e1e2e" strokeWidth={size === 'lg' ? 8 : 5} />
      <circle
        cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke={color}
        strokeWidth={size === 'lg' ? 8 : 5}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
        strokeLinecap="round" transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
        style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset 1.2s ease' }}
      />
      <text x={dim / 2} y={dim / 2 + (size === 'lg' ? 5 : 3)} textAnchor="middle" fill={color}
        fontSize={size === 'lg' ? 24 : 13} fontWeight="700" fontFamily="Orbitron, sans-serif">
        {Math.round(score)}
      </text>
      {size === 'lg' && (
        <text x={dim / 2} y={dim / 2 + 24} textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="Rajdhani, sans-serif">
          / 100
        </text>
      )}
    </svg>
  );
}

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;

  const { data: session, isLoading: sessionLoading } = useInterview(sessionId);
  const { data: evalData, isLoading: evalLoading } = useSessionEvaluations(sessionId);

  if (sessionLoading || evalLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-neural-cyan border-t-transparent rounded-full animate-spin" />
          <span className="font-orbitron text-neural-cyan text-sm">Loading results...</span>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const agg = evalData?.aggregated;
  const overallScore = agg?.overallScore ?? 0;

  const radarData = agg
    ? [
        { subject: 'Accuracy', value: Math.round(agg.accuracyScore) },
        { subject: 'Clarity', value: Math.round(agg.clarityScore) },
        { subject: 'Depth', value: Math.round(agg.depthScore) },
        { subject: 'Confidence', value: Math.round(agg.confidenceScore) },
      ]
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="font-orbitron text-2xl font-bold text-neural-text-primary">
              Interview Complete
            </h1>
          </div>
          <p className="text-neural-text-muted font-rajdhani">
            {session.role}{session.company ? ` @ ${session.company}` : ''}
          </p>
          <Badge variant="outline" className={getDifficultyColor(session.difficulty)}>{session.difficulty}</Badge>
        </div>
      </motion.div>

      {/* Overall score + radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center justify-center p-8">
          <p className="font-orbitron text-sm text-neural-text-muted mb-4 tracking-widest">OVERALL SCORE</p>
          <CircleScore score={overallScore} size="lg" />
          <div className="mt-4 text-center">
            <p className="font-orbitron text-lg font-bold" style={{ color: getScoreColor(overallScore) }}>
              {overallScore >= 80 ? 'Excellent!' : overallScore >= 60 ? 'Good Job' : overallScore >= 40 ? 'Keep Practicing' : 'Needs Work'}
            </p>
          </div>
        </Card>

        {radarData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1e1e2e" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Rajdhani' }} />
                  <Radar name="Score" dataKey="value" stroke="#00f5ff" fill="#00f5ff" fillOpacity={0.15} strokeWidth={2} />
                  <Tooltip
                    contentStyle={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 8, color: '#e2e8f0' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Per-question breakdown */}
      <div className="space-y-4">
        <h2 className="font-orbitron text-lg font-bold text-neural-text-primary">Question Breakdown</h2>
        {session.questions.map((q, i) => {
          const eval_ = q.answer?.evaluation;
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card>
                <CardContent className="p-5 space-y-4">
                  {/* Question */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-neural-cyan/10 border border-neural-cyan/30 flex items-center justify-center shrink-0 font-orbitron text-neural-cyan font-bold text-xs">
                      {i + 1}
                    </div>
                    <p className="text-sm font-rajdhani text-neural-text-primary leading-relaxed">{q.text}</p>
                  </div>

                  {/* Answer */}
                  {q.answer?.text && (
                    <div className="bg-neural-bg rounded-md p-3 border border-neural-border">
                      <p className="text-xs font-orbitron text-neural-text-muted mb-1 tracking-wider">YOUR ANSWER</p>
                      <p className="text-sm font-rajdhani text-neural-text-muted leading-relaxed">{q.answer.text}</p>
                    </div>
                  )}

                  {eval_ ? (
                    <div className="space-y-3">
                      {/* Score bars */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {[
                          { label: 'Accuracy', value: eval_.accuracyScore },
                          { label: 'Clarity', value: eval_.clarityScore },
                          { label: 'Depth', value: eval_.depthScore },
                          { label: 'Confidence', value: eval_.confidenceScore },
                        ].map(({ label, value }) => (
                          <div key={label} className="space-y-1">
                            <div className="flex justify-between text-xs font-rajdhani text-neural-text-muted">
                              <span>{label}</span>
                              <span style={{ color: getScoreColor(value) }}>{Math.round(value)}</span>
                            </div>
                            <Progress value={value} indicatorColor={getScoreColor(value)} className="h-1.5" />
                          </div>
                        ))}
                      </div>

                      {/* Feedback */}
                      <p className="text-sm font-rajdhani text-neural-text-muted leading-relaxed">{eval_.feedback}</p>

                      {eval_.suggestions.length > 0 && (
                        <div className="space-y-1">
                          {eval_.suggestions.map((s, j) => (
                            <div key={j} className="flex items-start gap-2 text-xs font-rajdhani text-neural-text-muted">
                              <span className="text-neural-cyan">›</span>
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-neural-text-muted font-rajdhani">Not answered</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/interview/new">
            <PlusCircle className="w-4 h-4 mr-2" /> New Interview
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/dashboard">
            <LayoutDashboard className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
