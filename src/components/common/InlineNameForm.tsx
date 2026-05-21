import { X, Check, Loader2 } from 'lucide-react'

interface InlineNameFormProps {
  value: string
  onChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  isPending: boolean
  error: string
  placeholder?: string
}

export default function InlineNameForm({
  value,
  onChange,
  onSave,
  onCancel,
  isPending,
  error,
  placeholder = 'Name…',
}: InlineNameFormProps) {
  return (
    <div className="py-2 space-y-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-border-strong px-3 py-1.5 text-sm text-foreground
                     bg-surface placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500"
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
          autoFocus
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
