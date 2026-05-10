import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import { transcribeAudio } from '../services/audio.service';

export const audioRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB — Groq Whisper hard cap
});

audioRouter.post('/transcribe', requireAuth, upload.single('audio'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No audio file uploaded (expected field "audio")' });
    return;
  }

  try {
    const filename = req.file.originalname || 'audio.webm';
    const text = await transcribeAudio(req.file.buffer, filename);
    res.json({ success: true, data: { text } });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string; code?: string };
    const isAuth = e.status === 401 || e.code === 'invalid_api_key';
    res.status(502).json({
      success: false,
      message: isAuth
        ? 'AI service authentication failed. Please contact support — the transcription API key is invalid.'
        : `Failed to transcribe audio: ${e.message || 'Audio service unavailable'}`,
    });
  }
});
