import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

export const interviewRouter = Router();

interviewRouter.use(requireAuth);

interviewRouter.get('/', (_req, res) => {
  res.json({ success: true, data: [] });
});

interviewRouter.post('/', (_req, res) => {
  res.status(201).json({ success: true, data: null });
});

interviewRouter.get('/:id', (req, res) => {
  res.json({ success: true, data: { id: req.params.id } });
});
