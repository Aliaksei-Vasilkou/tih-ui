import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/api/categories'
import { useFilterStore } from '@/store/filterStore'
import clsx from 'clsx'

interface FilterPanelProps {
  onCategoryChange?: () => void
}

export default function FilterPanel({ onCategoryChange }: FilterPanelProps) {
  const { selectedLanguageId, selectedCategoryId, setCategory } = useFilterStore()

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', selectedLanguageId],
    queryFn: () => categoriesApi.getAll(selectedLanguageId!),
    enabled: Boolean(selectedLanguageId),
  })

  if (!selectedLanguageId || categories.length === 0) return null

  const handleSelect = (id: number | null) => {
    setCategory(id)
    onCategoryChange?.()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* All button — always first, active when nothing is selected */}
      <button
        onClick={() => handleSelect(null)}
        className={clsx(
          'px-3 py-1.5 rounded-full text-sm border transition-colors',
          selectedCategoryId === null
            ? 'bg-gray-800 text-white border-gray-800'
            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400',
        )}
      >
        All
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleSelect(cat.id)}
          className={clsx(
            'px-3 py-1.5 rounded-full text-sm border transition-colors',
            selectedCategoryId === cat.id
              ? 'bg-gray-800 text-white border-gray-800'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400',
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
