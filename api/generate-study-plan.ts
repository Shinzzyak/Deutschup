import { runMiddleware, authMiddleware, getAiClient } from '../lib/api-utils.js';
import { Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await runMiddleware(req, res, authMiddleware);
    const ai = await getAiClient();
    const { level, xp, lessonsCompleted } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Saya adalah siswa bahasa Jerman di level ${level}. Saya memiliki ${xp} XP dan telah menyelesaikan pelajaran berikut: ${lessonsCompleted.join(", ")}.
Buatkan rencana belajar berupa 10 poin fokus (checklist) yang spesifik dan actionable untuk sesi saya selanjutnya.
Gunakan bahasa Indonesia. Output harus JSON array of objects dengan keys "id", "text", dan "completed" (selalu false).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.ARRAY,
           items: {
             type: Type.OBJECT,
             properties: {
               id: { type: Type.STRING },
               text: { type: Type.STRING },
               completed: { type: Type.BOOLEAN, description: "Set to false" }
             },
             required: ["id", "text", "completed"]
           }
        }
      }
    });
    return res.json({ tasks: JSON.parse(response.text?.trim() || "[]") });
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
