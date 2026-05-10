import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

export interface GeneratedQuestion {
  text: string;
  type: 'BEHAVIORAL' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'CODING';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  orderIndex: number;
}

export interface EvaluationResult {
  accuracyScore: number;
  clarityScore: number;
  depthScore: number;
  confidenceScore: number;
  overallScore: number;
  feedback: string;
  suggestions: string[];
}

export async function generateQuestions(
  role: string,
  type: string,
  difficulty: string,
  company?: string
): Promise<GeneratedQuestion[]> {
  const companyCtx = company ? ` at ${company}` : '';

  const prompt = `You are an expert technical interviewer. Generate exactly 5 interview questions for a ${difficulty} ${type} interview for a ${role}${companyCtx} position.

Return a JSON array with exactly 5 objects. Each object must have:
- "text": the full question (string)
- "type": one of "BEHAVIORAL", "TECHNICAL", "SYSTEM_DESIGN", "CODING" (choose based on the interview type and question content)
- "difficulty": "${difficulty}"
- "orderIndex": 0 through 4

Interview type context:
- BEHAVIORAL: focus on past experiences, leadership, conflict, teamwork
- TECHNICAL: data structures, algorithms, language-specific knowledge
- SYSTEM_DESIGN: architecture, scalability, database design
- MIXED: mix of all types

For TECHNICAL and CODING questions, include code-focused challenges appropriate for ${difficulty} level.
Respond with ONLY valid JSON, no markdown, no explanation.`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  });

  const content = response.choices[0].message.content || '{"questions":[]}';
  const parsed = JSON.parse(content);
  const questions: GeneratedQuestion[] = Array.isArray(parsed) ? parsed : parsed.questions || [];

  return questions.slice(0, 5).map((q: GeneratedQuestion, i: number) => ({
    text: q.text,
    type: q.type || mapTypeToQuestionType(type),
    difficulty: (q.difficulty || difficulty) as 'EASY' | 'MEDIUM' | 'HARD',
    orderIndex: i,
  }));
}

function mapTypeToQuestionType(
  interviewType: string
): 'BEHAVIORAL' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'CODING' {
  switch (interviewType) {
    case 'BEHAVIORAL':
      return 'BEHAVIORAL';
    case 'TECHNICAL':
      return 'TECHNICAL';
    case 'SYSTEM_DESIGN':
      return 'SYSTEM_DESIGN';
    default:
      return 'TECHNICAL';
  }
}

export async function evaluateAnswer(
  question: string,
  answer: string
): Promise<EvaluationResult> {
  const prompt = `You are an expert interview coach evaluating a candidate's response.

Question: "${question}"

Candidate's Answer: "${answer}"

Evaluate the answer on these dimensions (each 0-100):
- accuracyScore: factual correctness and technical accuracy
- clarityScore: how clearly the answer is communicated
- depthScore: how thoroughly the topic is explored
- confidenceScore: how confident and assured the response sounds

Also provide:
- overallScore: weighted average (accuracy 30%, clarity 25%, depth 30%, confidence 15%)
- feedback: 2-3 sentences of constructive feedback
- suggestions: array of 2-4 specific, actionable improvement tips

Respond with ONLY valid JSON, no markdown, no explanation. Format:
{
  "accuracyScore": number,
  "clarityScore": number,
  "depthScore": number,
  "confidenceScore": number,
  "overallScore": number,
  "feedback": "string",
  "suggestions": ["string", "string"]
}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content || '{}';
  const result = JSON.parse(content) as EvaluationResult;

  // Clamp all scores to 0-100
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  return {
    accuracyScore: clamp(result.accuracyScore ?? 50),
    clarityScore: clamp(result.clarityScore ?? 50),
    depthScore: clamp(result.depthScore ?? 50),
    confidenceScore: clamp(result.confidenceScore ?? 50),
    overallScore: clamp(result.overallScore ?? 50),
    feedback: result.feedback || 'No feedback provided.',
    suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
  };
}
