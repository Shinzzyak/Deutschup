import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import crypto from "crypto";
import fs from "fs";

let firebaseConfig: any = {};
try {
  firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));
} catch (e) {
  console.log("No firebase-applet-config.json found");
}

if (!admin.apps.length && firebaseConfig.projectId) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId
  });
}

// Get the specific database for this applet
const getDb = () => {
  return getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId || '(default)');
};

async function getGeminiApiKey() {
  try {
    const configDoc = await getDb().collection('config').doc('global').get();
    if (configDoc.exists && configDoc.data()?.geminiApiKey) {
      return configDoc.data()!.geminiApiKey;
    }
  } catch(e) {}
  return process.env.GEMINI_API_KEY;
}

async function getAiClient() {
  const apiKey = await getGeminiApiKey();
  return new GoogleGenAI({ 
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // iPaymu configuration
  const IPAYMU_VA = process.env.IPAYMU_VA;
  const IPAYMU_API_KEY = process.env.IPAYMU_API_KEY;
  const IPAYMU_URL = process.env.IPAYMU_URL || 'https://sandbox.ipaymu.com';
  const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

  function generateIpaymuSignature(body: object, method: string = "POST") {
    const stringBody = JSON.stringify(body);
    const bodyHash = crypto.createHash('sha256').update(stringBody).digest('hex').toLowerCase();
    const stringToSign = `${method}:${IPAYMU_VA}:${bodyHash}:${IPAYMU_API_KEY}`;
    return crypto.createHmac('sha256', IPAYMU_API_KEY!).update(stringToSign).digest('hex').toLowerCase();
  }

  const authMiddleware = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedUser = await admin.auth().verifyIdToken(token);
      req.user = decodedUser;
      next();
    } catch (e) {
      console.error('Invalid token', e);
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  const adminMiddleware = async (req: any, res: any, next: any) => {
    if (req.user?.email && req.user.email === process.env.ADMIN_EMAIL) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  };

  // 0a. Admin Endpoints
  app.get('/api/admin/check', authMiddleware, adminMiddleware, (req: any, res: any) => {
    res.json({ ok: true });
  });

  app.get('/api/admin/data', authMiddleware, adminMiddleware, async (req: any, res: any) => {
    try {
      const usersSnap = await getDb().collection('users').get();
      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const configDoc = await getDb().collection('config').doc('global').get();
      let apiKeyMasked = '';
      if (configDoc.exists && configDoc.data()?.geminiApiKey) {
         const key = configDoc.data()!.geminiApiKey;
         apiKeyMasked = key.substring(0, 8) + '***' + key.substring(key.length - 4);
      }
      res.json({ users, apiKeyMasked });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/admin/config', authMiddleware, adminMiddleware, async (req: any, res: any) => {
    try {
      const { geminiApiKey } = req.body;
      await getDb().collection('config').doc('global').set({ geminiApiKey }, { merge: true });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/admin/users', authMiddleware, adminMiddleware, async (req: any, res: any) => {
    try {
      const { targetUserId, tier } = req.body;
      const expiry = tier !== 'free' ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null; // 30 days
      await getDb().collection('users').doc(targetUserId).set({ tier, tierExpiry: expiry }, { merge: true });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 0b. Payment Endpoints
  app.post('/api/payment/create', authMiddleware, async (req: any, res: any) => {
    try {
      const { userId, planType, email, name } = req.body;
      const price = planType === 'master' ? 99000 : 49000;
      
      const body = {
        account: IPAYMU_VA,
        product: [`DeutschUp ${planType.toUpperCase()}`],
        qty: ['1'],
        price: [price.toString()],
        returnUrl: `${APP_URL}/dashboard?payment=success`,
        notifyUrl: `${APP_URL}/api/payment/callback`,
        cancelUrl: `${APP_URL}/pricing?payment=cancel`,
        referenceId: `ORDER-${userId}-${Date.now()}`,
        buyerName: name || 'Student',
        buyerEmail: email || 'student@example.com'
      };

      const signature = generateIpaymuSignature(body);
      const ipaymuReq = await fetch(`${IPAYMU_URL}/api/v2/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'signature': signature,
          'va': IPAYMU_VA!
        },
        body: JSON.stringify(body)
      });
      
      const ipaymuRes: any = await ipaymuReq.json();
      if (ipaymuRes.Data && ipaymuRes.Data.SessionId) {
        // Save pending order
        await getDb().collection('orders').doc(ipaymuRes.Data.SessionId).set({
          userId,
          planType,
          status: 'pending',
          createdAt: Date.now()
        });
        res.json({ url: ipaymuRes.Data.Url });
      } else {
        res.status(400).json({ error: 'Failed from IPAYMU', details: ipaymuRes });
      }
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/payment/callback', express.urlencoded({ extended: true }), async (req: any, res: any) => {
    try {
      // iPaymu sends form-urlencoded data to notifyUrl
      const { trx_id, status, sid } = req.body;
      if (status === 'berhasil' || status === 'success') {
        const orderDoc = await getDb().collection('orders').doc(sid).get();
        if (orderDoc.exists) {
          const order = orderDoc.data()!;
          const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
          await getDb().collection('users').doc(order.userId).set({
            tier: order.planType,
            tierExpiry: expiry
          }, { merge: true });
          await getDb().collection('orders').doc(sid).update({ status: 'paid', paidAt: Date.now() });
        }
      }
      res.json({ success: true });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  // 1. Herr Gemini Chatbot
  app.post("/api/chat", authMiddleware, async (req: any, res: any) => {
    try {
      // Free Tier Limit Check
      const uid = req.user.uid;
      const userDoc = await getDb().collection('users').doc(uid).get();
      const tier = userDoc.data()?.tier || 'free';
      
      if (tier === 'free') {
         const today = new Date().toISOString().split('T')[0];
         const usageDate = userDoc.data()?.geminiLastDate;
         let usageCount = userDoc.data()?.geminiDailyUsage || 0;
         
         if (usageDate !== today) {
            usageCount = 0;
         }
         
         if (usageCount >= 10) {
            return res.status(403).json({ error: "Batas 10 pesan Herr Gemini tercapai hari ini untuk paket Free. Silakan Upgrade!" });
         }
         
         await getDb().collection('users').doc(uid).set({
            geminiLastDate: today,
            geminiDailyUsage: usageCount + 1
         }, { merge: true });
      }

      const ai = await getAiClient();
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
      const ai = await getAiClient();
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
      const ai = await getAiClient();
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
      res.json({ examples: JSON.parse(response.text?.trim() || "[]") });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // 3. Koreksi Kalimat
  app.post("/api/koreksi-kalimat", async (req, res) => {
    try {
      const ai = await getAiClient();
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
      const ai = await getAiClient();
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
      res.json({ tasks: JSON.parse(response.text?.trim() || "[]") });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // 6. Generate Mock Test
  app.post("/api/generate-mock-test", async (req, res) => {
    try {
      const ai = await getAiClient();
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
      const ai = await getAiClient();
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
