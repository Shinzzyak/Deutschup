import { logAiRequest } from "../lib/ai-logger.js";
import { runMiddleware, authMiddleware, getAiClient } from '../lib/api-utils.js';
import { Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  const startTime = Date.now();
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await runMiddleware(req, res, authMiddleware);
    const ai = await getAiClient();
    const { level, xp, lessonsCompleted } = req.body;

    // FIX: Simplified prompt + switched to Gemini for reliability
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `Buat 5 poin rencana belajar Bahasa Jerman untuk siswa level ${level} dengan ${xp} XP.
Pelajaran sudah selesai: ${lessonsCompleted?.join(", ") || "belum ada"}.
Buat poin yang belum dikuasai.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.ARRAY,
           items: {
             type: Type.OBJECT,
             properties: {
               text: { type: Type.STRING }
             },
             required: ["text"]
           }
        }
      }
    });

    const raw = response.text?.trim() || "[]";
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const tasks = JSON.parse(cleaned).map((t: any, i: number) => ({
      id: String(i + 1),
      text: t.text,
      completed: false
    }));

    return res.json({ tasks });
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
