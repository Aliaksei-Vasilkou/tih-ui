import { useEffect, lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useThemeStore } from '@/store/themeStore';
import { Loader2 } from 'lucide-react';

/**
 * Route-level code splitting — each page is a separate async chunk downloaded
 * only when the user navigates to that route for the first time.
 * The editor-heavy Create/Edit pages (TipTap ~350 KB) are never loaded on initial visit.
 */
const HomePage = lazy(() => import('@/pages/HomePage'));
const PreparePage = lazy(() => import('@/pages/PreparePage'));
const PrepareQuestionDetailPage = lazy(() => import('@/pages/PrepareQuestionDetailPage'));
const PracticePage = lazy(() => import('@/pages/PracticePage'));
const HackPage = lazy(() => import('@/pages/HackPage'));
const ManageQuestionsPage = lazy(() => import('@/pages/ManageQuestionsPage'));
const QuestionDetailPage = lazy(() => import('@/pages/QuestionDetailPage'));
const CreateQuestionPage = lazy(() => import('@/pages/CreateQuestionPage'));
const EditQuestionPage = lazy(() => import('@/pages/EditQuestionPage'));

function PageLoader() {
  return (
    <div className="flex justify-center items-center py-20 text-muted-light">
      <Loader2 className="w-8 h-8 animate-spin mr-3" />
      <span className="text-lg">Loading…</span>
    </div>
  );
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

/** Preserves all existing query params when redirecting /search → /prepare */
function SearchRedirect() {
  const [searchParams] = useSearchParams();
  const qs = searchParams.toString();
  return <Navigate to={qs ? `/prepare?${qs}` : '/prepare'} replace />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: withSuspense(HomePage) },
      { path: 'prepare', element: withSuspense(PreparePage) },
      { path: 'prepare/questions/:id', element: withSuspense(PrepareQuestionDetailPage) },
      { path: 'practice', element: withSuspense(PracticePage) },
      { path: 'hack', element: withSuspense(HackPage) },
      { path: 'manage', element: withSuspense(ManageQuestionsPage) },
      { path: 'search', element: <SearchRedirect /> },
      { path: 'questions/new', element: withSuspense(CreateQuestionPage) },
      { path: 'questions/:id', element: withSuspense(QuestionDetailPage) },
      { path: 'questions/:id/edit', element: withSuspense(EditQuestionPage) },
    ],
  },
]);

export default function App() {
  const initTheme = useThemeStore((s) => s.init);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return <RouterProvider router={router} />;
}
