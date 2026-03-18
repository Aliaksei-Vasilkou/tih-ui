import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { questionsApi } from '@/api/questions'
import type { BatchUploadResponse } from '@/types'
import { UploadCloud, FileJson, CheckCircle2, XCircle, SkipForward, Loader2 } from 'lucide-react'
import clsx from 'clsx'

export default function BatchUpload() {
  const queryClient = useQueryClient()
  const [result, setResult] = useState<BatchUploadResponse | null>(null)

  const mutation = useMutation<BatchUploadResponse, Error, File>({
    mutationFn: (file: File) => questionsApi.batchUpload(file),
    onSuccess: (data) => {
      setResult(data)
      queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
    onError: (err: Error) => {
      setResult(null)
      alert('Upload failed: ' + err.message)
    },
  })

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) {
        setResult(null)
        mutation.mutate(accepted[0])
      }
    },
    [mutation],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    maxFiles: 1,
    disabled: mutation.isPending,
  })

  const allOk = result && result.failureCount === 0 && result.skippedCount === 0

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50',
          mutation.isPending && 'pointer-events-none opacity-60',
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3 text-gray-500">
          {mutation.isPending ? (
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
          ) : (
            <UploadCloud className="w-10 h-10 text-primary-400" />
          )}
          <div>
            <p className="font-medium text-gray-700">
              {mutation.isPending ? 'Uploading…' : 'Drop a JSON file here'}
            </p>
            <p className="text-sm mt-0.5">or click to browse</p>
          </div>
          <div className="flex items-center gap-1 text-xs bg-white border border-gray-200 rounded px-2 py-1">
            <FileJson className="w-3.5 h-3.5" />
            .json only · max 10 MB
          </div>
        </div>
      </div>

      {/* Format hint */}
      <details className="text-sm text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700">Expected JSON format</summary>
        <div className="mt-2 space-y-3">
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto leading-relaxed">
{`[
  {
    "extId":    "optional-uuid",        // used for deduplication (optional)
    "question": "What is polymorphism?",
    "answer":   "<p>HTML answer…</p>",
    "language": "java",                 // language code
    "category": "Core",                 // category name (created if missing)
    "tags":     ["L1", "OOP"]           // tag names (optional, created if missing)
  }
]`}
          </pre>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left text-gray-400 uppercase tracking-wide">
                <th className="pb-1 pr-4 font-semibold">Field</th>
                <th className="pb-1 pr-4 font-semibold">Required</th>
                <th className="pb-1 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 divide-y divide-gray-100">
              {[
                ['extId',    'No',  'Stable external ID for deduplication — re-importing the same ID skips the row'],
                ['question', 'Yes', 'Plain text of the interview question'],
                ['answer',   'No',  'HTML answer body (rich text)'],
                ['language', 'Yes', 'Language code that must already exist (e.g. java, typescript)'],
                ['category', 'Yes', 'Category name — created automatically if it does not exist for that language'],
                ['tags',     'No',  'Array of tag names — created automatically if they do not exist for that language'],
              ].map(([field, req, desc]) => (
                <tr key={field}>
                  <td className="py-1.5 pr-4 font-mono text-indigo-700">{field}</td>
                  <td className="py-1.5 pr-4">{req}</td>
                  <td className="py-1.5 text-gray-500">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {/* Result */}
      {result && (
        <div
          className={clsx(
            'rounded-xl border p-4 space-y-3',
            allOk
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200',
          )}
        >
          {/* Summary row */}
          <div className="flex items-center gap-2 font-medium">
            {allOk
              ? <CheckCircle2 className="w-5 h-5 text-green-600" />
              : <XCircle className="w-5 h-5 text-yellow-600" />}
            <span>
              {result.successCount} of {result.totalItems} imported
              {result.skippedCount > 0 && `, ${result.skippedCount} skipped`}
              {result.failureCount > 0 && `, ${result.failureCount} failed`}
            </span>
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">Errors</p>
              <ul className="text-sm text-red-600 list-disc list-inside space-y-0.5 max-h-32 overflow-y-auto">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {/* Skipped */}
          {result.skipped && result.skipped.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                <SkipForward className="w-3.5 h-3.5" />
                Skipped (already exist)
              </div>
              <ul className="text-sm text-amber-700 list-disc list-inside space-y-0.5 max-h-32 overflow-y-auto">
                {result.skipped.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
