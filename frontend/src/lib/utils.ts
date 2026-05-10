import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number) {
  return Math.round(score);
}

export function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'EASY':
      return 'text-green-400 bg-green-400/10 border-green-400/30';
    case 'MEDIUM':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'HARD':
      return 'text-red-400 bg-red-400/10 border-red-400/30';
    default:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  }
}

export function getScoreColor(score: number) {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
