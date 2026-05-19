import express from "express";
import path from "path";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  // 0a. Admin Endpoints
  app.get('/api/admin/check', async (req, res) => (await import('./api/admin/check')).default(req, res));
  app.get('/api/admin/data', async (req, res) => (await import('./api/admin/data')).default(req, res));
  app.post('/api/admin/config', async (req, res) => (await import('./api/admin/config')).default(req, res));
  app.post('/api/admin/users', async (req, res) => (await import('./api/admin/users')).default(req, res));

  // 0b. Payment Endpoints
  app.post('/api/payment/create', async (req, res) => (await import('./api/payment/create')).default(req, res));
  app.post('/api/payment/callback', express.json(), express.urlencoded({ extended: true }), async (req, res) => (await import('./api/payment/callback')).default(req, res));

  // 1. Herr Gemini Chatbot
  app.post("/api/chat", async (req, res) => (await import('./api/chat')).default(req, res));

  // 2a. Generate Exercises
  app.post("/api/generate-exercises", async (req, res) => (await import('./api/generate-exercises')).default(req, res));

  // 2b. Check Free Text Answer
  app.post("/api/check-answer", async (req, res) => (await import('./api/check-answer')).default(req, res));

  // 2c. Generate 2 Example Sentences for Vocab
  app.post("/api/vocab-examples", async (req, res) => (await import('./api/vocab-examples')).default(req, res));

  // 3. Koreksi Kalimat
  app.post("/api/koreksi-kalimat", async (req, res) => (await import('./api/koreksi-kalimat')).default(req, res));

  // 4. Pronunciation guide (IPA/phonetic)
  app.post("/api/pronunciation", async (req, res) => (await import('./api/pronunciation')).default(req, res));

  // 5. Generate Study Plan
  app.post("/api/generate-study-plan", async (req, res) => (await import('./api/generate-study-plan')).default(req, res));

  // 6. Generate Mock Test
  app.post("/api/generate-mock-test", async (req, res) => (await import('./api/generate-mock-test')).default(req, res));

  // 7. Check Mock Test
  app.post("/api/check-mock-test", async (req, res) => (await import('./api/check-mock-test')).default(req, res));

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
