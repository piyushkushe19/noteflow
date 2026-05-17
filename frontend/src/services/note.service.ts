import api from './api';
import { Note, AIResult, SharedNote } from '../types';

export interface NoteFilters {
  search?: string;
  tag?: string;
  category?: string;
  archived?: boolean;
}

export const noteService = {
  getAll: async (filters: NoteFilters = {}) => {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.tag) params.tag = filters.tag;
    if (filters.category) params.category = filters.category;
    if (filters.archived !== undefined) params.archived = String(filters.archived);
    const res = await api.get('/notes', { params });
    return res.data.notes as Note[];
  },
  create: async (data: Partial<Note>) => {
    const res = await api.post('/notes', data);
    return res.data.note as Note;
  },
  update: async (id: string, data: Partial<Note>) => {
    const res = await api.patch(`/notes/${id}`, data);
    return res.data.note as Note;
  },
  delete: async (id: string) => {
    await api.delete(`/notes/${id}`);
  },
  generateAI: async (id: string) => {
    const res = await api.post(`/notes/${id}/generate-ai`);
    return res.data as AIResult;
  },
  share: async (id: string) => {
    const res = await api.post(`/notes/${id}/share`);
    return res.data.shareId as string;
  },
  revokeShare: async (id: string) => {
    await api.delete(`/notes/${id}/share`);
  },
  getShared: async (shareId: string) => {
    const res = await api.get(`/shared/${shareId}`);
    return res.data.note as SharedNote;
  },
};
