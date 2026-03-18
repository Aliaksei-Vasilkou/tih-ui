import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsApi } from '@/api/tags'
import { languagesApi } from '@/api/languages'
import type { Tag, TagCreateRequest } from '@/types'
import { X, Plus, Pencil, Trash2, Loader2, Check } from 'lucide-react'

interface Props {
  initialLanguageId?: number
  onClose: () => void
}

export default function ManageTagsModal({ initialLanguageId, onClose }: Props) {
  const qc = useQueryClient()
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | ''>(initialLanguageId ?? '')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [formName, setFormName] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [formError, setFormError] = useState('')

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: languagesApi.getAll,
  })

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags', selectedLanguageId],
    queryFn: () => tagsApi.getAll(selectedLanguageId as number),
    enabled: Boolean(selectedLanguageId),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['tags'] })

  const createMutation = useMutation({
    mutationFn: (data: TagCreateRequest) =>
      tagsApi.create(selectedLanguageId as number, data),
    onSuccess: () => { invalidate(); resetForm() },
    onError: (e: Error) => setFormError(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TagCreateRequest }) =>
      tagsApi.update(selectedLanguageId as number, id, data),
    onSuccess: () => { invalidate(); resetForm() },
    onError: (e: Error) => setFormError(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tagsApi.delete(selectedLanguageId as number, id),
    onSuccess: () => { invalidate(); setDeleteId(null) },
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

  const startAdd = () => {
    setShowAdd(true)
    setEditingId(null)
    setFormName('')
    setFormError('')
  }

  const handleSave = () => {
    if (!formName.trim()) { setFormError('Name is required'); return }
    if (!selectedLanguageId) { setFormError('Select a language first'); return }
    const payload: TagCreateRequest = { name: formName.trim() }
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Manage Tags</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language picker */}
        <div className="px-6 pt-4 pb-2">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Language</label>
          <select
            value={selectedLanguageId}
            onChange={(e) => {
              setSelectedLanguageId(e.target.value ? Number(e.target.value) : '')
              resetForm()
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select language…</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-1">
          {!selectedLanguageId ? (
            <p className="text-center text-gray-400 py-8 text-sm">Select a language to see its tags.</p>
          ) : isLoading ? (
            <div className="flex justify-center py-8 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : tags.length === 0 && !showAdd ? (
            <p className="text-center text-gray-400 py-8 text-sm">No tags for this language yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {tags.map((tag) => (
                <li key={tag.id}>
                  {editingId === tag.id ? (
                    <InlineTagForm
                      value={formName}
                      onChange={setFormName}
                      onSave={handleSave}
                      onCancel={resetForm}
                      isPending={updateMutation.isPending}
                      error={formError}
                    />
                  ) : (
                    <div className="flex items-center justify-between py-2.5 gap-2">
                      <span className="tag">{tag.name}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(tag)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteId === tag.id ? (
                          <span className="flex items-center gap-1 text-xs text-red-600">
                            Delete?
                            <button
                              onClick={() => deleteMutation.mutate(tag.id)}
                              disabled={deleteMutation.isPending}
                              className="px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                            >
                              {deleteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
                            </button>
                            <button onClick={() => setDeleteId(null)} className="px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-50">No</button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeleteId(tag.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {showAdd && selectedLanguageId && (
            <InlineTagForm
              value={formName}
              onChange={setFormName}
              onSave={handleSave}
              onCancel={resetForm}
              isPending={createMutation.isPending}
              error={formError}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          {!showAdd && editingId === null && (
            <button
              onClick={startAdd}
              disabled={!selectedLanguageId || isPending}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Tag
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface InlineTagFormProps {
  value: string
  onChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  isPending: boolean
  error: string
}

function InlineTagForm({ value, onChange, onSave, onCancel, isPending, error }: InlineTagFormProps) {
  return (
    <div className="py-2 space-y-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tag name…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
          autoFocus
        />
        <button
          onClick={onSave}
          disabled={isPending}
          className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60"
          title="Save"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </button>
        <button onClick={onCancel} className="p-1.5 border border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50" title="Cancel">
          <X className="w-4 h-4" />
        </button>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}
