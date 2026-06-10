import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, getAiClient } from '../lib/api-utils.js';
import { logAiRequest } from '../lib/ai-logger.js';

const PRIMARY_MODEL = "gemini-3-flash-preview";
const FALLBACK_MODEL = "gemini-2.0-flash";
const MODEL_GEMMA = "gemma-3-1b-it";

const CHAT_SYSTEM = `Anda "Herr Deutsch", seorang Tutor Bahasa Jerman profesional dan ramah untuk siswa Indonesia. Siswa ini berada di level {level}. Jawablah SEMUA pertanyaan dalam Bahasa Indonesia, tapi berikan istilah dan contoh dominan dalam bahasa Jerman dengan benar.`;

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, baseDelay = 1000): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isRetryable = err?.status === 429 || err?.status === 503 || 
                          err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('UNAVAILABLE');
      if (!isRetryable || attempt === maxRetries) throw err;
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`[AI-RETRY] Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, err.message);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

function getFriendlyError(error: any): string {
  const status = String(error?.status || '');
  const message = error?.message || '';
  if (status === '429' || message.includes('RESOURCE_EXHAUSTED')) {
    return 'Terlalu banyak permintaan. Herr Deutsch sedang istirahat sebentar. Coba lagi dalam 1-2 menit.';
  }
  if (status === '503' || message.includes('UNAVAILABLE')) {
    return 'Layanan sedang sibuk. Herr Deutsch akan segera kembali. Silakan coba lagi.';
  }
  if (message.includes('SAFETY') || message.includes('BLOCKED')) {
    return 'Permintaan tidak dapat diproses karena batasan keamanan.';
  }
  return 'Herr Deutsch mengalami gangguan teknis. Silakan coba lagi.';
}

async function executeWithFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => Promise<T>
): Promise<T> {
  try {
    return await withRetry(primaryFn);
  } catch (primaryError: any) {
    console.warn('[AI-FALLBACK] Primary model failed, trying fallback:', primaryError.message);
    try {
      return await withRetry(fallbackFn, 1, 500);
    } catch (fallbackError: any) {
      console.error('[AI-FALLBACK] Both models failed:', { primary: primaryError.message, fallback: fallbackError.message });
      throw primaryError;
    }
  }
}

async function handleChat(uid: string, body: any): Promise<any> {
  const { message, history, level } = body;
  if (!message || typeof message !== 'string') {
    return { status: 400, data: { error: 'Message is required' } };
  }
  const formattedHistory = Array.isArray(history) ? history.map((msg: any) => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text }]
  })) : [];

  return await executeWithFallback(
    async () => {
      const ai = await getAiClient();
      const chat = ai.chats.create({
        model: PRIMARY_MODEL, history: formattedHistory,
        config: { systemInstruction: CHAT_SYSTEM.replace('{level}', level || 'A1') }
      });
      const response = await chat.sendMessage({ message });
      return { status: 200, data: { text: response.text } };
    },
    async () => {
      const ai = await getAiClient();
      const chat = ai.chats.create({
        model: FALLBACK_MODEL, history: formattedHistory,
        config: { systemInstruction: CHAT_SYSTEM.replace('{level}', level || 'A1') }
      });
      const response = await chat.sendMessage({ message });
      return { status: 200, data: { text: response.text } };
    }
  );
}

async function handlePronunciation(uid: string, body: any): Promise<any> {
  const { word } = body;
  if (!word) return { status: 400, data: { error: 'Word is required' } };
  const prompt = `Berikan panduan singkat membaca kata berbahasa Jerman '${word}' untuk lidah orang Indonesia. Berikan format transliterasi sederhana yang mudah. Berikan satu kalimat tips cepat.`;
  const schema = { type: "OBJECT", properties: { phonetic: { type: "STRING" }, tip: { type: "STRING" } }, required: ["phonetic", "tip"] };

  return await executeWithFallback(
    async () => {
      const ai = await getAiClient();
      const response = await ai.models.generateContent({ model: PRIMARY_MODEL, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
      return { status: 200, data: JSON.parse(response.text?.trim() || "{}") };
    },
    async () => {
      const ai = await getAiClient();
      const response = await ai.models.generateContent({ model: FALLBACK_MODEL, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
      return { status: 200, data: JSON.parse(response.text?.trim() || "{}") };
    }
  );
}

async function handleVocabExamples(uid: string, body: any): Promise<any> {
  const { word, level } = body;
  if (!word) return { status: 400, data: { error: 'Word is required' } };
  const prompt = `Buatkan 2 contoh kalimat sederhana berbahasa Jerman menggunakan kata '${word}' untuk siswa level ${level || 'A1'}. Sertakan terjemahannya di bahasa Indonesia.`;
  const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { german: { type: "STRING" }, indonesian: { type: "STRING" } }, required: ["german", "indonesian"] } };

  return await executeWithFallback(
    async () => {
      const ai = await getAiClient();
      const response = await ai.models.generateContent({ model: PRIMARY_MODEL, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
      return { status: 200, data: { examples: JSON.parse(response.text?.trim() || "[]") } };
    },
    async () => {
      const ai = await getAiClient();
      const response = await ai.models.generateContent({ model: FALLBACK_MODEL, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
      return { status: 200, data: { examples: JSON.parse(response.text?.trim() || "[]") } };
    }
  );
}

async function handleCheckAnswer(uid: string, body: any): Promise<any> {
  const { question, answer, level } = body;
  if (!question || !answer) return { status: 400, data: { error: 'Question and answer are required' } };
  const prompt = `Soal: ${question}\nJawaban siswa (${level || 'A1'}): ${answer}\n\nKoreksi jawaban ini. Berikan skor benar/salah, penjelasan dalam bahasa Indonesia, dan perbaikannya bila ada kesalahan.`;
  const schema = { type: "OBJECT", properties: { isCorrect: { type: "BOOLEAN" }, feedback: { type: "STRING" }, correctedSentence: { type: "STRING" } }, required: ["isCorrect", "feedback"] };

  return await executeWithFallback(
    async () => {
      const ai = await getAiClient();
      const response = await ai.models.generateContent({ model: PRIMARY_MODEL, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
      return { status: 200, data: JSON.parse(response.text?.trim() || "{}") };
    },
    async () => {
      const ai = await getAiClient();
      const response = await ai.models.generateContent({ model: FALLBACK_MODEL, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
      return { status: 200, data: JSON.parse(response.text?.trim() || "{}") };
    }
  );
}

async function handleKoreksiKalimat(uid: string, body: any): Promise<any> {
  const { sentence } = body;
  if (!sentence) return { status: 400, data: { error: 'Sentence is required' } };
  const prompt = `Saya mencoba menulis kalimat bahasa Jerman ini: "${sentence}".\nTolong periksa tata bahasa, penggunaan artikel, kata kerja, dan susunan kalimatnya. Beri penjelasan dalam bahasa Indonesia, dan berikan kalimat yang benar.`;
  const schema = { type: "OBJECT", properties: { isPerfect: { type: "BOOLEAN" }, correctedSentence: { type: "STRING" }, explanation: { type: "STRING" } }, required: ["isPerfect", "correctedSentence", "explanation"] };

  return await executeWithFallback(
    async () => {
      const ai = await getAiClient();
      const response = await ai.models.generateContent({ model: PRIMARY_MODEL, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
      return { status: 200, data: JSON.parse(response.text?.trim() || "{}") };
    },
    async () => {
      const ai = await getAiClient();
      const response = await ai.models.generateContent({ model: FALLBACK_MODEL, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
      return { status: 200, data: JSON.parse(response.text?.trim() || "{}") };
    }
  );
}

async function handleGenerateExercises(uid: string, body: any): Promise<any> {
  const { level, grammarTopic, vocabulary } = body;
  if (!grammarTopic) return { status: 400, data: { error: 'Grammar topic is required' } };
  const prompt = `Buatkan 3 soal kuis mini pilihan ganda Bahasa Jerman untuk level ${level || 'A1'} berdasarkan materi: ${grammarTopic}. Gunakan kosa kata: ${vocabulary?.map((v: any) => v.word).join(', ') || '-'}. 4 opsi jawaban.`;
  const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { question: { type: "STRING" }, type: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } }, correctAnswerStr: { type: "STRING" }, hint: { type: "STRING" } }, required: ["question", "type", "correctAnswerStr"] } };

  return await executeWithFallback(
    async () => {
      const ai = await getAiClient();
      const response = await ai.models.generateContent({ model: PRIMARY_MODEL, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
      return { status: 200, data: { exercises: JSON.parse(response.text?.trim() || "[]") } };
    },
    async () => {
      const ai = await getAiClient();
      const response = await ai.models.generateContent({ model: FALLBACK_MODEL, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
      return { status: 200, data: { exercises: JSON.parse(response.text?.trim() || "[]") } };
    }
  );
}

async function handleGenerateStudyPlan(uid: string, body: any): Promise<any> {
  const { level, xp, lessonsCompleted } = body;
  const prompt = `Saya adalah siswa bahasa Jerman di level ${level || 'A1'}. Saya memiliki ${xp || 0} XP dan telah menyelesaikan: ${(lessonsCompleted || []).join(",")}.\nBuatkan 10 poin fokus (checklist) yang spesifik. Gunakan bahasa Indonesia. JSON array dengan keys "id", "text", "completed" (selalu false).`;
  const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { id: { type: "STRING" }, text: { type: "STRING" }, completed: { type: "BOOLEAN" } }, required: ["id", "text", "completed"] } };

  return await executeWithFallback(
    async () => {
      const ai = await getAiClient();
      const response = await ai.models.generateContent({ model: PRIMARY_MODEL, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
      return { status: 200, data: { tasks: JSON.parse(response.text?.trim() || "[]") } };
    },
    async () => {
      const ai = await getAiClient();
      const response = await ai.models.generateContent({ model: FALLBACK_MODEL, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
      return { status: 200, data: { tasks: JSON.parse(response.text?.trim() || "[]") } };
    }
  );
}

async function handleGenerateMockTest(uid: string, body: any): Promise<any> {
  const { level } = body;
  const prompt = `Buatkan ujian simulasi bahasa Jerman level ${level || 'A1'} format Goethe/TELC. Total 20 soal pilihan ganda (Reading: 5, Grammar: 8, Vocab: 7). Output JSON array.`;
  const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { id: { type: "STRING" }, category: { type: "STRING" }, context: { type: "STRING" }, question: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } }, correctAnswer: { type: "STRING" } }, required: ["id", "category", "question", "options", "correctAnswer"] } };

  return await executeWithFallback(
    async () => {
      const ai = await getAiClient();
      const response = await ai.models.generateContent({ model: MODEL_GEMMA, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
      return { status: 200, data: { questions: JSON.parse(response.text?.trim() || "[]") } };
    },
    async () => {
      const ai = await getAiClient();
      const response = await ai.models.generateContent({ model: PRIMARY_MODEL, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
      return { status: 200, data: { questions: JSON.parse(response.text?.trim() || "[]") } };
    }
  );
}

async function handleCheckMockTest(uid: string, body: any): Promise<any> {
  const { wrongAnswers, level } = body;
  if (!wrongAnswers || !Array.isArray(wrongAnswers)) {
    return { status: 400, data: { error: 'wrongAnswers array is required' } };
  }
  const prompt = `Siswa level ${level || 'A1'} salah menjawab: ${JSON.stringify(wrongAnswers)}. Berikan penjelasan singkat bahasa Indonesia untuk tiap soal salah.`;
  const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { question: { type: "STRING" }, explanation: { type: "STRING" } }, required: ["question", "explanation"] } };

  return await executeWithFallback(
    async () => {
      const ai = await getAiClient();
      const response = await ai.models.generateContent({ model: MODEL_GEMMA, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
      return { status: 200, data: { feedback: JSON.parse(response.text?.trim() || "[]") } };
    },
    async () => {
      const ai = await getAiClient();
      const response = await ai.models.generateContent({ model: PRIMARY_MODEL, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
      return { status: 200, data: { feedback: JSON.parse(response.text?.trim() || "[]") } };
    }
  );
}

const HANDLERS: Record<string, (uid: string, body: any) => Promise<any>> = {
  'chat': handleChat,
  'pronunciation': handlePronunciation,
  'vocab-examples': handleVocabExamples,
  'check-answer': handleCheckAnswer,
  'koreksi-kalimat': handleKoreksiKalimat,
  'generate-exercises': handleGenerateExercises,
  'generate-study-plan': handleGenerateStudyPlan,
  'generate-mock-test': handleGenerateMockTest,
  'check-mock-test': handleCheckMockTest,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const action = (req.query.action as string) || req.body?.action;
  if (!action || !HANDLERS[action]) {
    return res.status(400).json({ error: `Invalid action. Valid: ${Object.keys(HANDLERS).join(', ')}` });
  }

  const uid = req.body?.uid || 'anonymous';
  const startTime = Date.now();

  try {
    const result = await HANDLERS[action](uid, req.body);
    const latencyMs = Date.now() - startTime;
    
    // Log AI request (non-blocking)
    logAiRequest({
      userId: uid,
      endpoint: action,
      model: action === 'chat' ? PRIMARY_MODEL : (action.includes('mock') ? MODEL_GEMMA : PRIMARY_MODEL),
      latencyMs,
      success: result.status === 200,
      errorMessage: result.data?.error || null,
    }).catch(() => {});

    return res.status(result.status).json(result.data);
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    const friendlyMessage = getFriendlyError(error);
    
    // Log error (non-blocking)
    logAiRequest({
      userId: uid,
      endpoint: action,
      model: PRIMARY_MODEL,
      latencyMs,
      success: false,
      errorMessage: error.message || 'Unknown error',
    }).catch(() => {});

    console.error(`[AI-ERROR] ${action}:`, error.message);
    return res.status(500).json({ error: friendlyMessage });
  }
}
