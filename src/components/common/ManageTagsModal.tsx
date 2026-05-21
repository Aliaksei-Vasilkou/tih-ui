import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsApi } from '@/api/tags'
import { languagesApi } from '@/api/languages'
import type { Tag, TagCreateRequest } from '@/types'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import Select from '@/components/common/Select'
import ModalShell from './ModalShell'
import InlineNameForm from './InlineNameForm'

interface Props {
  initialLanguageId?: number
  onClose: () => void
}

export default function ManageTagsModal({ initialLanguageId, onClose }: Props) {
  const queryClient = useQueryClient()
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

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tags'] })

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

  const footer = !showAdd && editingId === null ? (
    <button
      onClick={startAdd}
      disabled={!selectedLanguageId || isPending}
      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
    >
      <Plus className="w-4 h-4" /> Add Tag
    </button>
  ) : null

  return (
    <ModalShell title="Manage Tags" onClose={onClose} footer={footer}>
      <div className="px-6 pt-4 pb-2">
        <label className="block text-xs font-medium text-muted mb-1 uppercase tracking-wide">
          Language
        </label>
        <Select
          value={selectedLanguageId}
          onChange={(val) => {
            setSelectedLanguageId(val === '' ? '' : Number(val))
            resetForm()
          }}
          options={languages.map((l) => ({ value: l.id, label: l.name }))}
          placeholder="Select language…"
          className="w-full"
        />
      </div>

      <div className="px-6 py-2 space-y-1">
        {!selectedLanguageId ? (
          <p className="text-center text-muted-light py-8 text-sm">
            Select a language to see its tags.
          </p>
        ) : isLoading ? (
          <div className="flex justify-center py-8 text-muted-light">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : tags.length === 0 && !showAdd ? (
          <p className="text-center text-muted-light py-8 text-sm">
            No tags for this language yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {tags.map((tag) => (
              <li key={tag.id}>
                {editingId === tag.id ? (
                  <InlineNameForm
                    value={formName}
                    onChange={setFormName}
                    onSave={handleSave}
                    onCancel={resetForm}
                    isPending={updateMutation.isPending}
                    error={formError}
                    placeholder="Tag name…"
                  />
                ) : (
                  <div className="flex items-center justify-between py-2.5 gap-2">
                    <span className="tag">{tag.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(tag)}
                        className="p-1.5 text-muted-light hover:text-primary-600 rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {deleteId === tag.id ? (
                        <span className="flex items-center gap-1 text-xs text-error">
                          Delete?
                          <button
                            onClick={() => deleteMutation.mutate(tag.id)}
                            disabled={deleteMutation.isPending}
                            className="px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                          >
                            {deleteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
                          </button>
                          <button
                            onClick={() => setDeleteId(null)}
                            className="px-2 py-0.5 border border-border-strong rounded hover:bg-surface-alt"
                          >
                            No
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeleteId(tag.id)}
                          className="p-1.5 text-muted-light hover:text-error rounded transition-colors"
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
          <InlineNameForm
            value={formName}
            onChange={setFormName}
            onSave={handleSave}
            onCancel={resetForm}
            isPending={createMutation.isPending}
            error={formError}
            placeholder="Tag name…"
          />
        )}
      </div>
    </ModalShell>
  )
}
