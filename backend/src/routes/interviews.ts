import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '@intervai/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { generateQuestions, evaluateAnswer } from '../services/openai.service';

export const interviewRouter = Router();

interviewRouter.use(requireAuth);

const createSessionSchema = z.object({
  company: z.string().max(100).optional(),
  role: z.string().min(1).max(100),
  type: z.enum(['BEHAVIORAL', 'TECHNICAL', 'SYSTEM_DESIGN', 'MIXED']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
});

const submitAnswerSchema = z.object({
  questionId: z.string().min(1),
  text: z.string().optional(),
  audioUrl: z.string().url().optional(),
  timeTaken: z.number().int().min(0),
});

// GET /api/interviews
interviewRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const sessions = await prisma.interviewSession.findMany({
    where: { userId: req.userId! },
    include: {
      questions: {
        include: { answer: { include: { evaluation: true } } },
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: sessions });
});

// POST /api/interviews
interviewRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const parsed = createSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  const { company, role, type, difficulty } = parsed.data;

  const session = await prisma.interviewSession.create({
    data: { userId: req.userId!, company, role, type, difficulty, duration: 0 },
  });

  // Generate questions via OpenAI
  let generatedQuestions;
  try {
    generatedQuestions = await generateQuestions(role, type, difficulty, company);
  } catch (err: unknown) {
    // Rollback the session so we don't leave orphans
    await prisma.interviewSession.delete({ where: { id: session.id } }).catch(() => {});
    const e = err as { status?: number; message?: string; code?: string };
    const isAuth = e.status === 401 || e.code === 'invalid_api_key';
    res.status(502).json({
      success: false,
      message: isAuth
        ? 'AI service authentication failed. Please contact support — the OpenAI API key is invalid.'
        : `Failed to generate questions: ${e.message || 'AI service unavailable'}`,
    });
    return;
  }

  // Persist questions
  await prisma.question.createMany({
    data: generatedQuestions.map((q) => ({
      sessionId: session.id,
      text: q.text,
      type: q.type,
      difficulty: q.difficulty,
      orderIndex: q.orderIndex,
    })),
  });

  const fullSession = await prisma.interviewSession.findUnique({
    where: { id: session.id },
    include: {
      questions: { orderBy: { orderIndex: 'asc' } },
    },
  });

  res.status(201).json({ success: true, data: fullSession });
});

// GET /api/interviews/:id
interviewRouter.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const session = await prisma.interviewSession.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    include: {
      questions: {
        include: {
          answer: { include: { evaluation: true } },
        },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!session) {
    res.status(404).json({ success: false, message: 'Interview session not found' });
    return;
  }

  res.json({ success: true, data: session });
});

// PATCH /api/interviews/:id/answer
interviewRouter.patch('/:id/answer', async (req: AuthenticatedRequest, res: Response) => {
  const parsed = submitAnswerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  const { questionId, text, audioUrl, timeTaken } = parsed.data;

  // Verify question belongs to this session and user
  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      sessionId: req.params.id,
      session: { userId: req.userId! },
    },
  });

  if (!question) {
    res.status(404).json({ success: false, message: 'Question not found' });
    return;
  }

  if (!text && !audioUrl) {
    res.status(400).json({ success: false, message: 'Answer text or audioUrl is required' });
    return;
  }

  // Upsert answer (allow re-submissions)
  const answer = await prisma.answer.upsert({
    where: { questionId },
    create: { questionId, text, audioUrl, timeTaken },
    update: { text, audioUrl, timeTaken },
  });

  // Evaluate via OpenAI
  const answerText = text || '[Audio answer submitted]';
  let evalResult;
  try {
    evalResult = await evaluateAnswer(question.text, answerText);
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string; code?: string };
    const isAuth = e.status === 401 || e.code === 'invalid_api_key';
    res.status(502).json({
      success: false,
      message: isAuth
        ? 'AI service authentication failed. Please contact support — the OpenAI API key is invalid.'
        : `Failed to evaluate answer: ${e.message || 'AI service unavailable'}`,
    });
    return;
  }

  const evaluation = await prisma.evaluation.upsert({
    where: { answerId: answer.id },
    create: { answerId: answer.id, ...evalResult },
    update: { ...evalResult },
  });

  // Update session duration
  await prisma.interviewSession.update({
    where: { id: req.params.id },
    data: { duration: { increment: timeTaken } },
  });

  res.json({ success: true, data: { answer, evaluation } });
});
