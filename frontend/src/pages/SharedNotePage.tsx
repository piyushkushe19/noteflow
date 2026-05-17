import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Sparkles, ArrowLeft, User, Clock, Tag } from 'lucide-react';
import { noteService } from '@/services/note.service';
import { SharedNote } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function SharedNotePage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [note, setNote] = useState<SharedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!shareId) return;
    noteService.getShared(shareId)
      .then(setNote)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-4 w-32 mb-8" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className={`h-4 w-${i % 2 === 0 ? 'full' : '5/6'}`} />)}
        </div>
      </div>
    );
  }

  if (notFound || !note) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold mb-2">Note not found</h1>
          <p className="text-muted-foreground text-sm mb-6">This note may have been made private or deleted.</p>
          <Link to="/login" className="text-primary hover:underline text-sm">
            ← Go to NoteFlow
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold">NoteFlow AI</span>
          </div>
          <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Sign in →
          </Link>
        </div>
      </div>

      {/* Note content */}
      <div className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">
        {/* Meta */}
        <div className="mb-2">
          <Badge variant="muted">{note.category}</Badge>
        </div>

        <h1 className="text-3xl font-bold mb-4 leading-tight">{note.title || 'Untitled Note'}</h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-8 pb-6 border-b border-border">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> {note.authorName}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Updated {format(new Date(note.updatedAt), 'MMMM d, yyyy')}
          </span>
          {note.tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              {note.tags.map((t) => (
                <Badge key={t} variant="muted" className="text-xs">{t}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Rich content — read only */}
        <div
          className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: note.content || '<p>No content</p>' }}
          style={{ lineHeight: '1.8' }}
        />

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground mb-2">Shared via NoteFlow AI</p>
          <Link to="/signup" className="text-primary text-sm hover:underline font-medium">
            Create your own workspace →
          </Link>
        </div>
      </div>
    </div>
  );
}
