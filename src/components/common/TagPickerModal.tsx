import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsApi } from '@/api/tags'
import type { Tag, TagCreateRequest } from '@/types'
import { X, Plus, Pencil, Loader2, Check } from 'lucide-react'

interface Props {
  languageId: number
  selectedTagIds: number[]
  onClose: (selectedIds: number[]) => void
}

export default function TagPickerModal({ languageId, selectedTagIds, onClose }: Props) {
  const qc = useQueryClient()

  const [localSelectedIds, setLocalSelectedIds] = useState<number[]>(selectedTagIds)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [formName, setFormName] = useState('')
  const [formError, setFormError] = useState('')

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags', languageId],
    queryFn: () => tagsApi.getAll(languageId),
    enabled: Boolean(languageId),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['tags'] })

  const createMutation = useMutation({
    mutationFn: (data: TagCreateRequest) => tagsApi.create(languageId, data),
    onSuccess: (created) => {
      invalidate()
      setLocalSelectedIds((prev) => [...prev, created.id])
      resetForm()
    },
    onError: (e: Error) => setFormError(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TagCreateRequest }) =>
      tagsApi.update(languageId, id, data),
    onSuccess: () => { invalidate(); resetForm() },
    onError: (e: Error) => setFormError(e.message),
  })

  const resetForm = () => {
    setFormName('')
    setEditingId(null)
    setShowAdd(false)
    setFormError('')
  }

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id)
    setFormName(tag.name)
    setShowAdd(false)
    setFormError('')
  }

  const handleSave = () => {
    if (!formName.trim()) { setFormError('Name is required'); return }
    const payload: TagCreateRequest = { name: formName.trim() }
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const toggleTag = (id: number) => {
    setLocalSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
          <button
            onClick={() => onClose(localSelectedIds)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chip area */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="flex justify-center py-8 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 items-center">

              {/* + button — always first */}
              {!showAdd && editingId === null && (
                <button
                  type="button"
                  onClick={() => setShowAdd(true)}
                  className="inline-flex items-center justify-center w-7 h-7 rounded border-2 border-dashed
                             border-indigo-300 text-indigo-400 hover:border-indigo-500 hover:text-indigo-600
                             hover:bg-indigo-50 transition-colors"
                  title="New tag"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}

              {/* Inline create form */}
              {showAdd && (
                <InlineChipForm
                  value={formName}
                  onChange={setFormName}
                  onSave={handleSave}
                  onCancel={resetForm}
                  isPending={createMutation.isPending}
                  error={formError}
                />
              )}

              {/* Tag chips */}
              {tags.map((tag) =>
                editingId === tag.id ? (
                  <InlineChipForm
                    key={tag.id}
                    value={formName}
                    onChange={setFormName}
                    onSave={handleSave}
                    onCancel={resetForm}
                    isPending={updateMutation.isPending}
                    error={formError}
                  />
                ) : (
                  <div key={tag.id} className="relative group/chip">
                    {/* Tag toggle chip */}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={localSelectedIds.includes(tag.id) ? 'tag-selected' : 'tag-interactive'}
                    >
                      {tag.name}
                    </button>

                    {/* Edit button — fades in on hover with a short delay */}
                    <button
                      type="button"
                      onClick={() => startEdit(tag)}
                      title="Edit tag"
                      className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center
                                 rounded-full bg-white border border-gray-200 shadow-sm
                                 text-gray-400 hover:text-primary-600 hover:border-primary-400
                                 opacity-0 group-hover/chip:opacity-100
                                 transition-opacity duration-150 delay-200"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )
              )}

              {tags.length === 0 && !showAdd && (
                <p className="text-sm text-gray-400">No tags yet — click <strong>+</strong> to add the first one.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => onClose(localSelectedIds)}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300
                       rounded-lg hover:bg-gray-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

interface InlineChipFormProps {
  value: string
  onChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  isPending: boolean
  error: string
}

function InlineChipForm({ value, onChange, onSave, onCancel, isPending, error }: InlineChipFormProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave()
            if (e.key === 'Escape') onCancel()
          }}
          placeholder="Tag name…"
          className="w-28 rounded border border-indigo-300 px-2 py-0.5 text-xs text-gray-900
                     placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500
                     focus:border-indigo-500 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={onSave}
          disabled={isPending || !value.trim()}
          className="inline-flex items-center justify-center w-6 h-6 rounded bg-indigo-600
                     text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300
                     text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      {error && <p className="text-red-500 text-[10px]">{error}</p>}
    </div>
  )
}
