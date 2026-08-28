import type { ApiRequest, ApiResponse } from '../lib/http-types.js';
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

// ============================================================
// Mock test answer key — sealed server-side
// ============================================================
// The answer key never reaches the browser. It is AES-GCM encrypted into an
// opaque attempt token that only this API can open, so scoring stays server-side
// while the API itself remains stateless (no extra table / migration needed).

const ATTEMPT_TTL_MS = 45 * 60 * 1000; // 30 min test + grace for slow submits

function getWebCrypto(): Crypto {
  const c = (globalThis as any).crypto as Crypto | undefined;
  if (!c?.subtle) throw new Error('WebCrypto unavailable in this runtime');
  return c;
}

/** Secret for sealing attempt tokens. Falls back to other server-only secrets so
 *  the feature never silently degrades to shipping the answer key to the client. */
function getAttemptSecret(): string {
  return (
    process.env.MOCK_TEST_KEY_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ''
  ).trim();
}

async function getAttemptCryptoKey(): Promise<CryptoKey> {
  const secret = getAttemptSecret();
  if (!secret) throw new Error('No server secret available to seal mock-test answer key');
  const c = getWebCrypto();
  const material = await c.subtle.digest('SHA-256', new TextEncoder().encode(`mock-test:${secret}`));
  return c.subtle.importKey('raw', material, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

function bytesToB64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

type AttemptPayload = {
  v: 1;
  attemptId: string;
  uid: string;
  level: string;
  exp: number;
  key: Record<string, string>;
};

async function sealAttempt(payload: AttemptPayload): Promise<string> {
  const c = getWebCrypto();
  const cryptoKey = await getAttemptCryptoKey();
  const iv = c.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await c.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, new TextEncoder().encode(JSON.stringify(payload)))
  );
  const packed = new Uint8Array(iv.length + ciphertext.length);
  packed.set(iv, 0);
  packed.set(ciphertext, iv.length);
  return bytesToB64Url(packed);
}

async function openAttempt(token: string): Promise<AttemptPayload | null> {
  try {
    const packed = b64UrlToBytes(token);
    if (packed.length <= 12) return null;
    const c = getWebCrypto();
    const cryptoKey = await getAttemptCryptoKey();
    const plain = await c.subtle.decrypt(
      { name: 'AES-GCM', iv: packed.slice(0, 12) },
      cryptoKey,
      packed.slice(12)
    );
    const parsed = JSON.parse(new TextDecoder().decode(plain));
    if (!parsed || parsed.v !== 1 || !parsed.key) return null;
    return parsed as AttemptPayload;
  } catch {
    return null; // tampered, wrong secret, or malformed
  }
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

  if (result?.status !== 200) return result;

  // Split the model output: public questions for the client, answer key stays here.
  const raw: any[] = Array.isArray(result.data?.questions) ? result.data.questions : [];
  const answerKey: Record<string, string> = {};
  const questions = raw
    .map((q) => ({
      ...q,
      options: Array.isArray(q?.options) ? q.options.filter((o: any) => typeof o === 'string' && o) : [],
    }))
    .filter((q) => typeof q.question === 'string' && q.question && q.options.length > 1)
    .map((q, i) => {
      // Re-issue ids: the model sometimes emits duplicates, which would collide
      // in the client answer map and in the answer key.
      const id = `q${i + 1}`;
      answerKey[id] = typeof q.correctAnswer === 'string' ? q.correctAnswer : '';
      const question: Record<string, any> = {
        id,
        category: typeof q.category === 'string' && q.category ? q.category : 'Umum',
        question: q.question,
        options: q.options,
      };
      if (typeof q.context === 'string' && q.context) question.context = q.context;
      return question;
    });

  if (questions.length === 0) return { status: 200, data: { questions: [] } };

  const attemptId = bytesToB64Url(getWebCrypto().getRandomValues(new Uint8Array(12)));
  const expiresAt = Date.now() + ATTEMPT_TTL_MS;
  const attemptToken = await sealAttempt({
    v: 1,
    attemptId,
    uid,
    level: String(level || 'A1'),
    exp: expiresAt,
    key: answerKey,
  });

  return { status: 200, data: { questions, attemptId, attemptToken, expiresAt } };
}

