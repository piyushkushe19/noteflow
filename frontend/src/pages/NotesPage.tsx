import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { NoteCard } from '@/components/notes/NoteCard';
import { useNoteStore } from '@/store/note.store';
import { useNotes } from '@/hooks/useNotes';
import { useDebounce } from '@/hooks/useDebounce';
import { noteService } from '@/services/note.service';

interface NotesPageProps {
  archived?: boolean;
}

const CATEGORIES = ['All', 'Work', 'Personal', 'Learning', 'General'];

export function NotesPage({ archived = false }: NotesPageProps) {
  const navigate = useNavigate();
  const { notes, isLoading } = useNoteStore();
  const { loadNotes, createNote, archiveNote, deleteNote } = useNotes();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const debouncedSearch = useDebounce(search, 350);

  const load = useCallback(() => {
    loadNotes({
      archived,
      search: debouncedSearch || undefined,
      category: category !== 'All' ? category : undefined,
    });
  }, [archived, debouncedSearch, category, loadNotes]);

  useEffect(() => { load(); }, [load]);

  const handleNew = async () => {
    const note = await createNote();
    if (note) navigate(`/notes/${note._id}`);
  };

  const handleShare = async (id: string) => {
    try {
      const shareId = await noteService.share(id);
      const url = `${window.location.origin}/shared/${shareId}`;
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied to clipboard!');
    } catch {
      toast.error('Failed to create share link');
    }
  };

  const filteredNotes = notes.filter((n) => n.isArchived === archived);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{archived ? 'Archive' : 'Notes'}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filteredNotes.length} {archived ? 'archived' : ''} note{filteredNotes.length !== 1 ? 's' : ''}
          </p>
        </div>
        {!archived && (
          <Button onClick={handleNew} size="sm">
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">
            {archived ? 'No archived notes' : 'No notes yet'}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {archived
              ? 'Archived notes will appear here'
              : search
              ? 'Try a different search term'
              : 'Create your first note to get started'}
          </p>
          {!archived && !search && (
            <Button onClick={handleNew} size="sm">
              <Plus className="w-4 h-4" />
              Create note
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onArchive={archiveNote}
              onDelete={deleteNote}
              onShare={handleShare}
            />
          ))}
        </div>
      )}
    </div>
  );
}
