import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export type Note = {
  id: string;
  text: string;
  tag: 'Grammar' | 'Kosakata' | 'Pengucapan' | 'Umum';
  createdAt: number;
};

export type StudyTask = {
  id: string;
  text: string;
  completed: boolean;
};

export type StudyPlan = {
  id: string;
  tasks: StudyTask[];
};

export type QuickNote = {
  text: string;
  updatedAt: number;
};

export type MockTestResult = {
  id: string; // from doc id
  level: string;
  score: number;
  total: number;
  createdAt: number;
};

interface LearningState {
  notes: Note[];
  studyPlan: StudyPlan | null;
  quickNote: QuickNote | null;
  mockTests: MockTestResult[];
  loading: boolean;
  isListening: boolean;
  
  // Actions
  fetchData: (userId: string) => void;
  addNote: (userId: string, text: string, tag: Note['tag']) => Promise<void>;
  deleteNote: (userId: string, noteId: string) => Promise<void>;
  
  saveStudyPlan: (userId: string, tasks: StudyTask[]) => Promise<void>;
  toggleTask: (userId: string, taskId: string) => Promise<void>;
  
  saveQuickNote: (userId: string, text: string) => Promise<void>;
  saveMockTest: (userId: string, result: Omit<MockTestResult, 'id'>) => Promise<void>;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  notes: [],
  studyPlan: null,
  quickNote: null,
  mockTests: [],
  loading: false,
  isListening: false,

  fetchData: (userId) => {
    if (get().isListening) return;
    set({ loading: true, isListening: true });
    
    // Notes snapshot
    const notesRef = collection(db, `users/${userId}/notes`);
    onSnapshot(notesRef, (snap) => {
      const notes = snap.docs.map(D => ({ id: D.id, ...D.data() } as Note));
      notes.sort((a,b) => b.createdAt - a.createdAt);
      set({ notes });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/notes`);
    });

    // Study Plan snapshot
    const planRef = doc(db, `users/${userId}/studyplan/main`);
    onSnapshot(planRef, (docSnap) => {
      if (docSnap.exists()) {
        set({ studyPlan: { id: docSnap.id, tasks: docSnap.data().tasks } });
      } else {
        set({ studyPlan: null });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${userId}/studyplan/main`);
    });

    // Quick Note snapshot
    const qnRef = doc(db, `users/${userId}/quicknote/main`);
    onSnapshot(qnRef, (docSnap) => {
      if (docSnap.exists()) {
        set({ quickNote: docSnap.data() as QuickNote });
      } else {
        set({ quickNote: null });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${userId}/quicknote/main`);
    });

    // Mock Tests snapshot
    const mtRef = collection(db, `users/${userId}/mocktests`);
    onSnapshot(mtRef, (snap) => {
      const mockTests = snap.docs.map(D => ({ id: D.id, ...D.data() } as MockTestResult));
      mockTests.sort((a,b) => b.createdAt - a.createdAt);
      set({ mockTests });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/mocktests`);
    });

    set({ loading: false });
  },

  addNote: async (userId, text, tag) => {
    try {
      const newNoteRef = doc(collection(db, `users/${userId}/notes`));
      await setDoc(newNoteRef, {
        text,
        tag,
        createdAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${userId}/notes`);
    }
  },

  deleteNote: async (userId, noteId) => {
    try {
      await deleteDoc(doc(db, `users/${userId}/notes/${noteId}`));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}/notes/${noteId}`);
    }
  },

  saveStudyPlan: async (userId, tasks) => {
    try {
      await setDoc(doc(db, `users/${userId}/studyplan/main`), { tasks });
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, `users/${userId}/studyplan/main`);
    }
  },

  toggleTask: async (userId, taskId) => {
    const { studyPlan } = get();
    if (!studyPlan) return;
    const updatedTasks = studyPlan.tasks.map((t: StudyTask) => t.id === taskId ? { ...t, completed: !t.completed } : t);
    try {
      await setDoc(doc(db, `users/${userId}/studyplan/main`), { tasks: updatedTasks });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/studyplan/main`);
    }
  },

  saveQuickNote: async (userId, text) => {
    try {
      await setDoc(doc(db, `users/${userId}/quicknote/main`), { text, updatedAt: Date.now() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${userId}/quicknote/main`);
    }
  },

  saveMockTest: async (userId, result) => {
    try {
      const newTestRef = doc(collection(db, `users/${userId}/mocktests`));
      await setDoc(newTestRef, result);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${userId}/mocktests`);
    }
  }
}));

