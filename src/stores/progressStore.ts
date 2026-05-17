import { create } from 'zustand';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Level } from '../data/course';

export interface VocabProgress {
  status: 'learning' | 'known';
  nextReview: number;
}

export interface ProgressData {
  xp: number;
  streak: number;
  lastPracticeDate: string | null;
  currentLevel: Level;
  unlockedLessons: string[];
  vocab: Record<string, VocabProgress>;
}

interface ProgressState extends ProgressData {
  loading: boolean;
  initialized: boolean;
  loadProgress: (userId: string) => Promise<void>;
  addXp: (userId: string, amount: number) => Promise<void>;
  unlockLesson: (userId: string, lessonId: string) => Promise<void>;
  updateVocab: (userId: string, wordId: string, status: 'learning' | 'known') => Promise<void>;
  updateStreak: (userId: string) => Promise<void>;
}

const defaultProgress: ProgressData = {
  xp: 0,
  streak: 0,
  lastPracticeDate: null,
  currentLevel: 'A1',
  unlockedLessons: ['a1-1'], // always unlock first lesson
  vocab: {}
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  ...defaultProgress,
  loading: false,
  initialized: false,
  loadProgress: async (userId: string) => {
    set({ loading: true });
    try {
      const docRef = doc(db, 'users', userId, 'progress', 'main');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        set({ ...snap.data() as ProgressData, initialized: true, loading: false });
      } else {
        // Create default
        await setDoc(docRef, defaultProgress);
        set({ ...defaultProgress, initialized: true, loading: false });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `users/${userId}/progress/main`);
      set({ loading: false });
    }
  },
  addXp: async (userId: string, amount: number) => {
    const { xp } = get();
    const newXp = xp + amount;
    set({ xp: newXp });
    try {
      if(userId) {
        await updateDoc(doc(db, 'users', userId, 'progress', 'main'), { xp: newXp });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}/progress/main`);
    }
  },
  unlockLesson: async (userId: string, lessonId: string) => {
    const { unlockedLessons, currentLevel } = get();
    if (!unlockedLessons.includes(lessonId)) {
      const next = [...unlockedLessons, lessonId];
      // Update level logic simply finds the highest lesson level unlocked
      let newLevel = currentLevel;
      if (lessonId.startsWith('A2') && currentLevel === 'A1') newLevel = 'A2';
      if (lessonId.startsWith('B1') && (currentLevel === 'A1' || currentLevel === 'A2')) newLevel = 'B1';
      if (lessonId.startsWith('B2') && currentLevel !== 'B2') newLevel = 'B2';
      
      set({ unlockedLessons: next, currentLevel: newLevel });
      try {
        if(userId) {
          await updateDoc(doc(db, 'users', userId, 'progress', 'main'), { 
            unlockedLessons: next,
            currentLevel: newLevel
          });
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${userId}/progress/main`);
      }
    }
  },
  updateVocab: async (userId: string, wordId: string, status: 'learning' | 'known') => {
    const { vocab } = get();
    const nextReview = Date.now() + (status === 'known' ? 86400000 * 3 : 86400000); // 3 days if known, 1 day if learning
    const newVocab = { ...vocab, [wordId]: { status, nextReview } };
    set({ vocab: newVocab });
    try {
      if(userId) {
        await updateDoc(doc(db, 'users', userId, 'progress', 'main'), { vocab: newVocab });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}/progress/main`);
    }
  },
  updateStreak: async (userId: string) => {
    const { lastPracticeDate, streak } = get();
    const today = new Date().toISOString().split('T')[0];
    if (lastPracticeDate === today) return; // already practiced today
    
    let newStreak = streak;
    if (lastPracticeDate) {
      const lastDate = new Date(lastPracticeDate);
      const curr = new Date(today);
      const diffTime = Math.abs(curr.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }
    
    set({ streak: newStreak, lastPracticeDate: today });
    try {
      if(userId) {
        await updateDoc(doc(db, 'users', userId, 'progress', 'main'), { streak: newStreak, lastPracticeDate: today });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}/progress/main`);
    }
  }
}));
