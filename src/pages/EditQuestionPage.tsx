import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { questionsApi } from '@/api/questions'
import QuestionForm from '@/components/question/QuestionForm'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function EditQuestionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: question, isLoading, isError } = useQuery({
    queryKey: ['questions', Number(id)],
    queryFn: () => questionsApi.getById(Number(id)),
    enabled: Boolean(id),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mr-3" />
        Loading…
      </div>
    )
  }

  if (isError || !question) {
    return (
      <div className="text-center py-20 text-red-500">
        <p className="text-lg font-medium">Question not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Edit Question</h1>
        <QuestionForm initialData={question} />
      </div>
    </div>
  )
}
