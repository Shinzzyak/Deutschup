import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, getAiClient } from '../lib/api-utils.js';
import { logAiRequest } from '../lib/ai-logger.js';

const MODEL = "gemini-3-flash-preview";
const MODEL_GEMMA = "gemma-3-1b-it";

// System prompts
const CHAT_SYSTEM = `Anda "Herr Deutsch", seorang Tutor Bahasa Jerman profesional dan ramah untuk siswa Indonesia. Siswa ini berada di level {level}. 
Jawablah SEMUA pertanyaan dalam Bahasa Indonesia, tapi berikan istilah dan contoh dominan dalam bahasa Jerman dengan benar. 
- Jika siswa salah, koreksi kesalahannya dengan ramah.
- Jelaskan tata bahasa secara jelas dan terstruktur.
- Apabila siswa minta kuis, berikan soal (grammar atau vocab) satu demi satu.
- Jangan keluar dari konteks ini. Jangan bicara hal-hal lain di luar belajar bahasa Jerman.`;

const KOREKSI_SYSTEM = `Anda adalah tutor bahasa Jerman yang ahli dalam mengoreksi kalimat. Periksa grammar, artikel, kata kerja, dan susunan kalimat. Beri penjelasan dalam bahasa Indonesia.`;

const CHECK_ANSWER_SYSTEM = `Anda adalah tutor bahasa Jerman yang menilai jawaban siswa. Berikan feedback dalam bahasa Indonesia.`;

// Handler: Chat
async function handleChat(uid: string, body: any): Promise<any> {
  const { message, history, level } = body;
  if (!message || typeof message !== 'string') {
    return { status: 400, data: { error: 'Message is required' } };
  }

  const ai = await getAiClient();
  const formattedHistory = Array.isArray(history) ? history.map((msg: any) => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text }]
  })) : [];

  const chat = ai.chats.create({
    model: MODEL,
    history: formattedHistory,
    config: { systemInstruction: CHAT_SYSTEM.replace('{level}', level || 'A1') }
  });
  
  const response = await chat.sendMessage({ message });
  return { status: 200, data: { text: response.text } };
}

// Handler: Pronunciation
async function handlePronunciation(uid: string, body: any): Promise<any> {
  const { word } = body;
  if (!word) return { status: 400, data: { error: 'Word is required' } };

  const ai = await getAiClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Berikan panduan singkat membaca kata berbahasa Jerman '${word}' untuk lidah orang Indonesia. Berikan format transliterasi sederhana yang mudah (misal: "Mädchen" -> /me:t-syen/). Berikan satu kalimat tips cepat.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          phonetic: { type: "STRING", description: "Ejaan membaca untuk orang Indonesia" },
          tip: { type: "STRING", description: "Satu kalimat penekanan/tips baca." }
        },
        required: ["phonetic", "tip"]
      }
    }
  });
  return { status: 200, data: JSON.parse(response.text?.trim() || "{}") };
}

// Handler: Vocab Examples
async function handleVocabExamples(uid: string, body: any): Promise<any> {
  const { word, level } = body;
  if (!word) return { status: 400, data: { error: 'Word is required' } };

  const ai = await getAiClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Buatkan 2 contoh kalimat sederhana berbahasa Jerman menggunakan kata '${word}' untuk siswa level ${level || 'A1'}. Sertakan terjemahannya di bahasa Indonesia.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            german: { type: "STRING" },
            indonesian: { type: "STRING" }
          },
          required: ["german", "indonesian"]
        }
      }
    }
  });
  return { status: 200, data: { examples: JSON.parse(response.text?.trim() || "[]") } };
}

