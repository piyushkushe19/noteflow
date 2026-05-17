import { create } from 'zustand';
import { Note } from '../types';

interface NoteState {
  notes: Note[];
  activeNote: Note | null;
  isLoading: boolean;
  isSaving: boolean;
  setNotes: (notes: Note[]) => void;
  setActiveNote: (note: Note | null) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, data: Partial<Note>) => void;
  removeNote: (id: string) => void;
  setLoading: (v: boolean) => void;
  setSaving: (v: boolean) => void;
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  activeNote: null,
  isLoading: false,
  isSaving: false,
  setNotes: (notes) => set({ notes }),
  setActiveNote: (note) => set({ activeNote: note }),
  addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
  updateNote: (id, data) =>
    set((s) => ({
      notes: s.notes.map((n) => (n._id === id ? { ...n, ...data } : n)),
      activeNote: s.activeNote?._id === id ? { ...s.activeNote, ...data } : s.activeNote,
    })),
  removeNote: (id) =>
    set((s) => ({
      notes: s.notes.filter((n) => n._id !== id),
      activeNote: s.activeNote?._id === id ? null : s.activeNote,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setSaving: (isSaving) => set({ isSaving }),
}));
