import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import QuestionForm from '@/components/question/QuestionForm'

export default function CreateQuestionPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">New Question</h1>
        <QuestionForm />
      </div>
    </div>
  )
}
