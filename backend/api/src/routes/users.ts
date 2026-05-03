import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get('/profile', (_req, res) => {
  res.json({ success: true, data: null });
});

userRouter.patch('/profile', (_req, res) => {
  res.json({ success: true, data: null });
});
