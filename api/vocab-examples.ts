import { runMiddleware, authMiddleware, getAiClient } from '../lib/api-utils.js';
import { Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await runMiddleware(req, res, authMiddleware);
    const ai = await getAiClient();
    const { word, level } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Buatkan 2 contoh kalimat sederhana berbahasa Jerman menggunakan kata '${word}' untuk siswa level ${level}. Sertakan terjemahannya di bahasa Indonesia.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.ARRAY,
           items: {
             type: Type.OBJECT,
             properties: {
               german: { type: Type.STRING },
               indonesian: { type: Type.STRING }
             },
             required: ["german", "indonesian"]
           }
        }
      }
    });
    return res.json({ examples: JSON.parse(response.text?.trim() || "[]") });
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
