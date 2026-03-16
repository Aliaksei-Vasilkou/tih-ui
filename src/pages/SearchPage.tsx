import { useState } from 'react'
import SearchBox from '@/components/search/SearchBox'
import SearchResults from '@/components/search/SearchResults'
import FilterPanel from '@/components/common/FilterPanel'
import BatchUpload from '@/components/common/BatchUpload'
import BatchExport from '@/components/common/BatchExport'
import { useFilterStore } from '@/store/filterStore'
import { useUIStore } from '@/store/uiStore'
import { useSearch } from '@/hooks/useSearch'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const { selectedLanguageId, selectedCategoryId } = useFilterStore()
  const { showUpload, showExport } = useUIStore()

  const { data, isLoading, isError } = useSearch(
    query,
    selectedLanguageId,
    selectedCategoryId,
    page,
  )

  const handleQueryChange = (val: string) => {
    setQuery(val)
    setPage(0)
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
      <FilterPanel />

      {/* Results */}
      <SearchResults
        data={data}
        isLoading={isLoading}
        isError={isError}
        query={query}
        page={page}
        onPageChange={setPage}
      />
    </div>
  )
}
