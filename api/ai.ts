import type { VercelRequest, VercelResponse } from '@vercel/node';
import { executeWithRouting, getRoutingConfig } from '../lib/ai-router.js';
import { getVerifiedIdentity, getUserTierById, isVerifiedAdmin, checkQuota, QUOTA_MESSAGES } from '../lib/api-utils.js';

// Rate limiter per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= maxRequests;
}

// Rate limits: Free=10/min, Pro=30/min
const FREE_RATE_LIMIT = 10;
const PRO_RATE_LIMIT = 30;

const CHAT_SYSTEM = `Anda "Herr Deutsch", seorang Tutor Bahasa Jerman profesional dan ramah untuk siswa Indonesia. Siswa ini berada di level {level}. Jawablah SEMUA pertanyaan dalam Bahasa Indonesia, tapi berikan istilah dan contoh dominan dalam bahasa Jerman dengan benar.`;

function getFriendlyError(error: any): { message: string; status: number } {
  const status = String(error?.status || '');
  const message = error?.message || '';
  if (status === '429' || message.includes('RESOURCE_EXHAUSTED') || message.includes('rate limit')) {
    return { message: 'Terlalu banyak permintaan. Herr Deutsch sedang istirahat sebentar. Coba lagi dalam 1-2 menit.', status: 429 };
  }
  if (status === '503' || message.includes('UNAVAILABLE')) {
    return { message: 'Layanan sedang sibuk. Herr Deutsch akan segera kembali. Silakan coba lagi.', status: 503 };
  }
  if (message.includes('SAFETY') || message.includes('BLOCKED')) {
    return { message: 'Permintaan tidak dapat diproses karena batasan keamanan.', status: 400 };
  }
  return { message: 'Herr Deutsch mengalami gangguan teknis. Silakan coba lagi.', status: 500 };
}

async function handleChat(uid: string, body: any, userTier: 'free' | 'pro' = 'free'): Promise<any> {
  const { message, history, level } = body;
  if (!message || typeof message !== 'string') {
    return { status: 400, data: { error: 'Message is required' } };
  }

  const systemPrompt = CHAT_SYSTEM.replace('{level}', level || 'A1');

  const { result } = await executeWithRouting(
    'chat',
    uid,
    async (client) => {
      const text = await client.chat(message, systemPrompt, history);
      return { status: 200, data: { text } };
    },
    async (client) => {
      const text = await client.chat(message, systemPrompt, history);
      return { status: 200, data: { text } };
    },
    userTier
  );

  return result;
}

async function handlePronunciation(uid: string, body: any, userTier: 'free' | 'pro' = 'free'): Promise<any> {
  const { word } = body;
  if (!word) return { status: 400, data: { error: 'Word is required' } };
  const prompt = `Berikan panduan singkat membaca kata berbahasa Jerman '${word}' untuk lidah orang Indonesia. Berikan format transliterasi sederhana yang mudah. Berikan satu kalimat tips cepat.`;
  const schema = { type: "OBJECT", properties: { phonetic: { type: "STRING" }, tip: { type: "STRING" } }, required: ["phonetic", "tip"] };

  const { result } = await executeWithRouting(
    'pronunciation',
    uid,
    async (client) => {
      const data = await client.generateJson(prompt, schema);
      return { status: 200, data };
    },
    async (client) => {
      const data = await client.generateJson(prompt, schema);
      return { status: 200, data };
    },
    userTier
  );

  return result;
}

async function handleVocabExamples(uid: string, body: any, userTier: 'free' | 'pro' = 'free'): Promise<any> {
  const { word, level } = body;
  if (!word) return { status: 400, data: { error: 'Word is required' } };
  const prompt = `Buatkan 2 contoh kalimat sederhana berbahasa Jerman menggunakan kata '${word}' untuk siswa level ${level || 'A1'}. Sertakan terjemahannya di bahasa Indonesia.`;
  const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { german: { type: "STRING" }, indonesian: { type: "STRING" } }, required: ["german", "indonesian"] } };

  const { result } = await executeWithRouting(
    'vocab-examples',
    uid,
    async (client) => {
      const data = await client.generateJson(prompt, schema);
      return { status: 200, data: { examples: data } };
    },
    async (client) => {
      const data = await client.generateJson(prompt, schema);
      return { status: 200, data: { examples: data } };
    },
    userTier
  );

  return result;
}

async function handleCheckAnswer(uid: string, body: any, userTier: 'free' | 'pro' = 'free'): Promise<any> {
  const { question, answer, level } = body;
  if (!question || !answer) return { status: 400, data: { error: 'Question and answer are required' } };
  const prompt = `Soal: ${question}\nJawaban siswa (${level || 'A1'}): ${answer}\n\nKoreksi jawaban ini. Berikan skor benar/salah, penjelasan dalam bahasa Indonesia, dan perbaikannya bila ada kesalahan.`;
  const schema = { type: "OBJECT", properties: { isCorrect: { type: "BOOLEAN" }, feedback: { type: "STRING" }, correctedSentence: { type: "STRING" } }, required: ["isCorrect", "feedback"] };

  const { result } = await executeWithRouting(
    'check-answer',
    uid,
    async (client) => {
      const data = await client.generateJson(prompt, schema);
      return { status: 200, data };
    },
    async (client) => {
      const data = await client.generateJson(prompt, schema);
      return { status: 200, data };
    },
    userTier
  );

  return result;
}

