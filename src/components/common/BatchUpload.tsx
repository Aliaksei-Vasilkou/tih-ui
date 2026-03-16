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
        <pre className="mt-2 bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
{`[
  {
    "externalId": "optional-uuid-for-dedup",
    "questionText": "What is polymorphism?",
    "answerContent": "<p>Polymorphism is…</p>",
    "languageCode": "java",
    "categoryName": "Core"
  }
]`}
        </pre>
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
