import { Link, useSearchParams } from 'react-router-dom';
import { PlusCircle, Upload, Download, X } from 'lucide-react';
import clsx from 'clsx';

import SearchBox from '@/components/search/SearchBox';
import SearchResults from '@/components/search/SearchResults';
import FilterPanel from '@/components/common/FilterPanel';
import BatchUpload from '@/components/common/BatchUpload';
import BatchExport from '@/components/common/BatchExport';
import { useFilterStore } from '@/store/filterStore';
import { useUIStore } from '@/store/uiStore';
import { useSearch } from '@/hooks/useSearch';

export default function ManageQuestionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const page = Number(searchParams.get('page') ?? '0');

  const { selectedLanguageId, selectedCategoryId } = useFilterStore();
  const { showUpload, toggleUpload, showExport, toggleExport } = useUIStore();
  const showCategory = selectedCategoryId === null;

  const { data, isLoading, isError } = useSearch(query, selectedLanguageId, selectedCategoryId, page);

  const handleQueryChange = (val: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (val) next.set('q', val);
        else next.delete('q');
        next.delete('page');
        return next;
      },
      { replace: true }
    );
  };

  const handlePageChange = (val: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (val > 0) next.set('page', String(val));
        else next.delete('page');
        return next;
      },
      { replace: true }
    );
  };

  return (
    <div className="space-y-5">
      {/* Toolbar row: search + icon-only action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-0">
          <SearchBox value={query} onChange={handleQueryChange} />
        </div>

        {/* Add — icon only, primary colour */}
        <Link
          to="/questions/new"
          aria-label="New Question"
          className="p-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <PlusCircle className="w-4 h-4" aria-hidden="true" />
        </Link>

        {/* Import — icon only */}
        <button
          onClick={toggleUpload}
          aria-label={showUpload ? 'Close Import' : 'Import'}
          className={clsx(
            'p-2 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
            showUpload
              ? 'bg-surface-alt border-border-strong text-foreground'
              : 'border-border-strong text-muted hover:bg-surface-alt'
          )}
        >
          {showUpload ? (
            <X className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Upload className="w-4 h-4" aria-hidden="true" />
          )}
        </button>

        {/* Export — icon only */}
        <button
          onClick={toggleExport}
          aria-label={showExport ? 'Close Export' : 'Export'}
          className={clsx(
            'p-2 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
            showExport
              ? 'bg-surface-alt border-border-strong text-foreground'
              : 'border-border-strong text-muted hover:bg-surface-alt'
          )}
        >
          {showExport ? (
            <X className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Download className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {showUpload && (
        <div className="bg-surface rounded-xl border border-border p-5 shadow-theme-sm">
          <h2 className="text-base font-semibold text-foreground mb-4">Batch Import Questions</h2>
          <BatchUpload />
        </div>
      )}

      {showExport && (
        <div className="bg-surface rounded-xl border border-border p-5 shadow-theme-sm">
          <h2 className="text-base font-semibold text-foreground mb-4">Export Questions</h2>
          <BatchExport />
        </div>
      )}

      <FilterPanel onCategoryChange={() => handlePageChange(0)} allBold />

      <SearchResults
        data={data}
        isLoading={isLoading}
        isError={isError}
        query={query}
        page={page}
        onPageChange={handlePageChange}
        hideLanguage
        showCategory={showCategory}
      />
    </div>
  );
}
