import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { questionsApi } from '@/api/questions'
import MarkdownViewer from '@/components/common/MarkdownViewer'
import BackButton from '@/components/common/BackButton'
import PageLoader from '@/components/common/PageLoader'
import PageError from '@/components/common/PageError'
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import { LANGUAGE_COLORS, DEFAULT_LANGUAGE_COLOR } from '@/constants/languageColors'
import { formatDate } from '@/utils/format'
import clsx from 'clsx'

const LEVEL_TAG_RE = /^L[1-4]$/i

function sortTags(tags: string[]): string[] {
  return [...tags].sort((a, b) => {
    const aIsLevel = LEVEL_TAG_RE.test(a)
    const bIsLevel = LEVEL_TAG_RE.test(b)
    if (aIsLevel && !bIsLevel) return -1
    if (!aIsLevel && bIsLevel) return 1
    return a.localeCompare(b)
  })
}

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

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

  if (isLoading) return <PageLoader />
  if (isError || !question) return <PageError message="Question not found." />

  const langColor = LANGUAGE_COLORS[question.languageCode] ?? DEFAULT_LANGUAGE_COLOR
  const sortedTags = question.tags ? sortTags(question.tags) : []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <BackButton label="Back to search" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/questions/${question.id}/edit`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border-strong
                       rounded-lg text-muted hover:bg-surface-alt transition-colors"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-error-light
                       rounded-lg text-error hover:bg-error-bg transition-colors disabled:opacity-50"
          >
            {deleteMutation.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-theme-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap', langColor)}>
                {question.languageName}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-badge-category-bg text-badge-category-text whitespace-nowrap">
                {question.categoryName}
              </span>
            </div>
            {sortedTags.length > 0 && (
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                <span className="text-[10px] text-muted-light font-small">Tags:</span>
                {sortedTags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <h1 className="text-xl font-semibold text-foreground leading-snug">
            {question.questionText}
          </h1>
        </div>

        <div className="px-6 py-5">
          {question.answerContent ? (
            <MarkdownViewer content={question.answerContent} />
          ) : (
            <p className="text-muted-light italic">No answer added yet.</p>
          )}
        </div>

        <div className="px-6 py-3 bg-surface-alt border-t border-border text-xs text-muted-light flex items-center gap-4">
          <span>Created by {question.createdBy}</span>
          <span>·</span>
          <span>{formatDate(question.createdAt)}</span>
        </div>
      </div>

      {showDeleteDialog && (
        <DeleteConfirmDialog
          itemLabel="this question"
          isDeleting={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  )
}