// Handler: Check Answer
async function handleCheckAnswer(uid: string, body: any): Promise<any> {
  const { question, answer, level } = body;
  if (!question || !answer) return { status: 400, data: { error: 'Question and answer are required' } };

  const ai = await getAiClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Soal: ${question}\nJawaban siswa (${level || 'A1'}): ${answer}\n\nKoreksi jawaban ini. Apakah maknanya benar dan grammar/artikelnya tepat? Berikan skor benar/salah, penjelasan dalam bahasa Indonesia, dan perbaikannya bila ada kesalahan.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          isCorrect: { type: "BOOLEAN", description: "Bisa diterima benar atau tidak." },
          feedback: { type: "STRING", description: "Penjelasan mengapa benar/salah." },
          correctedSentence: { type: "STRING", description: "Versi sempurna bahasa Jerman." }
        },
        required: ["isCorrect", "feedback"]
      }
    }
  });
  return { status: 200, data: JSON.parse(response.text?.trim() || "{}") };
}

// Handler: Koreksi Kalimat
async function handleKoreksiKalimat(uid: string, body: any): Promise<any> {
  const { sentence } = body;
  if (!sentence) return { status: 400, data: { error: 'Sentence is required' } };

  const ai = await getAiClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Saya mencoba menulis kalimat bahasa Jerman ini: "${sentence}".\nTolong periksa tata bahasa (grammar), penggunaan artikel, kata kerja, dan susunan kalimatnya. Beri penjelasan mendalam dalam bahasa Indonesia, dan berikan kalimat yang benar.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          isPerfect: { type: "BOOLEAN", description: "Apakah kalimat aslinya sudah sempurna tanpa ada kesalahan." },
          correctedSentence: { type: "STRING", description: "Bentuk kalimat yang 100% benar." },
          explanation: { type: "STRING", description: "Penjelasan lengkap titik kesalahannya dan aturan grammarnya." }
        },
        required: ["isPerfect", "correctedSentence", "explanation"]
      }
    }
  });
  return { status: 200, data: JSON.parse(response.text?.trim() || "{}") };
}

// Handler: Generate Exercises
async function handleGenerateExercises(uid: string, body: any): Promise<any> {
  const { level, grammarTopic, vocabulary } = body;
  if (!grammarTopic) return { status: 400, data: { error: 'Grammar topic is required' } };

  const ai = await getAiClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Buatkan persis 3 soal kuis mini pilihan ganda (multiple_choice) Bahasa Jerman untuk level ${level || 'A1'} berdasarkan materi: ${grammarTopic}. Gunakan kosa kata berikut jika relevan: ${vocabulary?.map((v: any) => v.word).join(', ') || ''}. Soal HARUS berupa pilihan ganda dengan 4 opsi jawaban.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            question: { type: "STRING", description: "Pertanyaan atau soal" },
            type: { type: "STRING", description: "'multiple_choice' atau 'free_text'" },
            options: { type: "ARRAY", items: { type: "STRING" }, description: "Pilihan jawaban jika type multiple_choice" },
            correctAnswerStr: { type: "STRING", description: "Kunci jawaban persis" },
            hint: { type: "STRING", description: "Petunjuk dalam bahasa Indonesia" }
          },
          required: ["question", "type", "correctAnswerStr"]
        }
      }
    }
  });
  return { status: 200, data: { exercises: JSON.parse(response.text?.trim() || "[]") } };
}

// Handler: Generate Study Plan
async function handleGenerateStudyPlan(uid: string, body: any): Promise<any> {
  const { level, xp, lessonsCompleted } = body;
  
  const ai = await getAiClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Saya adalah siswa bahasa Jerman di level ${level || 'A1'}. Saya memiliki ${xp || 0} XP dan telah menyelesaikan pelajaran berikut: ${(lessonsCompleted || []).join(", ")}.\nBuatkan rencana belajar berupa 10 poin fokus (checklist) yang spesifik dan actionable untuk sesi saya selanjutnya.\nGunakan bahasa Indonesia. Output harus JSON array of objects dengan keys "id", "text", dan "completed" (selalu false).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            text: { type: "STRING" },
            completed: { type: "BOOLEAN", description: "Set to false" }
          },
          required: ["id", "text", "completed"]
        }
      }
    }
  });
  return { status: 200, data: { tasks: JSON.parse(response.text?.trim() || "[]") } };
}

