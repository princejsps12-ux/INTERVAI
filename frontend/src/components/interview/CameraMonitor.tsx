'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FeedbackLevel = 'good' | 'warn' | 'bad';
type Feedback = { level: FeedbackLevel; messages: string[] };

// Returns whichever of the two levels is "worse" (bad > warn > good).
// Defined outside the analyze loop so TS doesn't narrow `current` via flow analysis.
function worsen(current: FeedbackLevel, candidate: FeedbackLevel): FeedbackLevel {
  const rank: Record<FeedbackLevel, number> = { good: 0, warn: 1, bad: 2 };
  return rank[candidate] > rank[current] ? candidate : current;
}

const POSE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task';
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';

export function CameraMonitor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const brightnessCanvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<unknown>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const [enabled, setEnabled] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [feedback, setFeedback] = useState<Feedback>({ level: 'good', messages: ['Initializing camera...'] });

  const stopAll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const pose = poseRef.current as { close?: () => void } | null;
    if (pose && typeof pose.close === 'function') {
      try { pose.close(); } catch { /* noop */ }
    }
    poseRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopAll();
      setStatus('idle');
      setFeedback({ level: 'good', messages: ['Camera off'] });
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setFeedback({ level: 'good', messages: ['Loading vision model...'] });

    (async () => {
      try {
        const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        if (cancelled) return;

        const pose = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        if (cancelled) { pose.close(); return; }
        poseRef.current = pose;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        if (cancelled) return;
        setStatus('ready');

        const analyze = () => {
          if (cancelled) return;
          const v = videoRef.current;
          const p = poseRef.current as {
            detectForVideo: (video: HTMLVideoElement, ts: number) => { landmarks: { x: number; y: number; z: number; visibility?: number }[][] };
          } | null;
          if (!v || !p || v.readyState < 2) {
            rafRef.current = requestAnimationFrame(analyze);
            return;
          }

          let result;
          try {
            result = p.detectForVideo(v, performance.now());
          } catch {
            rafRef.current = requestAnimationFrame(analyze);
            return;
          }

          // Throttle React updates to ~3/sec
          const now = performance.now();
          if (now - lastUpdateRef.current < 350) {
            rafRef.current = requestAnimationFrame(analyze);
            return;
          }
          lastUpdateRef.current = now;

          const messages: string[] = [];
          let level: FeedbackLevel = 'good';

          if (!result.landmarks || result.landmarks.length === 0) {
            messages.push('You are not visible — adjust your camera');
            level = 'bad';
          } else {
            const lm = result.landmarks[0];
            const nose = lm[0];
            const lShoulder = lm[11];
            const rShoulder = lm[12];
            const lEye = lm[2];
            const rEye = lm[5];

            // Centering
            const cx = nose?.x ?? 0.5;
            if (cx < 0.3) {
              messages.push('Move slightly to your right');
              level = 'warn';
            } else if (cx > 0.7) {
              messages.push('Move slightly to your left');
              level = 'warn';
            }

            // Distance from camera (shoulder width as proxy)
            const shoulderWidth = Math.abs((lShoulder?.x ?? 0) - (rShoulder?.x ?? 0));
            if (shoulderWidth > 0 && shoulderWidth < 0.2) {
              messages.push('Move closer to the camera');
              level = worsen(level, 'warn');
            } else if (shoulderWidth > 0.65) {
              messages.push('Move back from the camera');
              level = worsen(level, 'warn');
            }

            // Posture — shoulder tilt
            const shoulderTilt = Math.abs((lShoulder?.y ?? 0) - (rShoulder?.y ?? 0));
            if (shoulderTilt > 0.06) {
              messages.push('Sit up straight — shoulders are uneven');
              level = worsen(level, 'warn');
            }

            // Head tilt — eyes should be near horizontal
            const eyeTilt = Math.abs((lEye?.y ?? 0) - (rEye?.y ?? 0));
            if (eyeTilt > 0.04) {
              messages.push('Keep your head upright');
              level = worsen(level, 'warn');
            }

            // Slouching — nose should be well above shoulders
            const shoulderY = ((lShoulder?.y ?? 0) + (rShoulder?.y ?? 0)) / 2;
            if (shoulderY > 0 && nose?.y && (shoulderY - nose.y) < 0.12) {
              messages.push('Lift your chin — try not to slouch');
              level = worsen(level, 'warn');
            }
          }

          // Lighting check — sample brightness
          try {
            const brightness = sampleBrightness(v, brightnessCanvasRef.current);
            if (brightness < 55) {
              messages.push('Increase lighting — too dark');
              level = worsen(level, 'warn');
            } else if (brightness > 220) {
              messages.push('Reduce backlight — overexposed');
              level = worsen(level, 'warn');
            }
          } catch { /* noop */ }

          if (messages.length === 0) messages.push('Posture and visibility look great');

          setFeedback({ level, messages });
          rafRef.current = requestAnimationFrame(analyze);
        };

        rafRef.current = requestAnimationFrame(analyze);
      } catch (err) {
        if (cancelled) return;
        const e = err as { name?: string; message?: string };
        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
          setErrorMsg('Camera permission denied');
        } else if (e.name === 'NotFoundError') {
          setErrorMsg('No camera found');
        } else {
          setErrorMsg(e.message || 'Could not start camera');
        }
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      stopAll();
    };
  }, [enabled, stopAll]);

  return (
    <div className="fixed bottom-4 right-4 w-72 bg-neural-surface border border-neural-border rounded-lg overflow-hidden shadow-2xl z-40">
      <div className="relative aspect-[4/3] bg-neural-bg">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${enabled ? '' : 'opacity-0'} -scale-x-100`}
          muted
          playsInline
        />
        <canvas ref={brightnessCanvasRef} className="hidden" width={64} height={48} />
        {!enabled && (
          <div className="absolute inset-0 flex items-center justify-center text-neural-text-muted">
            <CameraOff className="w-10 h-10" />
          </div>
        )}
        {status === 'loading' && enabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-neural-bg/70">
            <Loader2 className="w-8 h-8 text-neural-cyan animate-spin" />
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEnabled((v) => !v)}
          className="absolute top-1 right-1 h-7 w-7 p-0 bg-neural-surface/80 hover:bg-neural-surface"
          title={enabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {enabled ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
        </Button>
      </div>

      <div className="p-2.5 border-t border-neural-border">
        <div className="flex items-center gap-1.5 mb-1.5">
          {status === 'error' ? (
            <XCircle className="w-3.5 h-3.5 text-red-400" />
          ) : feedback.level === 'good' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : feedback.level === 'warn' ? (
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-red-400" />
          )}
          <span className="font-orbitron text-[10px] uppercase tracking-wider text-neural-text-muted">
            Live posture check
          </span>
        </div>
        {status === 'error' ? (
          <div className="text-xs text-red-400 font-rajdhani">{errorMsg}</div>
        ) : (
          <ul className="space-y-0.5">
            {feedback.messages.map((m, i) => (
              <li
                key={i}
                className={`text-xs font-rajdhani leading-tight ${
                  feedback.level === 'good'
                    ? 'text-emerald-300'
                    : feedback.level === 'warn'
                    ? 'text-yellow-200'
                    : 'text-red-300'
                }`}
              >
                {m}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function sampleBrightness(video: HTMLVideoElement, canvas: HTMLCanvasElement | null): number {
  if (!canvas) return 128;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return 128;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let total = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4 * 8) {
    // Rec.601 luminance, sample every 8th pixel for speed
    total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    count++;
  }
  return count > 0 ? total / count : 128;
}
