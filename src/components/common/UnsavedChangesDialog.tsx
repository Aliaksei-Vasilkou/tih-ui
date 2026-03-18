import { AlertTriangle, Loader2 } from 'lucide-react'

interface UnsavedChangesDialogProps {
  isSaving: boolean
  onKeepEditing: () => void
  onDiscard: () => void
  onSave: () => void
}

export default function UnsavedChangesDialog({
  isSaving,
  onKeepEditing,
  onDiscard,
  onSave,
}: UnsavedChangesDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        {/* Icon + heading */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Unsaved Changes</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              You have unsaved changes. Do you want to save them before leaving?
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onKeepEditing}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300
                       rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Keep Editing
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200
                       rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
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
    </div>
  )
}
