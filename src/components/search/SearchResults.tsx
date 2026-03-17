import type { PageResponse, Question } from '@/types'
import QuestionCard from '@/components/question/QuestionCard'
import { ChevronLeft, ChevronRight, Loader2, SearchX } from 'lucide-react'

interface SearchResultsProps {
  data?: PageResponse<Question>
  isLoading: boolean
  isError: boolean
  query: string
  page: number
  onPageChange: (page: number) => void
}

export default function SearchResults({
  data,
  isLoading,
  isError,
  query,
  page,
  onPageChange,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mr-3" />
        <span className="text-lg">Searching…</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        <p className="text-lg font-medium">Failed to load results.</p>
        <p className="text-sm mt-1">Please try again.</p>
      </div>
    )
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400 gap-3">
        <SearchX className="w-12 h-12" />
        <p className="text-lg font-medium">
          {query ? `No results for "${query}"` : 'No questions found'}
        </p>
        <p className="text-sm">Try different keywords or adjust the filters.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Result count */}
      <p className="text-sm text-gray-500">
        {data.totalElements} question{data.totalElements !== 1 ? 's' : ''} found
        {query && <> for <span className="font-medium text-gray-700">"{query}"</span></>}
      </p>

      {/* Cards */}
      <div className="space-y-1.5">
        {data.content.map((question) => (
          <QuestionCard key={question.id} question={question} query={query} />
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className="p-2 rounded-lg border border-blue-400 text-blue-600 bg-white
                       hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-blue-600">
            Page {page + 1} of {data.totalPages}
          </span>
          <button
            disabled={data.last}
            onClick={() => onPageChange(page + 1)}
            className="p-2 rounded-lg border border-blue-400 text-blue-600 bg-white
                       hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
