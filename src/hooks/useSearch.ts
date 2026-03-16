import { useQuery } from '@tanstack/react-query'
import { questionsApi } from '@/api/questions'
import { useDebounce } from './useDebounce'

export function useSearch(
  query: string,
  languageId: number | null,
  categoryId: number | null,
  page = 0,
  size = 20,
) {
  const debouncedQuery = useDebounce(query, 400)

  return useQuery({
    queryKey: ['questions', 'search', debouncedQuery, languageId, categoryId, page, size],
    queryFn: () =>
      questionsApi.search({
        q: debouncedQuery || undefined,
        languageId,
        categoryId,
        page,
        size,
      }),
    placeholderData: (prev) => prev,
  })
}
