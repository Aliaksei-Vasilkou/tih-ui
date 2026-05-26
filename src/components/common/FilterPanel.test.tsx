import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import FilterPanel from './FilterPanel';
import { useFilterStore } from '@/store/filterStore';

vi.mock('@/api/categories');
import { categoriesApi } from '@/api/categories';

const mockCategories = [
  {
    id: 1,
    name: 'Core',
    languageId: 1,
    languageName: 'Java',
    languageCode: 'java',
    createdAt: '',
    updatedAt: '',
    createdBy: '',
  },
  {
    id: 2,
    name: 'Collections',
    languageId: 1,
    languageName: 'Java',
    languageCode: 'java',
    createdAt: '',
    updatedAt: '',
    createdBy: '',
  },
];

afterEach(() => {
  act(() => {
    useFilterStore.setState({
      selectedLanguageId: null,
      selectedCategoryId: null,
    });
  });
  vi.clearAllMocks();
});

describe('FilterPanel', () => {
  it('should render nothing when no language is selected', () => {
    vi.mocked(categoriesApi.getAll).mockResolvedValue([]);
    act(() => {
      useFilterStore.setState({ selectedLanguageId: null });
    });

    const { container } = renderWithProviders(<FilterPanel />);
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when language is selected but categories are empty', async () => {
    vi.mocked(categoriesApi.getAll).mockResolvedValue([]);
    act(() => {
      useFilterStore.setState({ selectedLanguageId: 1 });
    });

    const { container } = renderWithProviders(<FilterPanel />);
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should render All button and category buttons when language and categories are available', async () => {
    vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
    act(() => {
      useFilterStore.setState({ selectedLanguageId: 1 });
    });

    renderWithProviders(<FilterPanel />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Core' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Collections' })).toBeInTheDocument();
    });
  });

  it('should call setCategory with category id when a category button is clicked', async () => {
    vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
    act(() => {
      useFilterStore.setState({
        selectedLanguageId: 1,
        selectedCategoryId: null,
      });
    });

    const user = userEvent.setup();
    renderWithProviders(<FilterPanel />);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Core' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Core' }));

    expect(useFilterStore.getState().selectedCategoryId).toBe(1);
  });

  it('should call setCategory with null when the All button is clicked', async () => {
    vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
    act(() => {
      useFilterStore.setState({ selectedLanguageId: 1, selectedCategoryId: 1 });
    });

    const user = userEvent.setup();
    renderWithProviders(<FilterPanel />);

    await waitFor(() => expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /all/i }));

    expect(useFilterStore.getState().selectedCategoryId).toBeNull();
  });

  it('should call onCategoryChange callback when a category is selected', async () => {
    vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
    act(() => {
      useFilterStore.setState({ selectedLanguageId: 1 });
    });

    const onCategoryChange = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<FilterPanel onCategoryChange={onCategoryChange} />);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Collections' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Collections' }));

    expect(onCategoryChange).toHaveBeenCalledOnce();
  });
});
