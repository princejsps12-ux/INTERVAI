import { Router, Response } from 'express';
import { prisma } from '@intervai/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const evaluationRouter = Router();

evaluationRouter.use(requireAuth);

// GET /api/evaluations/session/:sessionId — must come before /:id
evaluationRouter.get('/session/:sessionId', async (req: AuthenticatedRequest, res: Response) => {
  const { sessionId } = req.params;

  // Verify session belongs to this user
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId: req.userId! },
  });

  if (!session) {
    res.status(404).json({ success: false, message: 'Session not found' });
    return;
  }

  const evaluations = await prisma.evaluation.findMany({
    where: {
      answer: {
        question: { sessionId },
      },
    },
    include: {
      answer: {
        include: { question: true },
      },
    },
  });

  // Aggregate scores
  const count = evaluations.length;
  const aggregated =
    count > 0
      ? {
          accuracyScore: evaluations.reduce((s, e) => s + e.accuracyScore, 0) / count,
          clarityScore: evaluations.reduce((s, e) => s + e.clarityScore, 0) / count,
          depthScore: evaluations.reduce((s, e) => s + e.depthScore, 0) / count,
          confidenceScore: evaluations.reduce((s, e) => s + e.confidenceScore, 0) / count,
          overallScore: evaluations.reduce((s, e) => s + e.overallScore, 0) / count,
        }
      : null;

  res.json({ success: true, data: { evaluations, aggregated, session } });
});

// POST /api/evaluations (kept from skeleton — unused but preserved)
evaluationRouter.post('/', (_req, res: Response) => {
  res.status(201).json({ success: true, data: null });
});

// GET /api/evaluations/:id
evaluationRouter.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const evaluation = await prisma.evaluation.findFirst({
    where: {
      id: req.params.id,
      answer: {
        question: {
          session: { userId: req.userId! },
        },
      },
    },
    include: {
      answer: { include: { question: true } },
    },
  });

  if (!evaluation) {
    res.status(404).json({ success: false, message: 'Evaluation not found' });
    return;
  }

  res.json({ success: true, data: evaluation });
});
