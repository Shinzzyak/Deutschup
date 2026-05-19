import { getAiClient } from './utils';
import { Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const ai = await getAiClient();
    const { level, grammarTopic, vocabulary } = req.body;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Buatkan persis 3 soal kuis mini pilihan ganda (multiple_choice) Bahasa Jerman untuk level ${level} berdasarkan materi: ${grammarTopic}. Gunakan kosa kata berikut jika relevan: ${vocabulary?.map((v:any) => v.word).join(', ')}. Soal HARUS berupa pilihan ganda dengan 4 opsi jawaban.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "Pertanyaan atau soal" },
              type: { type: Type.STRING, description: "'multiple_choice' atau 'free_text'" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Pilihan jawaban jika type multiple_choice" 
              },
              correctAnswerStr: { type: Type.STRING, description: "Kunci jawaban persis (untuk string matching di text free_text, atau nilai teks di multiple_choice)" },
              hint: { type: Type.STRING, description: "Petunjuk dalam bahasa Indonesia" }
            },
            required: ["question", "type", "correctAnswerStr"]
          }
        }
      }
    });
    
    return res.json({ exercises: JSON.parse(response.text?.trim() || "[]") });
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
