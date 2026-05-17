import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { lazy, Suspense } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { Skeleton } from '@/components/ui/skeleton';

const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('@/pages/SignupPage').then((m) => ({ default: m.SignupPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const NotesPage = lazy(() => import('@/pages/NotesPage').then((m) => ({ default: m.NotesPage })));
const NoteEditorPage = lazy(() => import('@/pages/NoteEditorPage').then((m) => ({ default: m.NoteEditorPage })));
const SharedNotePage = lazy(() => import('@/pages/SharedNotePage').then((m) => ({ default: m.SharedNotePage })));

function PageLoader() {
  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'hsl(222,47%,8%)',
            border: '1px solid hsl(217,33%,14%)',
            color: 'hsl(210,40%,98%)',
          },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/shared/:shareId" element={<SharedNotePage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/notes/:id" element={<NoteEditorPage />} />
              <Route path="/archive" element={<NotesPage archived />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
