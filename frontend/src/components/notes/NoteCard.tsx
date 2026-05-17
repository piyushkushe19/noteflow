import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { MoreHorizontal, Archive, ArchiveRestore, Trash2, Sparkles, Share2 } from 'lucide-react';
import { Note } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface NoteCardProps {
  note: Note;
  onArchive: (id: string, archived: boolean) => void;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}

export function NoteCard({ note, onArchive, onDelete, onShare }: NoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const plainContent = note.content
    ? note.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
    : '';

  return (
    <div className={cn(
      'bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-all group animate-fade-in',
      note.isArchived && 'opacity-70'
    )}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link to={`/notes/${note._id}`} className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
            {note.title || 'Untitled Note'}
          </h3>
        </Link>

        <div className="relative flex-shrink-0" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon-sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 w-44 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in">
              <button
                onClick={() => { onShare(note._id); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" /> Share note
              </button>
              <button
                onClick={() => { onArchive(note._id, !note.isArchived); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                {note.isArchived
                  ? <><ArchiveRestore className="w-3.5 h-3.5" /> Restore</>
                  : <><Archive className="w-3.5 h-3.5" /> Archive</>
                }
              </button>
              <button
                onClick={() => { onDelete(note._id); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {plainContent && (
        <Link to={`/notes/${note._id}`}>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{plainContent}</p>
        </Link>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="muted" className="text-xs">{tag}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {note.aiGeneratedCount > 0 && (
            <Sparkles className="w-3 h-3 text-purple-400" title="AI enhanced" />
          )}
          <span className="text-xs text-muted-foreground">
            {format(new Date(note.updatedAt), 'MMM d')}
          </span>
        </div>
      </div>
    </div>
  );
}
