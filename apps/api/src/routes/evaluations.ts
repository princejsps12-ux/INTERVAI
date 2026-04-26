import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

export const evaluationRouter = Router();

evaluationRouter.use(requireAuth);

evaluationRouter.post('/', (_req, res) => {
  res.status(201).json({ success: true, data: null });
});

evaluationRouter.get('/:id', (req, res) => {
  res.json({ success: true, data: { id: req.params.id } });
});
