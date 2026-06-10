import { logAiRequest } from "../lib/ai-logger.js";
import { runMiddleware, authMiddleware, getAiClient } from '../lib/api-utils.js';
import { Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  const startTime = Date.now();
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await runMiddleware(req, res, authMiddleware);
    const ai = await getAiClient();
    const { word } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
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
    });
    return res.json(JSON.parse(response.text?.trim() || "{}"));
    logAiRequest({
      userId: req.user?.id,
      endpoint: 'pronunciation',
      model: 'gemini-3.1-flash-lite',
      latencyMs: Date.now() - startTime,
      success: true,
    });
    return res.json(JSON.parse(response.text?.trim() || "{}"));
  } catch (e: any) {
    logAiRequest({
      userId: req.user?.id,
      endpoint: 'pronunciation',
      model: 'gemini-3.1-flash-lite',
      latencyMs: Date.now() - startTime,
      success: false,
      errorMessage: e.message,
    });
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
