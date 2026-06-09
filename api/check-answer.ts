import { runMiddleware, authMiddleware, getAiClient } from '../lib/api-utils.js';
import { Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await runMiddleware(req, res, authMiddleware);
    const ai = await getAiClient();
    const { question, answer, level } = req.body;
    const response = await ai.models.generateContent({
      model: "gemma-4-31b-it",
      contents: `Soal: ${question}\nJawaban siswa (${level}): ${answer}\n\nKoreksi jawaban ini. Apakah maknanya benar dan grammar/artikelnya tepat? Berikan skor benar/salah, penjelasan dalam bahasa Indonesia, dan perbaikannya bila ada kesalahan.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN, description: "Bisa diterima benar atau tidak." },
            feedback: { type: Type.STRING, description: "Penjelasan mengapa benar/salah." },
            correctedSentence: { type: Type.STRING, description: "Versi sempurna bahasa Jerman." }
          },
          required: ["isCorrect", "feedback"]
        }
      }
    });
    return res.json(JSON.parse(response.text?.trim() || "{}"));
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
