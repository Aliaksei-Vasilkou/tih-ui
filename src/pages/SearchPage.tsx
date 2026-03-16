import { useState } from 'react'
import SearchBox from '@/components/search/SearchBox'
import SearchResults from '@/components/search/SearchResults'
import FilterPanel from '@/components/common/FilterPanel'
import BatchUpload from '@/components/common/BatchUpload'
import { useFilterStore } from '@/store/filterStore'
import { useSearch } from '@/hooks/useSearch'
import { Upload, X } from 'lucide-react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [showUpload, setShowUpload] = useState(false)
  const { selectedLanguageId, selectedCategoryId } = useFilterStore()

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
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SearchBox value={query} onChange={handleQueryChange} />
        </div>
        <button
          onClick={() => setShowUpload((v) => !v)}
          title="Batch upload"
          className="flex items-center gap-1.5 px-3 py-3 border border-gray-300 rounded-xl
                     text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
        >
          {showUpload ? <X className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
          <span className="hidden sm:block text-sm">{showUpload ? 'Close' : 'Import'}</span>
        </button>
      </div>

      {/* Batch upload panel */}
      {showUpload && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Batch Import Questions</h2>
          <BatchUpload />
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
