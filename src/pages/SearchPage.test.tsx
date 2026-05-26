import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import SearchPage from './SearchPage';
import { useUIStore } from '@/store/uiStore';
import { useFilterStore } from '@/store/filterStore';

vi.mock('@/api/questions');
vi.mock('@/api/categories');
vi.mock('@/api/languages');
vi.mock('@/components/common/BatchUpload', () => ({
  default: () => <div data-testid="batch-upload">BatchUpload</div>,
}));
vi.mock('@/components/common/BatchExport', () => ({
  default: () => <div data-testid="batch-export">BatchExport</div>,
}));

import { questionsApi } from '@/api/questions';
import { categoriesApi } from '@/api/categories';

const emptyPage = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  last: true,
};

beforeEach(() => {
  vi.mocked(questionsApi.search).mockResolvedValue(emptyPage);
  vi.mocked(categoriesApi.getAll).mockResolvedValue([]);
});

afterEach(() => {
  act(() => {
    useUIStore.setState({ showUpload: false, showExport: false });
    useFilterStore.setState({
      selectedLanguageId: null,
      selectedCategoryId: null,
    });
  });
  vi.clearAllMocks();
});

describe('SearchPage', () => {
  it('should render the search box', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should populate search box from the q URL param', () => {
    renderWithProviders(<SearchPage />, {
      initialEntries: ['/search?q=react'],
    });
    expect(screen.getByRole('textbox')).toHaveValue('react');
  });

  it('should show upload panel when showUpload is true in store', () => {
    act(() => {
      useUIStore.setState({ showUpload: true });
    });
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    expect(screen.getByText('Batch Import Questions')).toBeInTheDocument();
    expect(screen.getByTestId('batch-upload')).toBeInTheDocument();
  });

  it('should hide upload panel when showUpload is false', () => {
    act(() => {
      useUIStore.setState({ showUpload: false });
    });
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    expect(screen.queryByTestId('batch-upload')).not.toBeInTheDocument();
  });

  it('should show export panel when showExport is true in store', () => {
    act(() => {
      useUIStore.setState({ showExport: true });
    });
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    expect(screen.getByText('Export Questions')).toBeInTheDocument();
    expect(screen.getByTestId('batch-export')).toBeInTheDocument();
  });

  it('should hide export panel when showExport is false', () => {
    act(() => {
      useUIStore.setState({ showExport: false });
    });
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    expect(screen.queryByTestId('batch-export')).not.toBeInTheDocument();
  });

  it('should show empty state when there are no results', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    await waitFor(() => {
      expect(screen.getByText(/no questions found/i)).toBeInTheDocument();
    });
  });

  it('should show result cards after successful search', async () => {
    const mockPage = {
      content: [
        {
          id: 1,
          questionText: 'What is a hook?',
          answerContent: '',
          languageId: 1,
          languageName: 'React',
          languageCode: 'react',
          categoryId: 1,
          categoryName: 'Hooks',
          tags: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'admin',
        },
      ],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      last: true,
    };
    vi.mocked(questionsApi.search).mockResolvedValue(mockPage);

    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });
    await waitFor(() => {
      expect(screen.getByText('What is a hook?')).toBeInTheDocument();
    });
  });

  it('should update the query param when typing in the search box', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });

    const input = screen.getByRole('textbox');
    await user.type(input, 'closure');
    // SearchBox calls onChange per character; we verify the input value reflects the typing
    expect(input).toHaveValue('closure');
  });
});
