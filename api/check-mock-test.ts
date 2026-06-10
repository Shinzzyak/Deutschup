import { runMiddleware, authMiddleware, getAiClient } from '../lib/api-utils.js';
import { logAiRequest } from '../lib/ai-logger.js';
import { Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await runMiddleware(req, res, authMiddleware);
    const ai = await getAiClient();
    const { level, wrongAnswers } = req.body;
    // wrongAnswers: array of { question, userAnswer, correctAnswer }
    if (wrongAnswers.length === 0) {
      return res.json({ feedback: [] });
    }
    
    const response = await ai.models.generateContent({
      model: "gemma-4-31b-it",
      contents: `Seorang siswa bahasa Jerman level ${level} baru saja menyelesaikan simulasi ujian. Berikut ini daftar soal yang dijawab salah olehnya (format JSON): ${JSON.stringify(wrongAnswers)}.
Tolong berikan penjelasan singkat (1-2 kalimat) bahasa Indonesia untuk tiap soal salah: MENGAPA jawaban yang benar itu benar, dan mengapa pilihan siswa salah.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["question", "explanation"]
          }
        }
      }
    });
    return res.json({ feedback: JSON.parse(response.text?.trim() || "[]") });
    logAiRequest({
      userId: req.user?.id,
      endpoint: 'check-mock-test',
      model: 'gemma-4-31b-it',
      latencyMs: Date.now() - startTime,
      success: true,
    });
    return res.json({ feedback: JSON.parse(response.text?.trim() || "[]") });
  } catch (e: any) {
    logAiRequest({
      userId: req.user?.id,
      endpoint: 'check-mock-test',
      model: 'gemma-4-31b-it',
      latencyMs: Date.now() - startTime,
      success: false,
      errorMessage: e.message,
    });
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