async function handleKoreksiKalimat(uid: string, body: any, userTier: 'free' | 'pro' = 'free'): Promise<any> {
  const { sentence } = body;
  if (!sentence) return { status: 400, data: { error: 'Sentence is required' } };
  const prompt = `Saya mencoba menulis kalimat bahasa Jerman ini: "${sentence}".\nTolong periksa tata bahasa, penggunaan artikel, kata kerja, dan susunan kalimatnya. Beri penjelasan dalam bahasa Indonesia, dan berikan kalimat yang benar.`;
  const schema = { type: "OBJECT", properties: { isPerfect: { type: "BOOLEAN" }, correctedSentence: { type: "STRING" }, explanation: { type: "STRING" } }, required: ["isPerfect", "correctedSentence", "explanation"] };

  const { result } = await executeWithRouting(
    'koreksi-kalimat',
    uid,
    async (client) => {
      const data = await client.generateJson(prompt, schema);
      return { status: 200, data };
    },
    async (client) => {
      const data = await client.generateJson(prompt, schema);
      return { status: 200, data };
    },
    userTier
  );

  return result;
}

async function handleGenerateExercises(uid: string, body: any, userTier: 'free' | 'pro' = 'free'): Promise<any> {
  const { level, grammarTopic, vocabulary } = body;
  if (!grammarTopic) return { status: 400, data: { error: 'Grammar topic is required' } };
  const prompt = `Buatkan 3 soal kuis mini pilihan ganda Bahasa Jerman untuk level ${level || 'A1'} berdasarkan materi: ${grammarTopic}. Gunakan kosa kata: ${vocabulary?.map((v: any) => v.word).join(', ') || '-'}. 4 opsi jawaban.`;
  const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { question: { type: "STRING" }, type: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } }, correctAnswerStr: { type: "STRING" }, hint: { type: "STRING" } }, required: ["question", "type", "correctAnswerStr"] } };

  const { result } = await executeWithRouting(
    'generate-exercises',
    uid,
    async (client) => {
      const data = await client.generateJson(prompt, schema);
      return { status: 200, data: { exercises: data } };
    },
    async (client) => {
      const data = await client.generateJson(prompt, schema);
      return { status: 200, data: { exercises: data } };
    },
    userTier
  );

  return result;
}

async function handleGenerateStudyPlan(uid: string, body: any, userTier: 'free' | 'pro' = 'free'): Promise<any> {
  const { level, xp, lessonsCompleted } = body;
  const prompt = `Saya adalah siswa bahasa Jerman di level ${level || 'A1'}. Saya memiliki ${xp || 0} XP dan telah menyelesaikan: ${(lessonsCompleted || []).join(",")}.\nBuatkan 10 poin fokus (checklist) yang spesifik. Gunakan bahasa Indonesia. JSON array dengan keys "id", "text", "completed" (selalu false).`;
  const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { id: { type: "STRING" }, text: { type: "STRING" }, completed: { type: "BOOLEAN" } }, required: ["id", "text", "completed"] } };

  const { result } = await executeWithRouting(
    'generate-study-plan',
    uid,
    async (client) => {
      const data = await client.generateJson(prompt, schema);
      return { status: 200, data: { tasks: data } };
    },
    async (client) => {
      const data = await client.generateJson(prompt, schema);
      return { status: 200, data: { tasks: data } };
    },
    userTier
  );

  return result;
}

async function handleGenerateMockTest(uid: string, body: any, userTier: 'free' | 'pro' = 'free'): Promise<any> {
  const { level } = body;
  const prompt = `Buatkan ujian simulasi bahasa Jerman level ${level || 'A1'} format Goethe/TELC. Total 20 soal pilihan ganda (Reading: 5, Grammar: 8, Vocab: 7). Output JSON array.`;
  const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { id: { type: "STRING" }, category: { type: "STRING" }, context: { type: "STRING" }, question: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } }, correctAnswer: { type: "STRING" } }, required: ["id", "category", "question", "options", "correctAnswer"] } };

  const { result } = await executeWithRouting(
    'generate-mock-test',
    uid,
    async (client) => {
      const data = await client.generateJson(prompt, schema);
      return { status: 200, data: { questions: data } };
    },
    async (client) => {
      const data = await client.generateJson(prompt, schema);
      return { status: 200, data: { questions: data } };
    },
    userTier
  );

  return result;
}

