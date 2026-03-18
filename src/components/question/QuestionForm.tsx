import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { languagesApi } from '@/api/languages'
import { categoriesApi } from '@/api/categories'
import { tagsApi } from '@/api/tags'
import { questionsApi } from '@/api/questions'
import type { Question, QuestionCreateRequest, Language, Category, Tag } from '@/types'
import RichTextEditor from '@/components/editor/RichTextEditor'
import ManageLanguagesModal from '@/components/common/ManageLanguagesModal'
import ManageCategoriesModal from '@/components/common/ManageCategoriesModal'
import ManageTagsModal from '@/components/common/ManageTagsModal'
import TagPickerModal from '@/components/common/TagPickerModal'
import { Loader2, Pencil, Plus, Settings2, X } from 'lucide-react'

interface QuestionFormProps {
  initialData?: Question
  title?: string
}

export default function QuestionForm({ initialData, title }: QuestionFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = Boolean(initialData)

  const [questionText, setQuestionText] = useState(initialData?.questionText ?? '')
  const [answerContent, setAnswerContent] = useState(initialData?.answerContent ?? '')
  const [languageId, setLanguageId] = useState<number | ''>(initialData?.languageId ?? '')
  const [categoryId, setCategoryId] = useState<number | ''>(initialData?.categoryId ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showManageLangs, setShowManageLangs] = useState(false)
  const [showManageCats, setShowManageCats] = useState(false)
  const [showManageTags, setShowManageTags] = useState(false)
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])

  const { data: languages = [] as Language[] } = useQuery({
    queryKey: ['languages'],
    queryFn: languagesApi.getAll,
  })

  const { data: categories = [] as Category[] } = useQuery({
    queryKey: ['categories', languageId],
    queryFn: () => categoriesApi.getAll(languageId || undefined),
    enabled: Boolean(languageId),
  })

  const { data: availableTags = [] as Tag[] } = useQuery({
    queryKey: ['tags', languageId],
    queryFn: () => tagsApi.getAll(languageId as number),
    enabled: Boolean(languageId),
  })

  // On edit, pre-select tags by matching names to available tag IDs
  useEffect(() => {
    if (isEditing && initialData?.tags && availableTags.length > 0) {
      const ids = availableTags
        .filter((t) => initialData.tags.includes(t.name))
        .map((t) => t.id)
      setSelectedTagIds(ids)
    }
  }, [isEditing, availableTags, initialData?.tags])

  // Reset category & tags when language changes
  useEffect(() => {
    if (!isEditing) {
      setCategoryId('')
      setSelectedTagIds([])
    }
  }, [languageId, isEditing])

  const mutation = useMutation<Question, Error, QuestionCreateRequest>({
    mutationFn: (data: QuestionCreateRequest) =>
      isEditing
        ? questionsApi.update(initialData!.id, data)
        : questionsApi.create(data),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      navigate(`/questions/${saved.id}`, { replace: true })
    },
  })

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!questionText.trim()) errs.questionText = 'Question text is required'
    if (!languageId) errs.languageId = 'Please select a language'
    if (!categoryId) errs.categoryId = 'Please select a category'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    mutation.mutate({
      questionText: questionText.trim(),
      answerContent,
      languageId: Number(languageId),
      categoryId: Number(categoryId),
      tagIds: selectedTagIds,
    })
  }

  const handleTagPickerClose = (ids: number[]) => {
    setSelectedTagIds(ids)
    setShowTagPicker(false)
    queryClient.invalidateQueries({ queryKey: ['tags', languageId] })
  }

  // Selected tag objects for display
  const selectedTags = availableTags.filter((t) => selectedTagIds.includes(t.id))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title + Tags header */}
      {title && (
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-xl font-semibold text-gray-900 shrink-0">{title}</h1>
          {languageId && (
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <span className="text-[11px] text-gray-400 font-medium">Tags:</span>
              {selectedTags.map((tag) => (
                <span key={tag.id} className="tag">{tag.name}</span>
              ))}
              {/* Add / open picker button — after the tags */}
              <button
                type="button"
                onClick={() => setShowTagPicker(true)}
                className="inline-flex items-center justify-center w-5 h-5 rounded border border-dashed
                           border-indigo-300 text-indigo-400 hover:border-indigo-500 hover:text-indigo-600
                           hover:bg-indigo-50 transition-colors"
                title="Manage tags"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Question text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter the interview question…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500
                     focus:border-primary-500 transition-shadow"
        />
        {errors.questionText && (
          <p className="text-red-500 text-xs mt-1">{errors.questionText}</p>
        )}
      </div>

      {/* Language & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Language <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowManageLangs(true)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 transition-colors"
              title="Manage languages"
            >
              <Settings2 className="w-3.5 h-3.5" /> Manage
            </button>
          </div>
          <select
            value={languageId}
            onChange={(e) => setLanguageId(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-lg border border-gray-300 px-3 pr-8 py-2 text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select language…</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          {errors.languageId && (
            <p className="text-red-500 text-xs mt-1">{errors.languageId}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowManageCats(true)}
              disabled={!languageId}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Manage categories"
            >
              <Settings2 className="w-3.5 h-3.5" /> Manage
            </button>
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
            disabled={!languageId}
            className="w-full rounded-lg border border-gray-300 px-3 pr-8 py-2 text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>
          )}
        </div>
      </div>


      {/* Answer editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
        <RichTextEditor
          content={answerContent}
          onChange={setAnswerContent}
          placeholder="Write the answer here. Use the toolbar to format and highlight key sections…"
        />
      </div>

      {/* Submit */}
      {mutation.isError && (
        <p className="text-red-500 text-sm">{(mutation.error as Error).message}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium
                     rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
        >
          {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? 'Save Changes' : 'Create Question'}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium
                     rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>

      {showManageLangs && (
        <ManageLanguagesModal onClose={() => setShowManageLangs(false)} />
      )}
      {showManageCats && (
        <ManageCategoriesModal
          initialLanguageId={languageId || undefined}
          onClose={() => setShowManageCats(false)}
        />
      )}
      {showManageTags && (
        <ManageTagsModal
          initialLanguageId={languageId || undefined}
          onClose={() => {
            setShowManageTags(false)
            queryClient.invalidateQueries({ queryKey: ['tags', languageId] })
          }}
        />
      )}
      {showTagPicker && languageId && (
        <TagPickerModal
          languageId={languageId as number}
          selectedTagIds={selectedTagIds}
          onClose={handleTagPickerClose}
        />
      )}
    </form>
  )
}
