import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Archive, ArchiveRestore, Trash2, Share2, Tag, FolderOpen, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RichEditor } from '@/components/notes/RichEditor';
import { AIPanel } from '@/components/ai/AIPanel';
import { useNoteStore } from '@/store/note.store';
import { useNotes } from '@/hooks/useNotes';
import { useDebounce } from '@/hooks/useDebounce';
import { noteService } from '@/services/note.service';
import { Note } from '@/types';

const CATEGORIES = ['General', 'Work', 'Personal', 'Learning', 'Ideas'];

export function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeNote, setActiveNote, updateNote } = useNoteStore();
  const { archiveNote, deleteNote, saveNote } = useNotes();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState('General');
  const [showMeta, setShowMeta] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);

  // Load note
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    noteService.getAll()
      .then((notes) => {
        const found = notes.find((n) => n._id === id);
        if (found) {
          setNote(found);
          setTitle(found.title);
          setContent(found.content);
          setTags(found.tags);
          setCategory(found.category);
          setActiveNote(found);
        } else {
          toast.error('Note not found');
          navigate('/notes');
        }
      })
      .catch(() => { toast.error('Failed to load note'); navigate('/notes'); })
      .finally(() => setLoading(false));
  }, [id]);

  // Autosave on debounced changes
  useEffect(() => {
    if (!note || loading) return;
    if (debouncedTitle === note.title && debouncedContent === note.content) return;
    saveNote(note._id, { title: debouncedTitle, content: debouncedContent });
    updateNote(note._id, { title: debouncedTitle, content: debouncedContent });
  }, [debouncedTitle, debouncedContent]);

  const handleTagAdd = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        const updated = [...tags, newTag];
        setTags(updated);
        if (note) {
          saveNote(note._id, { tags: updated });
          updateNote(note._id, { tags: updated });
        }
      }
      setTagInput('');
    }
  }, [tagInput, tags, note, saveNote, updateNote]);

  const handleTagRemove = useCallback((tag: string) => {
    const updated = tags.filter((t) => t !== tag);
    setTags(updated);
    if (note) {
      saveNote(note._id, { tags: updated });
      updateNote(note._id, { tags: updated });
    }
  }, [tags, note, saveNote, updateNote]);

  const handleCategoryChange = useCallback((cat: string) => {
    setCategory(cat);
    if (note) {
      saveNote(note._id, { category: cat });
      updateNote(note._id, { category: cat });
    }
  }, [note, saveNote, updateNote]);

  const handleShare = async () => {
    if (!note) return;
    try {
      const shareId = await noteService.share(note._id);
      const url = `${window.location.origin}/shared/${shareId}`;
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied!');
    } catch {
      toast.error('Failed to share note');
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    await deleteNote(note._id);
    navigate('/notes');
  };

  const handleArchive = async () => {
    if (!note) return;
    await archiveNote(note._id, !note.isArchived);
    navigate('/notes');
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1 p-6 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  if (!note) return null;

  return (
    <div className="flex h-full">
      {/* Main editor */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card/30">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate('/notes')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <span className="text-xs text-muted-foreground">
            Saved {format(new Date(note.updatedAt), 'h:mm a')}
          </span>

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowMeta(!showMeta)} className="gap-1.5 text-xs md:hidden">
              <Tag className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={handleShare} title="Share">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={handleArchive} title={note.isArchived ? 'Restore' : 'Archive'}>
              {note.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={handleDelete} title="Delete" className="text-red-400 hover:text-red-400 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="px-6 pt-6 pb-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Note"
            className="w-full text-2xl font-bold bg-transparent outline-none placeholder:text-muted-foreground/50 resize-none"
          />
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto">
          <RichEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your note..."
          />
        </div>
      </div>

      {/* Right panel — metadata + AI */}
      <div className={`
        ${showMeta ? 'flex' : 'hidden'} md:flex
        flex-col w-72 border-l border-border bg-card/20 p-4 gap-4 overflow-y-auto
        absolute md:relative inset-0 md:inset-auto z-20 md:z-auto bg-background md:bg-transparent
      `}>
        <div className="flex items-center justify-between md:hidden">
          <span className="font-semibold text-sm">Note Details</span>
          <Button variant="ghost" size="icon-sm" onClick={() => setShowMeta(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Category */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5" /> Category
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
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

        {/* Tags */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> Tags
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1.5">
                {tag}
                <button onClick={() => handleTagRemove(tag)} className="hover:text-red-400 transition-colors">
                  <X className="w-2.5 h-2.5" />
                </button>
              </Badge>
            ))}
          </div>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagAdd}
            placeholder="Add tag, press Enter"
            className="h-7 text-xs"
          />
        </div>

        {/* AI Panel */}
        <AIPanel
          noteId={note._id}
          existingSummary={note.aiSummary}
          existingActionItems={note.aiActionItems}
          onTitleSuggestion={(t) => setTitle(t)}
        />
      </div>
    </div>
  );
}
