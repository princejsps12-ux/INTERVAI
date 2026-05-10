'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';

export interface CreateInterviewInput {
  company?: string;
  role: string;
  type: 'BEHAVIORAL' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'MIXED';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface SubmitAnswerInput {
  sessionId: string;
  questionId: string;
  text?: string;
  audioUrl?: string;
  timeTaken: number;
}

export function useInterviews() {
  return useQuery({
    queryKey: ['interviews'],
    queryFn: async () => {
      const { data } = await api.get('/api/interviews');
      return data.data as InterviewSession[];
    },
    staleTime: 30_000,
  });
}

export function useInterview(id: string) {
  return useQuery({
    queryKey: ['interview', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/interviews/${id}`);
      return data.data as InterviewSession;
    },
    enabled: !!id,
  });
}

export function useCreateInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateInterviewInput) => {
      const { data } = await api.post('/api/interviews', input);
      return data.data as InterviewSession;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interviews'] }),
  });
}

export function useSubmitAnswer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, ...body }: SubmitAnswerInput) => {
      const { data } = await api.patch(`/api/interviews/${sessionId}/answer`, body);
      return data.data as { answer: Answer; evaluation: Evaluation };
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['interview', vars.sessionId] });
    },
  });
}

export function useSessionEvaluations(sessionId: string) {
  return useQuery({
    queryKey: ['evaluations', sessionId],
    queryFn: async () => {
      const { data } = await api.get(`/api/evaluations/session/${sessionId}`);
      return data.data;
    },
    enabled: !!sessionId,
  });
}

// --- Types ---

export interface InterviewSession {
  id: string;
  userId: string;
  company: string | null;
  role: string;
  type: 'BEHAVIORAL' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'MIXED';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  duration: number;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

export interface Question {
  id: string;
  sessionId: string;
  text: string;
  type: 'BEHAVIORAL' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'CODING';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  orderIndex: number;
  createdAt: string;
  answer?: Answer;
}

export interface Answer {
  id: string;
  questionId: string;
  text: string | null;
  audioUrl: string | null;
  timeTaken: number;
  createdAt: string;
  evaluation?: Evaluation;
}

export interface Evaluation {
  id: string;
  answerId: string;
  accuracyScore: number;
  clarityScore: number;
  depthScore: number;
  confidenceScore: number;
  overallScore: number;
  feedback: string;
  suggestions: string[];
  createdAt: string;
}
