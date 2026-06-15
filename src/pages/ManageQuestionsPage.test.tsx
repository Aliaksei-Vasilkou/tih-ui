import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/renderWithProviders';
import { useUIStore } from '@/store/uiStore';
import { useFilterStore } from '@/store/filterStore';
import ManageQuestionsPage from './ManageQuestionsPage';

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

const questionPage = {
  content: [
    {
      id: 1,
      questionText: 'What is polymorphism?',
      answerContent: '',
      languageId: 1,
      languageName: 'Java',
      languageCode: 'java',
      categoryId: 1,
      categoryName: 'OOP',
      tags: ['L1'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      createdBy: 'user',
    },
  ],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
  last: true,
};

beforeEach(() => {
  vi.mocked(questionsApi.search).mockResolvedValue(emptyPage);
  vi.mocked(categoriesApi.getAll).mockResolvedValue([]);
});

afterEach(() => {
  act(() => {
    useUIStore.setState({ showUpload: false, showExport: false });
    useFilterStore.setState({ selectedLanguageId: null, selectedCategoryId: null });
  });
  vi.clearAllMocks();
});

describe('ManageQuestionsPage', () => {
  it('renders the search box', () => {
    renderWithProviders(<ManageQuestionsPage />, { initialEntries: ['/manage'] });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('does NOT render a LanguageSelector in page body', () => {
    renderWithProviders(<ManageQuestionsPage />, { initialEntries: ['/manage'] });
    expect(screen.queryByRole('button', { name: /all languages/i })).not.toBeInTheDocument();
  });

  it('renders New Question as an icon-only link (no visible text)', () => {
    renderWithProviders(<ManageQuestionsPage />, { initialEntries: ['/manage'] });
    const link = screen.getByRole('link', { name: /new question/i });
    expect(link).toBeInTheDocument();
    expect(link.textContent?.trim()).toBe('');
  });

  it('links New Question button to /questions/new', () => {
    renderWithProviders(<ManageQuestionsPage />, { initialEntries: ['/manage'] });
    expect(screen.getByRole('link', { name: /new question/i })).toHaveAttribute('href', '/questions/new');
  });

  it('renders Import as an icon-only button (no visible text)', () => {
    renderWithProviders(<ManageQuestionsPage />, { initialEntries: ['/manage'] });
    const btn = screen.getByRole('button', { name: /import/i });
    expect(btn).toBeInTheDocument();
    expect(btn.textContent?.trim()).toBe('');
  });

  it('renders Export as an icon-only button (no visible text)', () => {
    renderWithProviders(<ManageQuestionsPage />, { initialEntries: ['/manage'] });
    const btn = screen.getByRole('button', { name: /export/i });
    expect(btn).toBeInTheDocument();
    expect(btn.textContent?.trim()).toBe('');
  });

  it('shows batch upload panel when Import is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ManageQuestionsPage />, { initialEntries: ['/manage'] });
    await user.click(screen.getByRole('button', { name: /import/i }));
    expect(screen.getByTestId('batch-upload')).toBeInTheDocument();
  });

  it('shows batch export panel when Export is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ManageQuestionsPage />, { initialEntries: ['/manage'] });
    await user.click(screen.getByRole('button', { name: /export/i }));
    expect(screen.getByTestId('batch-export')).toBeInTheDocument();
  });

  it('shows upload panel when showUpload is true in store', () => {
    act(() => {
      useUIStore.setState({ showUpload: true });
    });
    renderWithProviders(<ManageQuestionsPage />, { initialEntries: ['/manage'] });
    expect(screen.getByTestId('batch-upload')).toBeInTheDocument();
  });

  it('shows export panel when showExport is true in store', () => {
    act(() => {
      useUIStore.setState({ showExport: true });
    });
    renderWithProviders(<ManageQuestionsPage />, { initialEntries: ['/manage'] });
    expect(screen.getByTestId('batch-export')).toBeInTheDocument();
  });

  it('shows empty state when there are no results', async () => {
    renderWithProviders(<ManageQuestionsPage />, { initialEntries: ['/manage'] });
    await waitFor(() => {
      expect(screen.getByText(/no questions found/i)).toBeInTheDocument();
    });
  });

  it('result cards do not show the language badge', async () => {
    vi.mocked(questionsApi.search).mockResolvedValue(questionPage);
    renderWithProviders(<ManageQuestionsPage />, { initialEntries: ['/manage'] });
    await waitFor(() => {
      expect(screen.getByText('What is polymorphism?')).toBeInTheDocument();
    });
    expect(screen.queryByText('Java')).not.toBeInTheDocument();
  });

  it('shows category badge on result cards when no category is selected (All)', async () => {
    vi.mocked(questionsApi.search).mockResolvedValue(questionPage);
    // selectedCategoryId is null by default
    renderWithProviders(<ManageQuestionsPage />, { initialEntries: ['/manage'] });
    await waitFor(() => {
      expect(screen.getByText('What is polymorphism?')).toBeInTheDocument();
    });
    expect(screen.getByText('OOP')).toBeInTheDocument();
  });

  it('hides category badge on result cards when a specific category is selected', async () => {
    act(() => {
      useFilterStore.setState({ selectedLanguageId: 1, selectedCategoryId: 1 });
    });
    vi.mocked(questionsApi.search).mockResolvedValue(questionPage);
    renderWithProviders(<ManageQuestionsPage />, { initialEntries: ['/manage'] });
    await waitFor(() => {
      expect(screen.getByText('What is polymorphism?')).toBeInTheDocument();
    });
    expect(screen.queryByText('OOP')).not.toBeInTheDocument();
  });
});