// First scored result per attempt, kept in memory. Two jobs:
//  - a retry after a lost response returns the same result instead of re-scoring;
//  - re-submitting an attempt with different answers cannot probe the key.
// Best-effort only: serverless isolates are not shared, so it is a mitigation, not a guarantee.
const scoredAttempts = new Map<string, { data: any; at: number }>();

function rememberAttempt(attemptId: string, data: any) {
  const now = Date.now();
  for (const [id, entry] of scoredAttempts) {
    if (now - entry.at > ATTEMPT_TTL_MS) scoredAttempts.delete(id);
  }
  scoredAttempts.set(attemptId, { data, at: now });
}

/** Server-side scoring. The client never sees the key, so it cannot fake a score here. */
async function handleScoreMockTest(uid: string, body: any): Promise<any> {
  const { attemptToken, answers } = body || {};
  if (!attemptToken || typeof attemptToken !== 'string') {
    return { status: 400, data: { error: 'attemptToken diperlukan.' } };
  }

  const attempt = await openAttempt(attemptToken);
  if (!attempt) {
    return { status: 400, data: { error: 'Sesi simulasi tidak valid. Silakan mulai simulasi baru.' } };
  }
  if (attempt.uid !== uid) {
    return { status: 403, data: { error: 'Sesi simulasi ini bukan milik akun Anda.' } };
  }
  if (typeof attempt.exp !== 'number' || Date.now() > attempt.exp) {
    return { status: 410, data: { error: 'Sesi simulasi sudah kedaluwarsa. Silakan mulai simulasi baru.' } };
  }

  const cached = scoredAttempts.get(attempt.attemptId);
  if (cached) return { status: 200, data: cached.data };

  const submitted: Record<string, any> = answers && typeof answers === 'object' ? answers : {};
  const results = Object.keys(attempt.key).map((id) => {
    const correctAnswer = attempt.key[id];
    const userAnswer = typeof submitted[id] === 'string' ? submitted[id] : '';
    return { id, correctAnswer, userAnswer, isCorrect: userAnswer !== '' && userAnswer === correctAnswer };
  });
  const score = results.filter((r) => r.isCorrect).length;

  const data = { attemptId: attempt.attemptId, level: attempt.level, score, total: results.length, results };
  rememberAttempt(attempt.attemptId, data);
  return { status: 200, data };
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
  'score-mock-test': handleScoreMockTest,
  'check-mock-test': handleCheckMockTest,
  'list-models': handleListModels,
};

/** Actions that never call a model — they must keep working when AI is switched off,
 *  otherwise a student mid-simulation loses an already-consumed weekly attempt. */
const NON_AI_ACTIONS = new Set(['score-mock-test']);

/** AI on when AI_ENABLED=true (secret) OR a model provider key exists. Off only if explicitly false. */
function isAiRuntimeEnabled(): boolean {
  const v = (process.env.AI_ENABLED || '').trim().toLowerCase();
  if (v === '0' || v === 'false' || v === 'off' || v === 'no') return false;
  if ((process.env.AI_DISABLED || '').trim().toLowerCase() === 'true') return false;
  if (v === 'true' || v === '1' || v === 'on' || v === 'yes') return true;
  // CF Pages inherits secret_text; plain may be missing — enable if we can call a model.
  if ((process.env.GEMINI_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '').trim()) {
    return true;
  }
  return false;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'https://deutschup.sintec.my.id');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const action = (req.query.action as string) || req.body?.action;
  if (!action || !HANDLERS[action]) {
    // Generic error — never enumerate the handler surface. Matches /api/db-proxy.
    return res.status(400).json({ error: 'Invalid action' });
  }

  const identity = await getVerifiedIdentity(req);
  if (!identity) {
    return res.status(401).json({ error: 'Unauthorized — token required' });
  }

  if (!NON_AI_ACTIONS.has(action) && !isAiRuntimeEnabled()) {
    return res.status(503).json({
      error: 'Fitur AI sementara nonaktif. Curriculum & belajar tetap jalan.',
      code: 'AI_DISABLED',
      aiEnabled: false,
    });
  }

  if (action === 'list-models' && !(await isVerifiedAdmin(req))) {
    return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
  }

  const uid = identity.internalId;

  try {
    const userTier = await getUserTierById(uid);

    // Quota enforcement for free tier (chat/hr, simulasi/week, exercises/hr)
    if (userTier !== 'pro' && (action === 'chat' || action === 'generate-mock-test' || action === 'generate-exercises')) {
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
