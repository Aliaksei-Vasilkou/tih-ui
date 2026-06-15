import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { categoriesApi } from '@/api/categories';
import { useFilterStore } from '@/store/filterStore';

interface FilterPanelProps {
  onCategoryChange?: () => void;
  allBold?: boolean;
}

export default function FilterPanel({ onCategoryChange, allBold = false }: FilterPanelProps) {
  const { selectedLanguageId, selectedCategoryId, setCategory } = useFilterStore();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', selectedLanguageId],
    queryFn: () => categoriesApi.getAll(selectedLanguageId!),
    enabled: Boolean(selectedLanguageId),
  });

  if (!selectedLanguageId || categories.length === 0) return null;

  const handleSelect = (id: number | null) => {
    setCategory(id);
    onCategoryChange?.();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => handleSelect(null)}
        className={clsx(
          'px-3 py-1 rounded-full text-sm border transition-colors',
          selectedCategoryId === null
            ? 'bg-toolbar-active-bg text-toolbar-active-text border-toolbar-active-bg'
            : 'bg-surface text-muted border-border hover:border-border-strong',
          allBold && 'font-bold'
        )}
      >
        All
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleSelect(cat.id)}
          className={clsx(
            'px-3 py-1 rounded-full text-sm border transition-colors',
            selectedCategoryId === cat.id
              ? 'bg-toolbar-active-bg text-toolbar-active-text border-toolbar-active-bg'
              : 'bg-surface text-muted border-border hover:border-border-strong'
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
