import { Loader2 } from 'lucide-react'
import ModalShell from './ModalShell'

interface DeleteConfirmDialogProps {
  itemLabel?: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmDialog({
  itemLabel = 'this item',
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <ModalShell title="Confirm Delete" onClose={onCancel} maxWidth="sm">
      <div className="px-6 py-5 space-y-5">
        <p className="text-sm text-foreground-secondary">
          Are you sure you want to delete {itemLabel}? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-foreground-secondary border border-border-strong
                       rounded-lg hover:bg-surface-alt transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600
                       rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
