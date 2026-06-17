import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { AlertCircle, CheckCircle2, FileJson, Loader2, SkipForward, UploadCloud, XCircle } from 'lucide-react';

import type {
  BatchAnalyseResponse,
  BatchCommitRequest,
  BatchUploadResponse,
  DuplicateConflict,
  DuplicateResolution,
} from '@/types';
import { questionsApi } from '@/api/questions';
import DuplicateReviewModal from '@/components/common/DuplicateReviewModal';

/**
 * react-dropzone checks both MIME type and extension.
 * Browsers/OS report .json files inconsistently:
 *   - Chrome/Edge: application/json
 *   - Firefox/Safari, Windows, many macOS editors: text/plain or text/json
 * Listing all three variants prevents silent rejection.
 */
const ACCEPT_JSON = {
  'application/json': ['.json'],
  'text/json': ['.json'],
  'text/plain': ['.json'],
};

function mergeBatchUploadResults(current: BatchUploadResponse | null, next: BatchUploadResponse): BatchUploadResponse {
  if (!current) {
    return next;
  }

  return {
    totalItems: current.totalItems + next.totalItems,
    successCount: current.successCount + next.successCount,
    updatedCount: current.updatedCount + next.updatedCount,
    failureCount: current.failureCount + next.failureCount,
    skippedCount: current.skippedCount + next.skippedCount,
    errors: [...current.errors, ...next.errors],
    skipped: [...current.skipped, ...next.skipped],
  };
}

function skippedSingleResult(extId: string): BatchUploadResponse {
  return {
    totalItems: 1,
    successCount: 0,
    updatedCount: 0,
    failureCount: 0,
    skippedCount: 1,
    errors: [],
    skipped: [extId],
  };
}

