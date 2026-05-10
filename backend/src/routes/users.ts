import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '@intervai/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const userRouter = Router();

userRouter.use(requireAuth);

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional().nullable(),
});

// GET /api/users/profile
userRouter.get('/profile', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;

  const [user, totalSessions, avgScore] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        streak: true,
        createdAt: true,
        updatedAt: true,
        subscription: true,
      },
    }),
    prisma.interviewSession.count({ where: { userId } }),
    prisma.evaluation.aggregate({
      where: { answer: { question: { session: { userId } } } },
      _avg: { overallScore: true },
    }),
  ]);

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({
    success: true,
    data: {
      ...user,
      totalSessions,
      averageScore: avgScore._avg.overallScore ?? 0,
    },
  });
});

// PATCH /api/users/profile
userRouter.patch('/profile', async (req: AuthenticatedRequest, res: Response) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  const user = await prisma.user.update({
    where: { id: req.userId! },
    data: parsed.data,
    select: { id: true, name: true, email: true, image: true, plan: true, streak: true, updatedAt: true },
  });

  res.json({ success: true, data: user });
});
