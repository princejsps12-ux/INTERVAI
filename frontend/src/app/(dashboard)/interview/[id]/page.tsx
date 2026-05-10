'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterview, useSubmitAnswer } from '@/lib/hooks/useInterviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getScoreColor, getDifficultyColor, formatDuration } from '@/lib/utils';
import { Mic, MicOff, Send, ChevronRight, Loader2, CheckCircle, Clock, Volume2, VolumeX } from 'lucide-react';
import api from '@/lib/api';
import { CameraMonitor } from '@/components/interview/CameraMonitor';

function CircleScore({ score, label }: { score: number; label: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;
  const color = getScoreColor(score);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1e1e2e" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round" transform="rotate(-90 36 36)"
          style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="36" y="40" textAnchor="middle" fill={color} fontSize="13" fontWeight="700" fontFamily="Orbitron, sans-serif">
          {Math.round(score)}
        </text>
      </svg>
      <span className="text-xs text-neural-text-muted font-rajdhani tracking-wide">{label}</span>
    </div>
  );
}

export default function InterviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sessionId = params.id;

  const { data: session, isLoading } = useInterview(sessionId);
  const { mutateAsync: submitAnswer, isPending: isSubmitting } = useSubmitAnswer();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [evalResult, setEvalResult] = useState<{ answer: unknown; evaluation: { accuracyScore: number; clarityScore: number; depthScore: number; confidenceScore: number; overallScore: number; feedback: string; suggestions: string[] } } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  const questions = session?.questions || [];
  const currentQuestion = questions[currentIdx];
  const answeredQuestions = questions.filter((q) => q.answer);

  // Timer
  useEffect(() => {
    if (!evalResult) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [evalResult, currentIdx]);

  // Speak the current question whenever it changes (browser TTS — free, no API)
  const speakQuestion = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => /en-US/i.test(v.lang) && /female|samantha|zira|aria/i.test(v.name))
      || voices.find((v) => /en-US/i.test(v.lang))
      || voices.find((v) => /en/i.test(v.lang));
    if (preferred) utter.voice = preferred;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, []);

  useEffect(() => {
    if (voiceMuted || evalResult || !currentQuestion?.text) return;
    // small delay so it doesn't overlap with mount animations
    const t = setTimeout(() => speakQuestion(currentQuestion.text), 350);
    return () => {
      clearTimeout(t);
      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
    };
  }, [currentQuestion?.id, voiceMuted, evalResult, speakQuestion, currentQuestion?.text]);

  // Stop speaking when leaving the page
  useEffect(() => () => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel();
  }, []);

  const resetState = useCallback(() => {
    setAnswerText('');
    setElapsed(0);
    setEvalResult(null);
  }, []);

  const handleSubmit = async () => {
    if (!currentQuestion || (!answerText.trim())) return;
    const result = await submitAnswer({
      sessionId,
      questionId: currentQuestion.id,
      text: answerText,
      timeTaken: elapsed,
    });
    setEvalResult(result as typeof evalResult);
    clearInterval(timerRef.current);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      resetState();
    } else {
      router.push(`/interview/${sessionId}/results`);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // Don't let the AI voice bleed into the recording
    if (typeof window !== 'undefined') window.speechSynthesis.cancel();
    setIsSpeaking(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size === 0) return;

        setIsTranscribing(true);
        try {
          const form = new FormData();
          form.append('audio', blob, 'answer.webm');
          const { data } = await api.post('/api/audio/transcribe', form);
          const transcript = (data?.data?.text || '').trim();
          if (transcript) {
            setAnswerText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          } else {
            setAnswerText((prev) => prev || '[No speech detected — try again or type your answer]');
          }
        } catch (err) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
            || 'Transcription failed. You can type your answer instead.';
          setAnswerText((prev) => prev || `[${msg}]`);
        } finally {
          setIsTranscribing(false);
        }
      };
      mr.start();
      setIsRecording(true);
    } catch {
      alert('Microphone access denied. Please allow microphone permissions in your browser.');
    }
  };

  const toggleVoice = () => {
    if (voiceMuted) {
      setVoiceMuted(false);
      if (currentQuestion?.text) speakQuestion(currentQuestion.text);
    } else {
      setVoiceMuted(true);
      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const replayQuestion = () => {
    if (currentQuestion?.text) speakQuestion(currentQuestion.text);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-neural-cyan border-t-transparent rounded-full animate-spin" />
          <span className="font-orbitron text-neural-cyan text-sm">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!session || questions.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-neural-text-muted">Session not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <CameraMonitor />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-xl font-bold text-neural-text-primary">{session.role}</h1>
          <div className="flex items-center gap-2 mt-1">
            {session.company && <span className="text-neural-text-muted text-sm font-rajdhani">@ {session.company}</span>}
            <Badge variant="outline" className={getDifficultyColor(session.difficulty)}>{session.difficulty}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 text-neural-text-muted text-sm font-rajdhani">
          <Clock className="w-4 h-4" />
          <span className={elapsed > 180 ? 'text-orange-400' : ''}>{formatDuration(elapsed)}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-neural-text-muted font-rajdhani">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{answeredQuestions.length} answered</span>
        </div>
        <div className="flex gap-1">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i < currentIdx || q.answer ? 'bg-neural-cyan' : i === currentIdx ? 'bg-neural-cyan/50' : 'bg-neural-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQuestion?.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <Card className={`border-neural-cyan/20 transition-shadow ${isSpeaking ? 'shadow-[0_0_20px_rgba(0,245,255,0.25)] border-neural-cyan/50' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full bg-neural-cyan/10 border border-neural-cyan/30 flex items-center justify-center shrink-0 font-orbitron text-neural-cyan font-bold text-sm ${isSpeaking ? 'animate-pulse' : ''}`}>
                  {currentIdx + 1}
                </div>
                <CardTitle className="text-base leading-relaxed font-rajdhani font-semibold text-neural-text-primary flex-1">
                  {currentQuestion?.text}
                </CardTitle>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={replayQuestion}
                    title="Replay question"
                    disabled={voiceMuted}
                    className="h-8 w-8 p-0 text-neural-text-muted hover:text-neural-cyan"
                  >
                    <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-neural-cyan' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleVoice}
                    title={voiceMuted ? 'Unmute interviewer voice' : 'Mute interviewer voice'}
                    className="h-8 w-8 p-0 text-neural-text-muted hover:text-neural-cyan"
                  >
                    {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-neural-cyan" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Answer input */}
      {!evalResult && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-rajdhani text-neural-text-muted">Your Answer</span>
              <span className="text-xs text-neural-text-muted">{answerText.length} chars</span>
            </div>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your answer here... (or use voice recording below)"
              className="w-full h-40 bg-neural-bg border border-neural-border rounded-md p-3 text-neural-text-primary text-sm font-rajdhani resize-none focus:outline-none focus:border-neural-cyan focus:shadow-[0_0_10px_rgba(0,245,255,0.2)] transition-all placeholder:text-neural-text-muted/50"
            />
            <div className="flex items-center gap-3">
              <Button
                variant={isRecording ? 'destructive' : 'outline'}
                size="sm"
                onClick={toggleRecording}
                disabled={isTranscribing}
                className={isRecording ? 'animate-pulse' : ''}
              >
                {isTranscribing ? (
                  <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Transcribing...</>
                ) : isRecording ? (
                  <><MicOff className="w-4 h-4 mr-1.5" /> Stop Recording</>
                ) : (
                  <><Mic className="w-4 h-4 mr-1.5" /> Record Audio</>
                )}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isTranscribing || !answerText.trim()}
                className="ml-auto"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Evaluating...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Submit Answer</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluation */}
      <AnimatePresence>
        {evalResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="border-neural-cyan/30 bg-neural-cyan/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-neural-cyan" />
                  <CardTitle className="text-base">AI Evaluation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Score circles */}
                <div className="flex justify-around">
                  <CircleScore score={evalResult.evaluation.accuracyScore} label="Accuracy" />
                  <CircleScore score={evalResult.evaluation.clarityScore} label="Clarity" />
                  <CircleScore score={evalResult.evaluation.depthScore} label="Depth" />
                  <CircleScore score={evalResult.evaluation.confidenceScore} label="Confidence" />
                </div>

                {/* Overall */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm font-rajdhani">
                    <span className="text-neural-text-muted">Overall Score</span>
                    <span className="font-orbitron font-bold" style={{ color: getScoreColor(evalResult.evaluation.overallScore) }}>
                      {Math.round(evalResult.evaluation.overallScore)} / 100
                    </span>
                  </div>
                  <Progress value={evalResult.evaluation.overallScore} indicatorColor={getScoreColor(evalResult.evaluation.overallScore)} className="h-2.5" />
                </div>

                {/* Feedback */}
                <div className="space-y-2">
                  <p className="text-sm font-rajdhani text-neural-text-primary">{evalResult.evaluation.feedback}</p>
                  {evalResult.evaluation.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-orbitron text-neural-text-muted tracking-wider uppercase mt-3">Suggestions</p>
                      {evalResult.evaluation.suggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm font-rajdhani text-neural-text-muted">
                          <span className="text-neural-cyan mt-0.5">›</span>
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleNext} className="w-full" size="lg">
              {currentIdx < questions.length - 1 ? (
                <><ChevronRight className="w-4 h-4 mr-2" /> Next Question</>
              ) : (
                <><CheckCircle className="w-4 h-4 mr-2" /> View Results</>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
