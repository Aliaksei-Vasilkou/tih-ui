import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import SearchPage from '@/pages/SearchPage'
import QuestionDetailPage from '@/pages/QuestionDetailPage'
import CreateQuestionPage from '@/pages/CreateQuestionPage'
import EditQuestionPage from '@/pages/EditQuestionPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/search" replace /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'questions/new', element: <CreateQuestionPage /> },
      { path: 'questions/:id', element: <QuestionDetailPage /> },
      { path: 'questions/:id/edit', element: <EditQuestionPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