async function handleCheckMockTest(uid: string, body: any, userTier: 'free' | 'pro' = 'free'): Promise<any> {
  const { wrongAnswers, level } = body;
  if (!wrongAnswers || !Array.isArray(wrongAnswers)) {
    return { status: 400, data: { error: 'wrongAnswers array is required' } };
  }
  const prompt = `Siswa level ${level || 'A1'} salah menjawab: ${JSON.stringify(wrongAnswers)}. Berikan penjelasan singkat bahasa Indonesia untuk tiap soal salah.`;
  const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { question: { type: "STRING" }, explanation: { type: "STRING" } }, required: ["question", "explanation"] } };

  const { result } = await executeWithRouting(
    'check-mock-test',
    uid,
    async (client) => {
      const data = await client.generateJson(prompt, schema);
      return { status: 200, data: { feedback: data } };
    },
    async (client) => {
      const data = await client.generateJson(prompt, schema);
      return { status: 200, data: { feedback: data } };
    },
    userTier
  );

  return result;
}

async function handleListModels(uid: string, body: any): Promise<any> {
  const config = await getRoutingConfig();
  const models = config.models.map(m => ({
    id: m.id,
    name: m.name,
    provider: m.provider_id,
    isPrimary: m.id === config.primary.id,
    isFallback: m.id === config.fallback.id,
  }));
  return { status: 200, data: { models, primary: config.primary.id, fallback: config.fallback.id } };
}

type AIHandler = (uid: string, body: any, userTier?: 'free' | 'pro') => Promise<any>;

const HANDLERS: Record<string, AIHandler> = {
  'chat': handleChat,
  'pronunciation': handlePronunciation,
  'vocab-examples': handleVocabExamples,
  'check-answer': handleCheckAnswer,
  'koreksi-kalimat': handleKoreksiKalimat,
  'generate-exercises': handleGenerateExercises,
  'generate-study-plan': handleGenerateStudyPlan,
  'generate-mock-test': handleGenerateMockTest,
  'check-mock-test': handleCheckMockTest,
  'list-models': handleListModels,
};

/** AI temporarily empty/disabled until smart-fallback (Vans-style) is wired. */
function isAiRuntimeEnabled(): boolean {
  const v = (process.env.AI_ENABLED || '').trim().toLowerCase();
  if (v === '0' || v === 'false' || v === 'off' || v === 'no') return false;
  if ((process.env.AI_DISABLED || '').trim().toLowerCase() === 'true') return false;
  // default: enabled only when explicitly true OR unset with no empty-mode
  if (v === 'true' || v === '1' || v === 'on' || v === 'yes') return true;
  // empty/unset → treat as disabled during soft-launch (ponytail: flip AI_ENABLED=true later)
  if (v === '' || v === undefined) return false;
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'https://deutschup.sintec.my.id');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const action = (req.query.action as string) || req.body?.action;
  if (!action || !HANDLERS[action]) {
    return res.status(400).json({ error: `Invalid action. Valid: ${Object.keys(HANDLERS).join(', ')}` });
  }

  const identity = await getVerifiedIdentity(req);
  if (!identity) {
    return res.status(401).json({ error: 'Unauthorized — token required' });
  }

  // Soft-launch: AI empty until smart-fallback (VansRouter-style) is ready.
  // Auth still required so clients get a stable product response, not 500 from bad keys.
  if (!isAiRuntimeEnabled()) {
    return res.status(503).json({
      error: 'Fitur AI sementara nonaktif. Curriculum & belajar tetap jalan — AI smart-fallback segera hadir.',
      code: 'AI_DISABLED',
      aiEnabled: false,
      // ponytail: empty mode; set AI_ENABLED=true when Vans-style fallback is live
    });
  }

  if (action === 'list-models' && !(await isVerifiedAdmin(req))) {
    return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
  }

  const uid = identity.internalId;

  try {
    const userTier = await getUserTierById(uid);

    // Quota enforcement for free tier (chat/hr, simulasi/week)
    if (userTier !== 'pro' && (action === 'chat' || action === 'generate-mock-test')) {
      const quota = await checkQuota(uid, userTier, action);
      if (!quota.allowed) {
        res.setHeader('X-Quota-Limit', String(quota.limit));
        res.setHeader('X-Quota-Remaining', '0');
        res.setHeader('X-Quota-Reset', String(Math.ceil(quota.resetAt / 1000)));
        return res.status(402).json({
          error: QUOTA_MESSAGES[action] || 'Kuota Free telah habis. Upgrade ke Pro untuk akses tanpa batas.',
          code: 'QUOTA_EXCEEDED',
          limit: quota.limit,
          resetAt: quota.resetAt,
        });
      }
    }

    // Rate limit — Pro gets higher limit
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
    const maxReq = userTier === 'pro' ? PRO_RATE_LIMIT : FREE_RATE_LIMIT;
    if (!checkRateLimit(clientIp, maxReq, 60000)) {
      return res.status(429).json({ error: 'Terlalu banyak permintaan. Coba lagi dalam 1 menit.' });
    }

    const result = await HANDLERS[action](uid, req.body, userTier);
    return res.status(result.status).json(result.data);
  } catch (error: any) {
    const { message: friendlyMessage, status: errorStatus } = getFriendlyError(error);
    console.error(`[AI-ERROR] ${action}:`, error.message);
    return res.status(errorStatus).json({ error: friendlyMessage });
  }
}
