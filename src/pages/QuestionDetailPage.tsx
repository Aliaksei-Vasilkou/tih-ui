import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { questionsApi } from '@/api/questions'
import MarkdownViewer from '@/components/common/MarkdownViewer'
import { ArrowLeft, Pencil, Trash2, Loader2 } from 'lucide-react'
import clsx from 'clsx'

const LANGUAGE_COLORS: Record<string, string> = {
  java:       'bg-orange-100 text-orange-700',
  typescript: 'bg-blue-100 text-blue-700',
  general:    'bg-gray-100 text-gray-700',
}

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: question, isLoading, isError } = useQuery({
    queryKey: ['questions', Number(id)],
    queryFn: () => questionsApi.getById(Number(id)),
    enabled: Boolean(id),
  })

  const deleteMutation = useMutation({
    mutationFn: () => questionsApi.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      navigate('/search')
    },
  })

  const handleDelete = () => {
    if (window.confirm('Delete this question? This action cannot be undone.')) {
      deleteMutation.mutate()
    }
  }

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

  const langColor = LANGUAGE_COLORS[question.languageCode] ?? 'bg-gray-100 text-gray-700'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/questions/${question.id}/edit`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300
                       rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-200
                       rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {deleteMutation.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full', langColor)}>
              {question.languageName}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
              {question.categoryName}
            </span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 leading-snug">
            {question.questionText}
          </h1>
        </div>

        {/* Answer */}
        <div className="px-6 py-5">
          {question.answerContent ? (
            <MarkdownViewer content={question.answerContent} />
          ) : (
            <p className="text-gray-400 italic">No answer added yet.</p>
          )}
        </div>

        {/* Meta */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex gap-4">
          <span>Created by {question.createdBy}</span>
          <span>·</span>
          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}
