import { useCallback } from 'react';
import { toast } from 'sonner';
import { noteService, NoteFilters } from '../services/note.service';
import { useNoteStore } from '../store/note.store';
import { Note } from '../types';

export function useNotes() {
  const { setNotes, addNote, updateNote, removeNote, setLoading, setSaving } = useNoteStore();

  const loadNotes = useCallback(async (filters: NoteFilters = {}) => {
    setLoading(true);
    try {
      const notes = await noteService.getAll(filters);
      setNotes(notes);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [setNotes, setLoading]);

  const createNote = useCallback(async () => {
    try {
      const note = await noteService.create({ title: 'Untitled Note', content: '' });
      addNote(note);
      return note;
    } catch {
      toast.error('Failed to create note');
      return null;
    }
  }, [addNote]);

  const saveNote = useCallback(async (id: string, data: Partial<Note>) => {
    setSaving(true);
    try {
      const updated = await noteService.update(id, data);
      updateNote(id, updated);
    } catch {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  }, [updateNote, setSaving]);

  const archiveNote = useCallback(async (id: string, isArchived: boolean) => {
    updateNote(id, { isArchived });
    try {
      await noteService.update(id, { isArchived });
      toast.success(isArchived ? 'Note archived' : 'Note restored');
    } catch {
      updateNote(id, { isArchived: !isArchived });
      toast.error('Failed to update note');
    }
  }, [updateNote]);

  const deleteNote = useCallback(async (id: string) => {
    removeNote(id);
    try {
      await noteService.delete(id);
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  }, [removeNote]);

  return { loadNotes, createNote, saveNote, archiveNote, deleteNote };
}
