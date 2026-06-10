import { logAiRequest } from "../lib/ai-logger.js";
import { runMiddleware, authMiddleware, getAiClient } from '../lib/api-utils.js';
import { Type } from "@google/genai";

function extractJson(text: string): any {
  let cleaned = text.trim();
  // Strip markdown code fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }
  return JSON.parse(cleaned);
}

export default async function handler(req: any, res: any) {
  const startTime = Date.now();
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await runMiddleware(req, res, authMiddleware);
    const ai = await getAiClient();
    const { sentence } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `Saya mencoba menulis kalimat bahasa Jerman ini: "${sentence}".\nTolong periksa tata bahasa (grammar), penggunaan artikel, kata kerja, dan susunan kalimatnya. Beri penjelasan mendalam dalam bahasa Indonesia, dan berikan kalimat yang benar.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.OBJECT,
           properties: {
             isPerfect: { type: Type.BOOLEAN, description: "Apakah kalimat asli sudah sempurna." },
             correctedSentence: { type: Type.STRING, description: "Kalimat yang benar." },
             explanation: { type: Type.STRING, description: "Penjelasan kesalahan dan aturan grammar." }
           },
           required: ["isPerfect", "correctedSentence", "explanation"]
        }
      }
    });
    return res.json(extractJson(response.text || "{}"));
    logAiRequest({
      userId: req.user?.id,
      endpoint: 'koreksi-kalimat',
      model: 'gemini-3.1-flash-lite',
      latencyMs: Date.now() - startTime,
      success: true,
    });
    return res.json(JSON.parse(response.text?.trim() || "{}"));
  } catch (e: any) {
    logAiRequest({
      userId: req.user?.id,
      endpoint: 'koreksi-kalimat',
      model: 'gemini-3.1-flash-lite',
      latencyMs: Date.now() - startTime,
      success: false,
      errorMessage: e.message,
    });
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