export default function BatchUpload() {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<BatchUploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'analysing' | 'reviewing' | 'committing' | 'done'>('idle');
  const [conflicts, setConflicts] = useState<DuplicateConflict[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);

  const commitMutation = useMutation<BatchUploadResponse, Error, BatchCommitRequest>({
    mutationFn: (payload: BatchCommitRequest) => questionsApi.batchCommit(payload),
  });

  const analyseMutation = useMutation<BatchAnalyseResponse, Error, File>({
    mutationFn: (file: File) => questionsApi.batchAnalyse(file),
    onSuccess: (data) => {
      setUploadError(null);
      setConflicts(data.duplicates);
      setReviewIndex(0);
      setResult(null);

      if (data.newItems.length > 0) {
        setPhase('committing');
        commitMutation.mutate(
          {
            newItems: data.newItems,
            resolutions: [],
          },
          {
            onSuccess: (commitResult) => {
              setResult(commitResult);
              queryClient.invalidateQueries({ queryKey: ['questions'] });

              if (data.duplicates.length > 0) {
                setPhase('reviewing');
                return;
              }

              setPhase('done');
              setConflicts([]);
              setReviewIndex(0);
            },
            onError: (err: Error) => {
              setResult(null);
              setUploadError(err.message);
              setPhase('idle');
            },
          }
        );
        return;
      }

      if (data.duplicates.length === 0) {
        setPhase('done');
        return;
      }

      setPhase('reviewing');
    },
    onError: (err: Error) => {
      setResult(null);
      setUploadError(err.message);
      setPhase('idle');
    },
  });

  const isBusy = analyseMutation.isPending || commitMutation.isPending;

  const currentConflict = phase === 'reviewing' ? conflicts[reviewIndex] : undefined;

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) {
        setResult(null);
        setUploadError(null);
        setPhase('analysing');
        setConflicts([]);
        setReviewIndex(0);
        analyseMutation.mutate(accepted[0]);
      }
    },
    [analyseMutation]
  );

  const onDropRejected = useCallback(() => {
    setUploadError('File rejected. Please select a valid .json file.');
    setPhase('idle');
  }, []);

  const closeReview = useCallback(() => {
    setPhase('idle');
    setConflicts([]);
    setReviewIndex(0);
  }, []);

  const moveToNextConflictOrDone = useCallback(() => {
    const hasNext = reviewIndex < conflicts.length - 1;
    if (hasNext) {
      setReviewIndex((current) => current + 1);
      return;
    }

    setPhase('done');
    setConflicts([]);
    setReviewIndex(0);
  }, [conflicts.length, reviewIndex]);

  const resolveCurrentConflict = useCallback(
    (action: DuplicateResolution) => {
      if (!currentConflict) {
        return;
      }

      if (action === 'skip') {
        setResult((current) => mergeBatchUploadResults(current, skippedSingleResult(currentConflict.extId)));
        moveToNextConflictOrDone();
        return;
      }

      commitMutation.mutate(
        {
          newItems: [currentConflict.incoming],
          resolutions: [{ extId: currentConflict.extId, action: 'accept' }],
        },
        {
          onSuccess: (commitResult) => {
            setUploadError(null);
            setResult((current) => mergeBatchUploadResults(current, commitResult));
            queryClient.invalidateQueries({ queryKey: ['questions'] });
            moveToNextConflictOrDone();
          },
          onError: (err: Error) => {
            setUploadError(err.message);
          },
        }
      );
    },
    [commitMutation, currentConflict, moveToNextConflictOrDone, queryClient]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: ACCEPT_JSON,
    maxFiles: 1,
    disabled: isBusy || phase === 'reviewing',
  });

  const allOk = result && result.failureCount === 0 && result.skippedCount === 0;
  let uploadLabel = 'Drop a JSON file here';
  if (phase === 'analysing') {
    uploadLabel = 'Analysing duplicates…';
  }
  if (phase === 'committing') {
    uploadLabel = 'Committing import…';
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-border-strong bg-surface-alt hover:border-primary-400 hover:bg-primary-50',
          (isBusy || phase === 'reviewing') && 'pointer-events-none opacity-60'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3 text-muted">
          {isBusy ? (
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
          ) : (
            <UploadCloud className="w-10 h-10 text-primary-400" />
          )}
          <div>
            <p className="font-medium text-foreground-secondary">{uploadLabel}</p>
            <p className="text-sm mt-0.5">or click to browse</p>
          </div>
          <div className="flex items-center gap-1 text-xs bg-surface border border-border rounded px-2 py-1">
            <FileJson className="w-3.5 h-3.5" />
            .json only · max 10 MB
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 text-sm text-error bg-error-bg border border-error-light rounded-lg px-4 py-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      <details className="text-sm text-muted">
        <summary className="cursor-pointer hover:text-foreground-secondary">Expected JSON format</summary>
        <div className="mt-2 space-y-3">
          <pre className="bg-code-block-bg text-code-block-text rounded-lg p-4 text-xs overflow-x-auto leading-relaxed">
            {`[
  {
    "extId":    "optional-uuid",        // used for deduplication (optional)
    "question": "What is polymorphism?",
    "answer":   "## Answer\n\nPolymorphism allows...",
    "language": "java",                 // language code
    "category": "Core",                 // category name (created if missing)
    "tags":     ["L1", "OOP"]           // tag names (optional, created if missing)
  }
]`}
          </pre>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left text-muted-light uppercase tracking-wide">
                <th className="pb-1 pr-4 font-semibold">Field</th>
                <th className="pb-1 pr-4 font-semibold">Required</th>
                <th className="pb-1 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted divide-y divide-border">
              {[
                ['extId', 'No', 'Stable external ID for deduplication and duplicate-review matching'],
                ['question', 'Yes', 'Plain text of the interview question'],
                ['answer', 'No', 'Markdown answer body — supports tables, code blocks, headings, bold, etc.'],
                ['language', 'Yes', 'Language code that must already exist (e.g. java, typescript)'],
                ['category', 'Yes', 'Category name — created automatically if it does not exist for that language'],
                ['tags', 'No', 'Array of tag names — created automatically if they do not exist for that language'],
              ].map(([field, req, desc]) => (
                <tr key={field}>
                  <td className="py-1.5 pr-4 font-mono text-primary-600">{field}</td>
                  <td className="py-1.5 pr-4">{req}</td>
                  <td className="py-1.5 text-muted-light">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {result && (
        <div
          className={clsx(
            'rounded-xl border p-4 space-y-3',
            allOk ? 'bg-success-bg border-success-light' : 'bg-warning-bg border-warning-border'
          )}
        >
          <div className="flex items-center gap-2 font-medium">
            {allOk ? <CheckCircle2 className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-warning" />}
            <span>
              {result.successCount} of {result.totalItems} imported
              {result.updatedCount > 0 && `, ${result.updatedCount} updated`}
              {result.skippedCount > 0 && `, ${result.skippedCount} skipped`}
              {result.failureCount > 0 && `, ${result.failureCount} failed`}
            </span>
          </div>

          {result.errors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-error uppercase tracking-wide mb-1">Errors</p>
              <ul className="text-sm text-error list-disc list-inside space-y-0.5 max-h-32 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {result.skipped && result.skipped.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-warning uppercase tracking-wide mb-1">
                <SkipForward className="w-3.5 h-3.5" />
                Skipped duplicates
              </div>
              <ul className="text-sm text-warning list-disc list-inside space-y-0.5 max-h-32 overflow-y-auto">
                {result.skipped.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {currentConflict && (
        <DuplicateReviewModal
          conflict={currentConflict}
          currentIndex={reviewIndex + 1}
          totalConflicts={conflicts.length}
          isSubmitting={commitMutation.isPending}
          onAccept={() => resolveCurrentConflict('accept')}
          onSkip={() => resolveCurrentConflict('skip')}
          onClose={closeReview}
        />
      )}
    </div>
  );
}
