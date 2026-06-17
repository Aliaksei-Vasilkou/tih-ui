import { ArrowRight, Check, X } from 'lucide-react';

import type { DuplicateConflict } from '@/types';
import ModalShell from '@/components/common/ModalShell';
import QuestionDiffView from '@/components/common/QuestionDiffView';

interface DuplicateReviewModalProps {
  conflict: DuplicateConflict;
  currentIndex: number;
  totalConflicts: number;
  isSubmitting: boolean;
  onAccept: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export default function DuplicateReviewModal({
  conflict,
  currentIndex,
  totalConflicts,
  isSubmitting,
  onAccept,
  onSkip,
  onClose,
}: DuplicateReviewModalProps) {
  const footer = (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onSkip}
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <X className="h-4 w-4" />
        Skip
      </button>
      <button
        type="button"
        onClick={onAccept}
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <Check className="h-4 w-4" />
        Accept new version
      </button>
    </div>
  );

  return (
    <ModalShell title="Review duplicate" onClose={onClose} maxWidth="2xl" footer={footer}>
      <div className="border-b border-border px-6 py-3">
        <div aria-live="polite" className="flex items-center gap-2 text-sm text-muted">
          <span>
            Duplicate {currentIndex} of {totalConflicts}
          </span>
          <ArrowRight className="h-4 w-4" />
          <span className="font-mono text-primary-600">{conflict.extId || 'unknown-ext-id'}</span>
        </div>
      </div>

      <QuestionDiffView conflict={conflict} />
    </ModalShell>
  );
}
