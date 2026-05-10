import OpenAI from 'openai';
import { Readable } from 'stream';
import { toFile } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

export async function transcribeAudio(audioBuffer: Buffer, filename = 'audio.webm'): Promise<string> {
  const readable = Readable.from(audioBuffer);
  const file = await toFile(readable, filename, { type: 'audio/webm' });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: process.env.OPENAI_AUDIO_MODEL || 'whisper-1',
    response_format: 'text',
  });

  return typeof transcription === 'string' ? transcription : (transcription as { text: string }).text;
}
