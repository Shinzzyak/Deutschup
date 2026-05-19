import { GoogleGenAI } from "@google/genai";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
import "dotenv/config";

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
export const getDb = () => {
  return getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId || '(default)');
};

export async function getGeminiApiKey() {
  try {
    const configDoc = await getDb().collection('config').doc('global').get();
    if (configDoc.exists && configDoc.data()?.geminiApiKey) {
      return configDoc.data()!.geminiApiKey;
    }
  } catch(e) {}
  return process.env.GEMINI_API_KEY;
}

export async function getAiClient() {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tidak ditemukan. Silakan tambahkan di menu Admin atau Secrets.");
  }
  return new GoogleGenAI({ 
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
}

export const runMiddleware = (req: any, res: any, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      if (res.headersSent) return reject(new Error('Headers sent'));
      return resolve(result);
    });
  });
};

export const authMiddleware = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
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

export const adminMiddleware = async (req: any, res: any, next: any) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'abdullahalmughiroh@gmail.com';
  if (req.user?.email && req.user.email === adminEmail) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};
