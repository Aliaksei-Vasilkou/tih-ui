import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { languagesApi } from '@/api/languages'
import type { Language, LanguageCreateRequest } from '@/types'
import { Plus, Pencil, Trash2, Loader2, Check, X } from 'lucide-react'
import ModalShell from './ModalShell'

interface Props {
  onClose: () => void
}

type LanguageFormState = { name: string; code: string }
const EMPTY_FORM: LanguageFormState = { name: '', code: '' }

export default function ManageLanguagesModal({ onClose }: Props) {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<LanguageFormState>(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [formError, setFormError] = useState('')

  const { data: languages = [], isLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: languagesApi.getAll,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['languages'] })
    queryClient.invalidateQueries({ queryKey: ['categories'] })
  }

  const createMutation = useMutation({
    mutationFn: (data: LanguageCreateRequest) => languagesApi.create(data),
    onSuccess: () => { invalidate(); resetForm() },
    onError: (e: Error) => setFormError(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: LanguageCreateRequest }) =>
      languagesApi.update(id, data),
    onSuccess: () => { invalidate(); resetForm() },
    onError: (e: Error) => setFormError(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => languagesApi.delete(id),
    onSuccess: () => { invalidate(); setDeleteId(null) },
    onError: (e: Error) => setFormError(e.message),
  })

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowAdd(false)
    setFormError('')
  }

  const startEdit = (lang: Language) => {
    setEditingId(lang.id)
    setForm({ name: lang.name, code: lang.code })
    setShowAdd(false)
    setFormError('')
  }

  const startAdd = () => {
    setShowAdd(true)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  const validate = () => {
    if (!form.name.trim()) { setFormError('Name is required'); return false }
    if (!form.code.trim()) { setFormError('Code is required'); return false }
    return true
  }

  const handleSave = () => {
    if (!validate()) return
    const payload: LanguageCreateRequest = {
      name: form.name.trim(),
      code: form.code.trim().toLowerCase(),
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
      disabled={isPending}
      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
    >
      <Plus className="w-4 h-4" /> Add Language
    </button>
  ) : null

  return (
    <ModalShell title="Manage Languages" onClose={onClose} footer={footer}>
      <div className="px-6 py-4 space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-8 text-muted-light">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : languages.length === 0 && !showAdd ? (
          <p className="text-center text-muted-light py-8 text-sm">No languages yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {languages.map((lang) => (
              <li key={lang.id}>
                {editingId === lang.id ? (
                  <LanguageInlineForm
                    form={form}
                    onChange={setForm}
                    onSave={handleSave}
                    onCancel={resetForm}
                    isPending={updateMutation.isPending}
                    error={formError}
                  />
                ) : (
                  <div className="flex items-center justify-between py-2.5 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-foreground truncate">{lang.name}</span>
                      <span className="text-xs bg-surface-alt text-muted rounded px-1.5 py-0.5 uppercase shrink-0">
                        {lang.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(lang)}
                        className="p-1.5 text-muted-light hover:text-primary-600 rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {deleteId === lang.id ? (
                        <span className="flex items-center gap-1 text-xs text-error">
                          Delete?
                          <button
                            onClick={() => deleteMutation.mutate(lang.id)}
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
                          onClick={() => setDeleteId(lang.id)}
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

        {showAdd && (
          <LanguageInlineForm
            form={form}
            onChange={setForm}
            onSave={handleSave}
            onCancel={resetForm}
            isPending={createMutation.isPending}
            error={formError}
          />
        )}
      </div>
    </ModalShell>
  )
}

interface LanguageInlineFormProps {
  form: LanguageFormState
  onChange: (f: LanguageFormState) => void
  onSave: () => void
  onCancel: () => void
  isPending: boolean
  error: string
}

function LanguageInlineForm({ form, onChange, onSave, onCancel, isPending, error }: LanguageInlineFormProps) {
  return (
    <div className="py-2 space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder="Name (e.g. JavaScript)"
          className="flex-1 rounded-lg border border-border-strong px-3 py-1.5 text-sm text-foreground bg-surface
                     placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500"
          autoFocus
        />
        <input
          type="text"
          value={form.code}
          onChange={(e) => onChange({ ...form, code: e.target.value })}
          placeholder="Code (e.g. js)"
          className="w-24 rounded-lg border border-border-strong px-3 py-1.5 text-sm text-foreground bg-surface
                     placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="button"
          onClick={onSave}
          disabled={isPending}
          className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60"
          title="Save"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 border border-border-strong text-muted rounded-lg hover:bg-surface-alt"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  )
}
