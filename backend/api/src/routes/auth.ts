import { Router } from 'express';

export const authRouter = Router();

authRouter.get('/me', (_req, res) => {
  res.json({ success: true, data: null });
});
