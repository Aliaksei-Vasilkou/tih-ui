import type { PageResponse, Question } from '@/types';
import QuestionCard from '@/components/question/QuestionCard';
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

interface SearchResultsProps {
  data?: PageResponse<Question>;
  isLoading: boolean;
  isError: boolean;
  query: string;
  page: number;
  onPageChange: (page: number) => void;
  // When true, cards hide language badge, show only level tags, link to /prepare/questions/:id
  readOnly?: boolean;
  // When true, cards hide language badge, show only level tags, link to /questions/:id (full-edit route)
  hideLanguage?: boolean;
  // When false, cards hide the category badge (use when a specific category is already selected)
  showCategory?: boolean;
}

export default function SearchResults({
  data,
  isLoading,
  isError,
  query,
  page,
  onPageChange,
  readOnly = false,
  hideLanguage = false,
  showCategory = true,
}: SearchResultsProps) {
  if (isLoading) return <PageLoader message="Searching…" />;

  if (isError) {
    return (
      <div className="text-center py-20 text-error">
        <p className="text-lg font-medium">Failed to load results.</p>
        <p className="text-sm mt-1">Please try again.</p>
      </div>
    );
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-muted-light gap-3">
        <SearchX className="w-12 h-12" />
        <p className="text-lg font-medium">{query ? `No results for "${query}"` : 'No questions found'}</p>
        <p className="text-sm">Try different keywords or adjust the filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {data.totalElements} question{data.totalElements !== 1 ? 's' : ''} found
        {query && (
          <>
            {' '}
            for <span className="font-medium text-foreground-secondary">{`"${query}"`}</span>
          </>
        )}
      </p>

      <div className="space-y-1.5">
        {data.content.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            query={query}
            readOnly={readOnly}
            hideLanguage={hideLanguage}
            showCategory={showCategory}
          />
        ))}
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className="p-2 rounded-lg border border-border-strong disabled:opacity-40 hover:bg-surface-alt disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-muted">
            Page {page + 1} of {data.totalPages}
          </span>
          <button
            disabled={data.last}
            onClick={() => onPageChange(page + 1)}
            className="p-2 rounded-lg border border-border-strong disabled:opacity-40 hover:bg-surface-alt disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
