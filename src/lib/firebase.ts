import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigFile from '../../firebase-applet-config.json';

const firebaseConfig = {
  ...firebaseConfigFile,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigFile.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigFile.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigFile.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigFile.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigFile.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigFile.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigFile.measurementId,
};

const app = initializeApp(firebaseConfig);

// Analytics hanya jalan di browser yang support
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) getAnalytics(app);
  }).catch(() => {});
}

export const db = getFirestore(app, firebaseConfigFile.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
