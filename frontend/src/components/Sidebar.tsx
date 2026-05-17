import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Archive, Plus, LogOut,
  Sparkles, Menu, X, ChevronRight, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useNoteStore } from '@/store/note.store';
import { useNotes } from '@/hooks/useNotes';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/archive', icon: Archive, label: 'Archive' },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { isSaving } = useNoteStore();
  const { createNote } = useNotes();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleNew = async () => {
    const note = await createNote();
    if (note) {
      navigate(`/notes/${note._id}`);
      setOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm tracking-tight">NoteFlow AI</span>
        {isSaving && (
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Save className="w-3 h-3 animate-pulse" />
            <span>Saving...</span>
          </div>
        )}
      </div>

      {/* New Note */}
      <div className="px-3 py-3">
        <Button onClick={handleNew} className="w-full justify-start gap-2" size="sm">
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors group',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
            {user?.name[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleLogout} title="Logout">
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-60 flex-shrink-0 border-r border-border bg-card/50 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden fixed top-3 left-3 z-50"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-card border-r border-border h-full animate-slide-in">
            {sidebarContent}
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
