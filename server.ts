import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  // 1. Herr Gemini Chatbot
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, level } = req.body;
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `Anda "Herr Gemini", seorang Tutor Bahasa Jerman profesional dan ramah untuk siswa Indonesia. Siswa ini berada di level ${level || 'A1'}. 
Jawablah SEMUA pertanyaan dalam Bahasa Indonesia, tapi berikan istilah dan contoh dominan dalam bahasa Jerman dengan benar. 
- Jika siswa salah, koreksi kesalahannya dengan ramah.
- Jelaskan tata bahasa secara jelas dan terstruktur.
- Apabila siswa minta kuis, berikan soal (grammar atau vocab) satu demi satu.
- Jangan keluar dari konteks ini. Jangan bicara hal-hal lain di luar belajar bahasa Jerman.`,
        }
      });
      
      const response = await chat.sendMessage({
        message: message,
      });
      res.json({ text: response.text });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // 2a. Generate Exercises
  app.post("/api/generate-exercises", async (req, res) => {
    try {
      const { level, grammarTopic, vocabulary } = req.body;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Buatkan 3 soal latihan Bahasa Jerman untuk level ${level} berdasarkan materi: ${grammarTopic}. Gunakan beberapa kosa kata berikut jika relevan: ${vocabulary.map((v:any) => v.word).join(', ')}. Soal bisa berupa pilihan ganda atau isian singkat (free_text).`,
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
      
      res.json({ exercises: JSON.parse(response.text?.trim() || "[]") });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // 2b. Check Free Text Answer
  app.post("/api/check-answer", async (req, res) => {
    try {
      const { question, answer, level } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Soal: ${question}\nJawaban siswa (${level}): ${answer}\n\nKoreksi jawaban ini. Apakah maknanya benar dan grammar/artikelnya tepat? Berikan skor benar/salah, penjelasan dalam bahasa Indonesia, dan perbaikannya bila ada kesalahan.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCorrect: { type: Type.BOOLEAN, description: "Bisa diterima benar atau tidak." },
              feedback: { type: Type.STRING, description: "Penjelasan mengapa benar/salah." },
              correctedSentence: { type: Type.STRING, description: "Versi sempurna bahasa Jerman." }
            },
            required: ["isCorrect", "feedback"]
          }
        }
      });
      res.json(JSON.parse(response.text?.trim() || "{}"));
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // 2c. Generate 2 Example Sentences for Vocab
  app.post("/api/vocab-examples", async (req, res) => {
    try {
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
      res.json({ examples: JSON.parse(response.text?.trim() || "[]") });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // 3. Koreksi Kalimat
  app.post("/api/koreksi-kalimat", async (req, res) => {
    try {
      const { sentence } = req.body;
      const response = await ai.models.generateContent({
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
      });
      res.json(JSON.parse(response.text?.trim() || "{}"));
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // 4. Pronunciation guide (IPA/phonetic)
  app.post("/api/pronunciation", async (req, res) => {
    try {
      const { word } = req.body;
      const response = await ai.models.generateContent({
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
      });
      res.json(JSON.parse(response.text?.trim() || "{}"));
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // 5. Generate Study Plan
  app.post("/api/generate-study-plan", async (req, res) => {
    try {
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
      res.json({ tasks: JSON.parse(response.text?.trim() || "[]") });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // 6. Generate Mock Test
  app.post("/api/generate-mock-test", async (req, res) => {
    try {
      const { level } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
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
      res.json({ questions: JSON.parse(response.text?.trim() || "[]") });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // 7. Check Mock Test
  app.post("/api/check-mock-test", async (req, res) => {
    try {
      const { level, wrongAnswers } = req.body;
      // wrongAnswers: array of { question, userAnswer, correctAnswer }
      if (wrongAnswers.length === 0) {
        return res.json({ feedback: [] });
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Seorang siswa bahasa Jerman level ${level} baru saja menyelesaikan simulasi ujian. Berikut ini daftar soal yang dijawab salah olehnya (format JSON): ${JSON.stringify(wrongAnswers)}.
Tolong berikan penjelasan singkat (1-2 kalimat) bahasa Indonesia untuk tiap soal salah: MENGAPA jawaban yang benar itu benar, dan mengapa pilihan siswa salah.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["question", "explanation"]
            }
          }
        }
      });
      res.json({ feedback: JSON.parse(response.text?.trim() || "[]") });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
