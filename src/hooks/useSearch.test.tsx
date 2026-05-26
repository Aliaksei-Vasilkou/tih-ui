import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSearch } from './useSearch';

vi.mock('@/api/questions');
import { questionsApi } from '@/api/questions';

const emptyPage = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  last: true,
};

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.mocked(questionsApi.search).mockResolvedValue(emptyPage);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('useSearch', () => {
  it('should call questionsApi.search with the debounced query', async () => {
    const wrapper = makeWrapper();
    const { result } = renderHook(() => useSearch('react', null, null), {
      wrapper,
    });

    // advance past the 400ms debounce
    act(() => {
      vi.advanceTimersByTime(400);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(questionsApi.search).toHaveBeenCalledWith(expect.objectContaining({ q: 'react' }));
  });

  it('should pass undefined for q when query is empty string', async () => {
    const wrapper = makeWrapper();
    const { result } = renderHook(() => useSearch('', null, null), { wrapper });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(questionsApi.search).toHaveBeenCalledWith(expect.objectContaining({ q: undefined }));
  });

  it('should pass languageId and categoryId to the search', async () => {
    const wrapper = makeWrapper();
    const { result } = renderHook(() => useSearch('', 3, 7), { wrapper });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(questionsApi.search).toHaveBeenCalledWith(expect.objectContaining({ languageId: 3, categoryId: 7 }));
  });

  it('should pass page and size defaults', async () => {
    const wrapper = makeWrapper();
    const { result } = renderHook(() => useSearch('', null, null), { wrapper });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(questionsApi.search).toHaveBeenCalledWith(expect.objectContaining({ page: 0, size: 20 }));
  });

  it('should pass custom page and size when provided', async () => {
    const wrapper = makeWrapper();
    const { result } = renderHook(() => useSearch('test', null, null, 2, 10), {
      wrapper,
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(questionsApi.search).toHaveBeenCalledWith(expect.objectContaining({ page: 2, size: 10 }));
  });

  it('should return data from the api', async () => {
    const mockPage = {
      content: [{ id: 1 }],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      last: true,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(questionsApi.search).mockResolvedValue(mockPage as any);

    const wrapper = makeWrapper();
    const { result } = renderHook(() => useSearch('closure', null, null), {
      wrapper,
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.totalElements).toBe(1);
  });
});
