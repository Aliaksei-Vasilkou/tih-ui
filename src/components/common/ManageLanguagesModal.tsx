import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { languagesApi } from '@/api/languages'
import type { Language, LanguageCreateRequest } from '@/types'
import { X, Plus, Pencil, Trash2, Loader2, Check } from 'lucide-react'

interface Props {
  onClose: () => void
}

type FormState = { name: string; code: string }
const empty: FormState = { name: '', code: '' }

export default function ManageLanguagesModal({ onClose }: Props) {
  const qc = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<FormState>(empty)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [formError, setFormError] = useState('')

  const { data: languages = [], isLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: languagesApi.getAll,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['languages'] })
    qc.invalidateQueries({ queryKey: ['categories'] })
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
    setForm(empty)
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
    setForm(empty)
    setFormError('')
  }

  const validate = () => {
    if (!form.name.trim()) { setFormError('Name is required'); return false }
    if (!form.code.trim()) { setFormError('Code is required'); return false }
    return true
  }

  const handleSave = () => {
    if (!validate()) return
    const payload: LanguageCreateRequest = { name: form.name.trim(), code: form.code.trim().toLowerCase() }
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
          <h2 className="text-lg font-semibold text-gray-900">Manage Languages</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
          {isLoading ? (
            <div className="flex justify-center py-8 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : languages.length === 0 && !showAdd ? (
            <p className="text-center text-gray-400 py-8 text-sm">No languages yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {languages.map((lang) => (
                <li key={lang.id}>
                  {editingId === lang.id ? (
                    <InlineForm
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
                        <span className="font-medium text-gray-900 truncate">{lang.name}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 uppercase shrink-0">
                          {lang.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(lang)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteId === lang.id ? (
                          <span className="flex items-center gap-1 text-xs text-red-600">
                            Delete?
                            <button
                              onClick={() => deleteMutation.mutate(lang.id)}
                              disabled={deleteMutation.isPending}
                              className="px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                            >
                              {deleteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
                            </button>
                            <button onClick={() => setDeleteId(null)} className="px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-50">No</button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeleteId(lang.id)}
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

          {showAdd && (
            <InlineForm
              form={form}
              onChange={setForm}
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
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Language
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface InlineFormProps {
  form: FormState
  onChange: (f: FormState) => void
  onSave: () => void
  onCancel: () => void
  isPending: boolean
  error: string
}

function InlineForm({ form, onChange, onSave, onCancel, isPending, error }: InlineFormProps) {
  return (
    <div className="py-2 space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder="Name (e.g. JavaScript)"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          autoFocus
        />
        <input
          type="text"
          value={form.code}
          onChange={(e) => onChange({ ...form, code: e.target.value })}
          placeholder="Code (e.g. js)"
          className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
