import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '@/api/categories'
import { languagesApi } from '@/api/languages'
import type { Category, CategoryCreateRequest } from '@/types'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import Select from '@/components/common/Select'
import ModalShell from './ModalShell'
import InlineNameForm from './InlineNameForm'

interface Props {
  /** Pre-selected language; user can switch inside the modal */
  initialLanguageId?: number
  onClose: () => void
}

export default function ManageCategoriesModal({ initialLanguageId, onClose }: Props) {
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

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', selectedLanguageId],
    queryFn: () => categoriesApi.getAll(selectedLanguageId as number),
    enabled: Boolean(selectedLanguageId),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] })

  const createMutation = useMutation({
    mutationFn: (data: CategoryCreateRequest) => categoriesApi.create(data),
    onSuccess: () => { invalidate(); resetForm() },
    onError: (e: Error) => setFormError(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryCreateRequest }) =>
      categoriesApi.update(id, data),
    onSuccess: () => { invalidate(); resetForm() },
    onError: (e: Error) => setFormError(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => { invalidate(); setDeleteId(null) },
    onError: (e: Error) => setFormError(e.message),
  })

  const resetForm = () => {
    setFormName('')
    setEditingId(null)
    setShowAdd(false)
    setFormError('')
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setFormName(cat.name)
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
    const payload: CategoryCreateRequest = {
      name: formName.trim(),
      languageId: selectedLanguageId as number,
    }
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
      <Plus className="w-4 h-4" /> Add Category
    </button>
  ) : null

  return (
    <ModalShell title="Manage Categories" onClose={onClose} footer={footer}>
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
            Select a language to see its categories.
          </p>
        ) : isLoading ? (
          <div className="flex justify-center py-8 text-muted-light">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : categories.length === 0 && !showAdd ? (
          <p className="text-center text-muted-light py-8 text-sm">
            No categories for this language yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {categories.map((cat) => (
              <li key={cat.id}>
                {editingId === cat.id ? (
                  <InlineNameForm
                    value={formName}
                    onChange={setFormName}
                    onSave={handleSave}
                    onCancel={resetForm}
                    isPending={updateMutation.isPending}
                    error={formError}
                    placeholder="Category name…"
                  />
                ) : (
                  <div className="flex items-center justify-between py-2.5 gap-2">
                    <span className="font-medium text-foreground truncate">{cat.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 text-muted-light hover:text-primary-600 rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {deleteId === cat.id ? (
                        <span className="flex items-center gap-1 text-xs text-error">
                          Delete?
                          <button
                            onClick={() => deleteMutation.mutate(cat.id)}
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
                          onClick={() => setDeleteId(cat.id)}
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
            placeholder="Category name…"
          />
        )}
      </div>
    </ModalShell>
  )
}
