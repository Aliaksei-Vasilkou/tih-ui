import { useSearchParams } from 'react-router-dom';

import SearchBox from '@/components/search/SearchBox';
import SearchResults from '@/components/search/SearchResults';
import FilterPanel from '@/components/common/FilterPanel';
import { useFilterStore } from '@/store/filterStore';
import { useSearch } from '@/hooks/useSearch';

export default function PreparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const page = Number(searchParams.get('page') ?? '0');
  const levelTag = searchParams.get('level');

  const { selectedLanguageId, selectedCategoryId } = useFilterStore();
  const showCategory = selectedCategoryId === null;

  const { data, isLoading, isError } = useSearch(query, selectedLanguageId, selectedCategoryId, page, 20, levelTag);

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
      <SearchBox value={query} onChange={handleQueryChange} />

      <FilterPanel onCategoryChange={() => handlePageChange(0)} allBold />

      <SearchResults
        data={data}
        isLoading={isLoading}
        isError={isError}
        query={query}
        page={page}
        onPageChange={handlePageChange}
        readOnly
        showCategory={showCategory}
      />
    </div>
  );
}
