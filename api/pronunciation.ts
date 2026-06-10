import { getAiClient } from '../lib/api-utils.js';
import { withAiLogging } from '../lib/ai-logger.js';
import { Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const ai = await getAiClient();
    const { word } = req.body;
    const response = await withAiLogging(
      'pronunciation',
      'gemini-3-flash-preview',
      undefined,
      () => ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Berikan panduan singkat membaca kata berbahasa Jerman '${word}' untuk lidah orang Indonesia. Berikan format transliterasi sederhana yang mudah (misal: "Mädchen" -> /me:t-syen/). Berikan satu kalimat tips cepat.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
             type: Type.OBJECT,
             properties: {
               phonetic: { type: Type.STRING, description: "Ejaan membaca untuk orang Indonesia (misal: shpel-en)" },
               tip: { type: Type.STRING, description: "Satu kalimat penekanan/tips baca." }
             },
             required: ["phonetic", "tip"]
          }
        }
      })
    );
    return res.json(JSON.parse(response.text?.trim() || "{}"));
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
