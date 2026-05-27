import { AlertTriangle, Loader2 } from 'lucide-react';
import ModalShell from './ModalShell';

interface UnsavedChangesDialogProps {
  isSaving: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

export default function UnsavedChangesDialog({
  isSaving,
  onKeepEditing,
  onDiscard,
  onSave,
}: UnsavedChangesDialogProps) {
  return (
    <ModalShell title="Unsaved Changes" onClose={onKeepEditing} maxWidth="md">
      <div className="px-6 py-5 space-y-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-warning-bg">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <p className="text-sm text-foreground-secondary mt-2">
            You have unsaved changes. Do you want to save them before leaving?
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onKeepEditing}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-foreground-secondary border border-border-strong
                       rounded-lg hover:bg-surface-alt transition-colors disabled:opacity-50"
          >
            Keep Editing
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-error border border-error-light
                       rounded-lg hover:bg-error-bg transition-colors disabled:opacity-50"
          >
            Discard Changes
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium
                       text-white bg-primary-600 rounded-lg hover:bg-primary-700
                       transition-colors disabled:opacity-60"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
