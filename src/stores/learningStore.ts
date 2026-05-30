import { create } from 'zustand';
import { supabase } from '../lib/supabase';

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

  fetchData: async (userId) => {
    if (get().isListening) return;
    set({ loading: true, isListening: true });
    
    try {
      // Notes
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('createdAt', { ascending: false });
      if (notesError) throw notesError;
      set({ notes: notes as Note[] });

      // Study Plan
      const { data: plan, error: planError } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (planError && planError.code !== 'PGRST116') throw planError;
      set({ studyPlan: plan ? { id: plan.id, tasks: plan.tasks } : null });

      // Quick Note
      const { data: qn, error: qnError } = await supabase
        .from('quick_notes')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (qnError && qnError.code !== 'PGRST116') throw qnError;
      set({ quickNote: qn as QuickNote | null });

      // Mock Tests
      const { data: mockTests, error: mtError } = await supabase
        .from('mock_tests')
        .select('*')
        .eq('user_id', userId)
        .order('createdAt', { ascending: false });
      if (mtError) throw mtError;
      set({ mockTests: mockTests as MockTestResult[] });

    } catch (error) {
      console.error(`Error fetching learning data for ${userId}:`, error);
    } finally {
      set({ loading: false, isListening: false });
    }
  },

  addNote: async (userId, text, tag) => {
    try {
      const { error } = await supabase
        .from('notes')
        .insert({
          user_id: userId,
          text,
          tag,
          createdAt: Date.now()
        });
      if (error) throw error;
    } catch (error) {
      console.error(`Error adding note for ${userId}:`, error);
    }
  },

  deleteNote: async (userId, noteId) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', userId);
      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting note ${noteId} for ${userId}:`, error);
    }
  },

  saveStudyPlan: async (userId, tasks) => {
    try {
      const { error } = await supabase
        .from('study_plans')
        .upsert({ user_id: userId, tasks });
      if (error) throw error;
    } catch (error) {
       console.error(`Error saving study plan for ${userId}:`, error);
    }
  },

  toggleTask: async (userId, taskId) => {
    const { studyPlan } = get();
    if (!studyPlan) return;
    const updatedTasks = studyPlan.tasks.map((t: StudyTask) => t.id === taskId ? { ...t, completed: !t.completed } : t);
    try {
      const { error } = await supabase
        .from('study_plans')
        .upsert({ user_id: userId, tasks: updatedTasks });
      if (error) throw error;
    } catch (error) {
      console.error(`Error toggling task ${taskId} for ${userId}:`, error);
    }
  },

  saveQuickNote: async (userId, text) => {
    try {
      const { error } = await supabase
        .from('quick_notes')
        .upsert({ user_id: userId, text, updatedAt: Date.now() });
      if (error) throw error;
    } catch (error) {
      console.error(`Error saving quick note for ${userId}:`, error);
    }
  },

  saveMockTest: async (userId, result) => {
    try {
      const { error } = await supabase
        .from('mock_tests')
        .insert({ user_id: userId, ...result });
      if (error) throw error;
    } catch (error) {
      console.error(`Error saving mock test for ${userId}:`, error);
    }
  }
}));

