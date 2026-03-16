import { useQuery } from '@tanstack/react-query'
import { languagesApi } from '@/api/languages'
import { categoriesApi } from '@/api/categories'
import { useFilterStore } from '@/store/filterStore'
import clsx from 'clsx'

export default function FilterPanel() {
  const { selectedLanguageId, selectedCategoryId, setLanguage, setCategory, reset } =
    useFilterStore()

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: languagesApi.getAll,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', selectedLanguageId],
    queryFn: () => categoriesApi.getAll(selectedLanguageId!),
    enabled: Boolean(selectedLanguageId),
  })

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Language filters */}
      <button
        onClick={reset}
        className={clsx(
          'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
          !selectedLanguageId
            ? 'bg-primary-600 text-white border-primary-600'
            : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400',
        )}
      >
        All
      </button>

      {languages.map((lang) => (
        <button
          key={lang.id}
          onClick={() => setLanguage(lang.id)}
          className={clsx(
            'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
            selectedLanguageId === lang.id
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400',
          )}
        >
          {lang.name}
        </button>
      ))}

      {/* Category sub-filters (shown when a language is selected) */}
      {selectedLanguageId && categories.length > 0 && (
        <>
          <span className="text-gray-300 mx-1">|</span>
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
        </>
      )}
    </div>
  )
}
