import { getAiClient } from '../lib/api-utils.js';
import { withAiLogging } from '../lib/ai-logger.js';
import { Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const ai = await getAiClient();
    const { sentence } = req.body;
    const response = await withAiLogging(
      'koreksi-kalimat',
      'gemini-3-flash-preview',
      undefined,
      () => ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Saya mencoba menulis kalimat bahasa Jerman ini: "${sentence}".\nTolong periksa tata bahasa (grammar), penggunaan artikel, kata kerja, dan susunan kalimatnya. Beri penjelasan mendalam dalam bahasa Indonesia, dan berikan kalimat yang benar.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
             type: Type.OBJECT,
             properties: {
               isPerfect: { type: Type.BOOLEAN, description: "Apakah kalimat aslinya sudah sempurna tanpa ada kesalahan." },
               correctedSentence: { type: Type.STRING, description: "Bentuk kalimat yang 100% benar." },
               explanation: { type: Type.STRING, description: "Penjelasan lengkap titik kesalahannya dan aturan grammarnya." }
             },
             required: ["isPerfect", "correctedSentence", "explanation"]
          }
        }
      })
    );
    return res.json(JSON.parse(response.text?.trim() || "{}"));
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