// Handler: Generate Mock Test
async function handleGenerateMockTest(uid: string, body: any): Promise<any> {
  const { level } = body;
  
  const ai = await getAiClient();
  const response = await ai.models.generateContent({
    model: MODEL_GEMMA,
    contents: `Buatkan ujian simulasi (Mock Test) bahasa Jerman level ${level || 'A1'} dalam format resmi seperti (Goethe/TELC).\nTotal 20 soal pilihan ganda, dibagi menjadi 3 bagian (Reading: 5, Grammar: 8, Vocab: 7).\nTiap Reading question beri sedikit konteks teks bacaan pendek.\nOutput harus array JSON berisi soal-soal.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            category: { type: "STRING", description: "Reading / Grammar / Vocabulary" },
            context: { type: "STRING", description: "Teks bacaan jika ini soal Reading" },
            question: { type: "STRING" },
            options: { type: "ARRAY", items: { type: "STRING" } },
            correctAnswer: { type: "STRING", description: "Teks pilihan jawaban yang paling benar" }
          },
          required: ["id", "category", "question", "options", "correctAnswer"]
        }
      }
    }
  });
  return { status: 200, data: { questions: JSON.parse(response.text?.trim() || "[]") } };
}

// Handler: Check Mock Test
async function handleCheckMockTest(uid: string, body: any): Promise<any> {
  const { wrongAnswers, level } = body;
  if (!wrongAnswers || !Array.isArray(wrongAnswers)) {
    return { status: 400, data: { error: 'wrongAnswers array is required' } };
  }

  const ai = await getAiClient();
  const response = await ai.models.generateContent({
    model: MODEL_GEMMA,
    contents: `Seorang siswa bahasa Jerman level ${level || 'A1'} baru saja menyelesaikan simulasi ujian. Berikut ini daftar soal yang dijawab salah olehnya (format JSON): ${JSON.stringify(wrongAnswers)}.\nTolong berikan penjelasan singkat (1-2 kalimat) bahasa Indonesia untuk tiap soal salah: MENGAPA jawaban yang benar itu benar, dan mengapa pilihan siswa salah.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            question: { type: "STRING" },
            explanation: { type: "STRING" }
          },
          required: ["question", "explanation"]
        }
      }
    }
  });
  return { status: 200, data: { feedback: JSON.parse(response.text?.trim() || "[]") } };
}

// Action → handler mapping
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
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const action = (req.query.action as string) || req.body?.action;
  if (!action || !HANDLERS[action]) {
    return res.status(400).json({ error: `Invalid action. Valid: ${Object.keys(HANDLERS).join(', ')}` });
  }

  const startTime = Date.now();
  let success = true;
  let errorMessage: string | undefined;

  try {
    // Auth - extract uid from token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // For now, use a simple uid extraction - in production, verify JWT
    const uid = req.body?.uid || 'anonymous';

    const result = await HANDLERS[action](uid, req.body);
    
    logAiRequest({
      userId: uid,
      endpoint: `ai/${action}`,
      model: action.includes('mock') ? MODEL_GEMMA : MODEL,
      latencyMs: Date.now() - startTime,
      success: true,
    });

    return res.status(result.status || 200).json(result.data);
  } catch (e: any) {
    success = false;
    errorMessage = e.message;
    
    logAiRequest({
      userId: req.body?.uid || 'anonymous',
      endpoint: `ai/${action}`,
      model: action.includes('mock') ? MODEL_GEMMA : MODEL,
      latencyMs: Date.now() - startTime,
      success: false,
      errorMessage: e.message,
    });

    console.error(`[AI] Error in ${action}:`, e);
    if (!res.headersSent) {
      return res.status(500).json({ error: e.message || 'Internal server error' });
    }
  }
}
