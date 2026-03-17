import { useSearchParams } from 'react-router-dom'
import SearchBox from '@/components/search/SearchBox'
import SearchResults from '@/components/search/SearchResults'
import FilterPanel from '@/components/common/FilterPanel'
import BatchUpload from '@/components/common/BatchUpload'
import BatchExport from '@/components/common/BatchExport'
import { useFilterStore } from '@/store/filterStore'
import { useUIStore } from '@/store/uiStore'
import { useSearch } from '@/hooks/useSearch'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const page  = Number(searchParams.get('page') ?? '0')

  const { selectedLanguageId, selectedCategoryId } = useFilterStore()
  const { showUpload, showExport } = useUIStore()

  const { data, isLoading, isError } = useSearch(
    query,
    selectedLanguageId,
    selectedCategoryId,
    page,
  )

  const handleQueryChange = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (val) next.set('q', val); else next.delete('q')
      next.delete('page')
      return next
    }, { replace: true })
  }

  const handlePageChange = (val: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (val > 0) next.set('page', String(val)); else next.delete('page')
      return next
    }, { replace: true })
  }

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <SearchBox value={query} onChange={handleQueryChange} />

      {/* Batch import panel */}
      {showUpload && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Batch Import Questions</h2>
          <BatchUpload />
        </div>
      )}

      {/* Export panel */}
      {showExport && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Export Questions</h2>
          <BatchExport />
        </div>
      )}

      {/* Filters */}
      <FilterPanel onCategoryChange={() => handlePageChange(0)} />

      {/* Results */}
      <SearchResults
        data={data}
        isLoading={isLoading}
        isError={isError}
        query={query}
        page={page}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
