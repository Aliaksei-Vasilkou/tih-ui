import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useBlocker } from 'react-router-dom'
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
import Select from '@/components/common/Select'
import UnsavedChangesDialog from '@/components/common/UnsavedChangesDialog'
import { Loader2, Pencil, Settings2 } from 'lucide-react'

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

  // Refs for unsaved-change tracking
  const isDirtyRef = useRef(false)           // read inside the stable blocker fn (no stale closure)
  const [isDirty, setIsDirty] = useState(false) // drives the badge UI
  const hasInitializedTagsRef = useRef(false) // prevent tag-useEffect from resetting after invalidation
  const isSavingRef = useRef(false)

  const markDirty = useCallback(() => {
    isDirtyRef.current = true
    setIsDirty(true)
  }, [])

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

  // On edit, pre-select tags from initialData — only once, so a later refetch doesn't override user changes
  useEffect(() => {
    if (isEditing && availableTags.length > 0 && !hasInitializedTagsRef.current) {
      const initialTags = initialData?.tags ?? []
      const ids = availableTags
        .filter((t) => initialTags.includes(t.name))
        .map((t) => t.id)
      setSelectedTagIds(ids)
      hasInitializedTagsRef.current = true
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
      isDirtyRef.current = false
      isSavingRef.current = false
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      navigate(`/questions/${saved.id}`, { replace: true })
    },
    onError: () => {
      isSavingRef.current = false
    },
  })

  // Stable function — reads from refs at call-time, no stale-closure risk
  const blockerFn = useCallback(() => isDirtyRef.current && !isSavingRef.current, [])
  const blocker = useBlocker(blockerFn)

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
    isSavingRef.current = true
    mutation.mutate({
      questionText: questionText.trim(),
      answerContent,
      languageId: Number(languageId),
      categoryId: Number(categoryId),
      tagIds: selectedTagIds,
    })
  }

  // Called by UnsavedChangesDialog "Save Changes"
  const handleSaveAndProceed = () => {
    if (!validate()) {
      blocker.reset?.()
      return
    }
    isDirtyRef.current = false   // clear before reset so the post-save navigation isn't blocked
    setIsDirty(false)
    isSavingRef.current = true
    blocker.reset?.()
    mutation.mutate({
      questionText: questionText.trim(),
      answerContent,
      languageId: Number(languageId),
      categoryId: Number(categoryId),
      tagIds: selectedTagIds,
    })
  }

  // Called by UnsavedChangesDialog "Discard Changes"
  const handleDiscard = () => {
    blocker.proceed?.()
  }

  const handleTagPickerClose = (ids: number[]) => {
    setSelectedTagIds(ids)
    setShowTagPicker(false)
    markDirty()
    queryClient.invalidateQueries({ queryKey: ['tags', languageId] })
  }

  // Selected tag objects for display
  const selectedTags = availableTags.filter((t) => selectedTagIds.includes(t.id))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title + Tags header */}
      {title && (
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {isDirty && (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Unsaved
              </span>
            )}
          </div>
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
          onChange={(e) => { setQuestionText(e.target.value); markDirty() }}
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
          <Select
            value={languageId}
            onChange={(val) => { setLanguageId(val === '' ? '' : Number(val)); markDirty() }}
            options={languages.map((l) => ({ value: l.id, label: l.name }))}
            placeholder="Select language…"
            className="w-full"
          />
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
          <Select
            value={categoryId}
            onChange={(val) => { setCategoryId(val === '' ? '' : Number(val)); markDirty() }}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Select category…"
            disabled={!languageId}
            className="w-full"
          />
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
          onChange={(val) => { setAnswerContent(val); markDirty() }}
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

      {blocker.state === 'blocked' && (
        <UnsavedChangesDialog
          isSaving={mutation.isPending}
          onKeepEditing={() => blocker.reset?.()}
          onDiscard={handleDiscard}
          onSave={handleSaveAndProceed}
        />
      )}
    </form>
  )
}
