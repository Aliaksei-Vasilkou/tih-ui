import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import LanguageSelector from './LanguageSelector';
import { useFilterStore } from '@/store/filterStore';

vi.mock('@/api/languages');
import { languagesApi } from '@/api/languages';

const mockLanguages = [
  {
    id: 1,
    name: 'Java',
    code: 'java',
    createdAt: '',
    updatedAt: '',
    createdBy: '',
  },
  {
    id: 2,
    name: 'TypeScript',
    code: 'typescript',
    createdAt: '',
    updatedAt: '',
    createdBy: '',
  },
  {
    id: 3,
    name: 'General',
    code: 'general',
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

describe('LanguageSelector', () => {
  it('should filter out the general language from the options', async () => {
    vi.mocked(languagesApi.getAll).mockResolvedValue(mockLanguages);
    const user = userEvent.setup();
    renderWithProviders(<LanguageSelector />);

    // Open the dropdown
    await user.click(screen.getByRole('button', { name: /all languages/i }));

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
      // General option should NOT appear
      expect(listbox.textContent).not.toMatch(/general/i);
    });
  });

  it('should render Java and TypeScript options but not General', async () => {
    vi.mocked(languagesApi.getAll).mockResolvedValue(mockLanguages);
    const user = userEvent.setup();
    renderWithProviders(<LanguageSelector />);

    await user.click(screen.getByRole('button', { name: /all languages/i }));

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Java' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'TypeScript' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: /general/i })).not.toBeInTheDocument();
    });
  });

  it('should call reset when the All Languages placeholder option is selected', async () => {
    vi.mocked(languagesApi.getAll).mockResolvedValue(mockLanguages);
    act(() => {
      useFilterStore.setState({ selectedLanguageId: 1 });
    });

    const user = userEvent.setup();
    renderWithProviders(<LanguageSelector />);

    // Wait for the query to load and the button to show "Java"
    await waitFor(() => expect(screen.getByRole('button', { name: 'Java' })).toBeInTheDocument());

    // Open the dropdown
    await user.click(screen.getByRole('button', { name: 'Java' }));

    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());
    // Click the placeholder option (All Languages)
    await user.click(screen.getByRole('button', { name: 'All Languages' }));

    expect(useFilterStore.getState().selectedLanguageId).toBeNull();
  });

  it('should call setLanguage with numeric id when a language is selected', async () => {
    vi.mocked(languagesApi.getAll).mockResolvedValue(mockLanguages);

    const user = userEvent.setup();
    renderWithProviders(<LanguageSelector />);

    await user.click(screen.getByRole('button', { name: /all languages/i }));
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'TypeScript' }));
    expect(useFilterStore.getState().selectedLanguageId).toBe(2);
  });
});
