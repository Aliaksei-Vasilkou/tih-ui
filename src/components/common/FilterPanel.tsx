import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/api/categories'
import { useFilterStore } from '@/store/filterStore'
import clsx from 'clsx'

export default function FilterPanel() {
  const { selectedLanguageId, selectedCategoryId, setCategory } = useFilterStore()

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', selectedLanguageId],
    queryFn: () => categoriesApi.getAll(selectedLanguageId!),
    enabled: Boolean(selectedLanguageId),
  })

  if (!selectedLanguageId || categories.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setCategory(selectedCategoryId === cat.id ? null : cat.id)}
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
