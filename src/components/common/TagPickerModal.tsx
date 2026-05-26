import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '@/api/tags';
import type { Tag, TagCreateRequest } from '@/types';
import { Plus, Pencil, Loader2, Check, X } from 'lucide-react';
import ModalShell from './ModalShell';

interface Props {
  languageId: number;
  selectedTagIds: number[];
  onClose: (selectedIds: number[]) => void;
}

export default function TagPickerModal({ languageId, selectedTagIds, onClose }: Props) {
  const queryClient = useQueryClient();

  const [localSelectedIds, setLocalSelectedIds] = useState<number[]>(selectedTagIds);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [formName, setFormName] = useState('');
  const [formError, setFormError] = useState('');

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags', languageId],
    queryFn: () => tagsApi.getAll(languageId),
    enabled: Boolean(languageId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tags'] });

  const createMutation = useMutation({
    mutationFn: (data: TagCreateRequest) => tagsApi.create(languageId, data),
    onSuccess: (created) => {
      invalidate();
      setLocalSelectedIds((prev) => [...prev, created.id]);
      resetForm();
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TagCreateRequest }) => tagsApi.update(languageId, id, data),
    onSuccess: () => {
      invalidate();
      resetForm();
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const resetForm = () => {
    setFormName('');
    setEditingId(null);
    setShowAdd(false);
    setFormError('');
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setFormName(tag.name);
    setShowAdd(false);
    setFormError('');
  };

  const handleSave = () => {
    if (!formName.trim()) {
      setFormError('Name is required');
      return;
    }
    const payload: TagCreateRequest = { name: formName.trim() };
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleTag = (id: number) => {
    setLocalSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const footer = (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => onClose(localSelectedIds)}
        className="px-4 py-2 text-sm font-medium text-foreground-secondary border border-border-strong
                   rounded-lg hover:bg-surface-alt transition-colors"
      >
        Done
      </button>
    </div>
  );

  return (
    <ModalShell title="Tags" onClose={() => onClose(localSelectedIds)} maxWidth="md" footer={footer}>
      <div className="px-6 py-5">
        {isLoading ? (
          <div className="flex justify-center py-8 text-muted-light">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 items-center">
            {!showAdd && editingId === null && (
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center justify-center w-7 h-7 rounded border-2 border-dashed
                           border-primary-400 text-primary-400 hover:border-primary-600 hover:text-primary-600
                           hover:bg-primary-50 transition-colors"
                title="New tag"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}

            {showAdd && (
              <InlineChipForm
                value={formName}
                onChange={setFormName}
                onSave={handleSave}
                onCancel={resetForm}
                isPending={createMutation.isPending}
                error={formError}
              />
            )}

            {tags.map((tag) =>
              editingId === tag.id ? (
                <InlineChipForm
                  key={tag.id}
                  value={formName}
                  onChange={setFormName}
                  onSave={handleSave}
                  onCancel={resetForm}
                  isPending={updateMutation.isPending}
                  error={formError}
                />
              ) : (
                <div key={tag.id} className="relative group/chip">
                  <button
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={localSelectedIds.includes(tag.id) ? 'tag-selected' : 'tag-interactive'}
                  >
                    {tag.name}
                  </button>
                  {/* Edit pencil fades in on hover after a short delay */}
                  <button
                    type="button"
                    onClick={() => startEdit(tag)}
                    title="Edit tag"
                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center
                               rounded-full bg-surface border border-border shadow-theme-sm
                               text-muted-light hover:text-primary-600 hover:border-primary-400
                               opacity-0 group-hover/chip:opacity-100
                               transition-opacity duration-150 delay-200"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </button>
                </div>
              )
            )}

            {tags.length === 0 && !showAdd && (
              <p className="text-sm text-muted-light">
                No tags yet — click <strong>+</strong> to add the first one.
              </p>
            )}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

interface InlineChipFormProps {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isPending: boolean;
  error: string;
}

function InlineChipForm({ value, onChange, onSave, onCancel, isPending, error }: InlineChipFormProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave();
            if (e.key === 'Escape') onCancel();
          }}
          placeholder="Tag name…"
          className="w-28 rounded border border-primary-400 px-2 py-0.5 text-xs text-foreground
                     bg-surface placeholder-placeholder focus:outline-none focus:ring-1 focus:ring-primary-500
                     focus:border-primary-500 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={onSave}
          disabled={isPending || !value.trim()}
          className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary-600
                     text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center w-6 h-6 rounded border border-border-strong
                     text-muted hover:text-foreground-secondary hover:border-border transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      {error && <p className="text-error text-[10px]">{error}</p>}
    </div>
  );
}
