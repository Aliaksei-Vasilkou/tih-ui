import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import SearchPage from '@/pages/SearchPage'
import QuestionDetailPage from '@/pages/QuestionDetailPage'
import CreateQuestionPage from '@/pages/CreateQuestionPage'
import EditQuestionPage from '@/pages/EditQuestionPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/search" replace />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="questions/new" element={<CreateQuestionPage />} />
          <Route path="questions/:id" element={<QuestionDetailPage />} />
          <Route path="questions/:id/edit" element={<EditQuestionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
