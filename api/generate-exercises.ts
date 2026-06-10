import { runMiddleware, authMiddleware, getAiClient } from '../lib/api-utils.js';
import { Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await runMiddleware(req, res, authMiddleware);
    const ai = await getAiClient();
    const { level, grammarTopic, vocabulary } = req.body;
    
    // FIX: Switch to Gemini 3.1 Flash Lite for better JSON handling
    // FIX: Simplified schema - all questions are multiple_choice with options always present
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `Buatkan 3 soal kuis pilihan ganda Bahasa Jerman untuk level ${level}.
Topik: ${grammarTopic}
Kosakata: ${vocabulary?.map((v:any) => v.word).join(', ') || '-'}
Setiap soal harus punya 4 opsi jawaban.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "4 opsi jawaban" 
              },
              correctAnswer: { type: Type.STRING },
              hint: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "hint"]
          }
        }
      }
    });
    
    const raw = response.text?.trim() || "[]";
    // FIX: Strip markdown code fences if present
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    return res.json({ exercises: JSON.parse(cleaned) });
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
