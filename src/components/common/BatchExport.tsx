import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { languagesApi } from '@/api/languages'
import { categoriesApi } from '@/api/categories'
import { questionsApi } from '@/api/questions'
import { Download, Loader2, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

type ExportStatus = 'idle' | 'success' | 'error'

export default function BatchExport() {
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(null)
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>('')
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('')
  const [status, setStatus] = useState<ExportStatus>('idle')

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: languagesApi.getAll,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', selectedLanguageId],
    queryFn: () => categoriesApi.getAll(selectedLanguageId!),
    enabled: Boolean(selectedLanguageId),
  })

  const exportMutation = useMutation({
    mutationFn: () =>
      questionsApi.batchExport({
        languageCode: selectedLanguageCode || undefined,
        categoryName: selectedCategoryName || undefined,
      }),
    onSuccess: () => setStatus('success'),
    onError: () => setStatus('error'),
  })

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? Number(e.target.value) : null
    const lang = languages.find((l) => l.id === id)
    setSelectedLanguageId(id)
    setSelectedLanguageCode(lang?.code ?? '')
    setSelectedCategoryName('')
    setStatus('idle')
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryName(e.target.value)
    setStatus('idle')
  }

  const handleExport = () => {
    setStatus('idle')
    exportMutation.mutate()
  }

  const selectClass =
    'appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white ' +
    'text-gray-700 hover:border-primary-400 focus:outline-none focus:ring-2 ' +
    'focus:ring-primary-400 focus:border-primary-400 transition-colors cursor-pointer'

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Language */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Language
          </label>
          <div className="relative">
            <select
              value={selectedLanguageId ?? ''}
              onChange={handleLanguageChange}
              disabled={exportMutation.isPending}
              className={clsx(selectClass, exportMutation.isPending && 'opacity-60')}
            >
              <option value="">All Languages</option>
              {languages.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          </div>
        </div>

        {/* Category — only shown when a language is selected */}
        {selectedLanguageId && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Category
            </label>
            <div className="relative">
              <select
                value={selectedCategoryName}
                onChange={handleCategoryChange}
                disabled={exportMutation.isPending}
                className={clsx(selectClass, exportMutation.isPending && 'opacity-60')}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            </div>
          </div>
        )}

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            exportMutation.isPending
              ? 'bg-primary-400 text-white cursor-not-allowed opacity-70'
              : 'bg-primary-600 text-white hover:bg-primary-700',
          )}
        >
          {exportMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {exportMutation.isPending ? 'Exporting…' : 'Export JSON'}
        </button>
      </div>

      {/* Scope summary */}
      <p className="text-sm text-gray-500">
        {selectedLanguageCode
          ? selectedCategoryName
            ? <>Exporting <span className="font-medium text-gray-700">{selectedCategoryName}</span> questions for <span className="font-medium text-gray-700">{languages.find(l => l.code === selectedLanguageCode)?.name}</span>.</>
            : <>Exporting all <span className="font-medium text-gray-700">{languages.find(l => l.code === selectedLanguageCode)?.name}</span> questions.</>
          : 'Exporting all questions across every language and category.'}
      </p>

      {/* Feedback */}
      {status === 'success' && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Export downloaded successfully. The file can be re-imported on any device.</span>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Export failed. Please try again.</span>
        </div>
      )}
    </div>
  )
}
