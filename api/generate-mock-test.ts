import { runMiddleware, authMiddleware, getAiClient } from '../lib/api-utils.js';
import { Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await runMiddleware(req, res, authMiddleware);
    const ai = await getAiClient();
    const { level } = req.body;
    const response = await ai.models.generateContent({
      model: "gemma-4",
      contents: `Buatkan ujian simulasi (Mock Test) bahasa Jerman level ${level} dalam format resmi seperti (Goethe/TELC).
Total 20 soal pilihan ganda, dibagi menjadi 3 bagian (Reading: 5, Grammar: 8, Vocab: 7).
Tiap Reading question beri sedikit konteks teks bacaan pendek.
Output harus array JSON berisi soal-soal.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING, description: "Reading / Grammar / Vocabulary" },
              context: { type: Type.STRING, description: "Teks bacaan jika ini soal Reading (kosongkan jika bukan)" },
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.STRING, description: "Teks pilihan jawaban yang paling benar sedapat mungkin sama percis dengan string option" }
            },
            required: ["id", "category", "question", "options", "correctAnswer"]
          }
        }
      }
    });
    return res.json({ questions: JSON.parse(response.text?.trim() || "[]") });
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
