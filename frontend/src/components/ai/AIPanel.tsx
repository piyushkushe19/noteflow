import { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, CheckSquare, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { noteService } from '@/services/note.service';
import { AIResult } from '@/types';

interface AIPanelProps {
  noteId: string;
  existingSummary?: string | null;
  existingActionItems?: string[];
  onTitleSuggestion?: (title: string) => void;
}

export function AIPanel({ noteId, existingSummary, existingActionItems, onTitleSuggestion }: AIPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(
    existingSummary
      ? { summary: existingSummary, action_items: existingActionItems || [], suggested_title: '' }
      : null
  );
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await noteService.generateAI(noteId);
      setResult(data);
      setExpanded(true);
      toast.success('AI analysis complete');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'AI generation failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUseSuggestedTitle = () => {
    if (result?.suggested_title && onTitleSuggestion) {
      onTitleSuggestion(result.suggested_title);
      toast.success('Title updated');
    }
  };

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          {result && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setExpanded(!expanded)}
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={generate}
            disabled={loading}
            title={result ? 'Regenerate' : 'Generate analysis'}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <RefreshCw className="w-4 h-4" />
            }
          </Button>
        </div>
      </div>

      {/* Content */}
      {!result && !loading && !error && (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Generate an AI summary, action items, and title suggestion
          </p>
          <Button onClick={generate} size="sm" className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Analyze note
          </Button>
        </div>
      )}

      {loading && (
        <div className="px-4 py-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Analyzing your note...</p>
        </div>
      )}

      {error && !loading && (
        <div className="px-4 py-4 flex items-start gap-2 text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm">{error}</p>
            <button onClick={generate} className="text-xs underline mt-1 hover:no-underline">Retry</button>
          </div>
        </div>
      )}

      {result && expanded && !loading && (
        <div className="px-4 py-4 space-y-4">
          {/* Summary */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Summary</p>
            <p className="text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* Action items */}
          {result.action_items.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Action Items</p>
              <ul className="space-y-1.5">
                {result.action_items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckSquare className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested title */}
          {result.suggested_title && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Suggested Title</p>
              <div className="flex items-center gap-2">
                <p className="text-sm italic flex-1">"{result.suggested_title}"</p>
                <Button variant="outline" size="sm" onClick={handleUseSuggestedTitle} className="text-xs h-7">
                  Use this
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
