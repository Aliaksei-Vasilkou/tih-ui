import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';
import { useFilterStore } from '@/store/filterStore';
import PreparePage from './PreparePage';

vi.mock('@/api/questions');
vi.mock('@/api/categories');
vi.mock('@/api/languages');

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
    useFilterStore.setState({ selectedLanguageId: null, selectedCategoryId: null });
  });
  vi.clearAllMocks();
});

describe('PreparePage', () => {
  it('renders the search box', () => {
    renderWithProviders(<PreparePage />, { initialEntries: ['/prepare'] });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('populates search box from the ?q URL param', () => {
    renderWithProviders(<PreparePage />, { initialEntries: ['/prepare?q=react'] });
    expect(screen.getByRole('textbox')).toHaveValue('react');
  });

  it('shows empty state when there are no results', async () => {
    renderWithProviders(<PreparePage />, { initialEntries: ['/prepare'] });
    await waitFor(() => {
      expect(screen.getByText(/no questions found/i)).toBeInTheDocument();
    });
  });

  it('does NOT render a New Question button', () => {
    renderWithProviders(<PreparePage />, { initialEntries: ['/prepare'] });
    expect(screen.queryByRole('button', { name: /new question/i })).not.toBeInTheDocument();
  });

  it('does NOT render an Import button', () => {
    renderWithProviders(<PreparePage />, { initialEntries: ['/prepare'] });
    expect(screen.queryByRole('button', { name: /import/i })).not.toBeInTheDocument();
  });

  it('does NOT render an Export button', () => {
    renderWithProviders(<PreparePage />, { initialEntries: ['/prepare'] });
    expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument();
  });

  it('does NOT render LanguageSelector in page body', () => {
    renderWithProviders(<PreparePage />, { initialEntries: ['/prepare'] });
    expect(screen.queryByRole('button', { name: /all languages/i })).not.toBeInTheDocument();
  });

  it('passes the ?level param to useSearch as the tag filter', async () => {
    renderWithProviders(<PreparePage />, { initialEntries: ['/prepare?level=L1'] });
    await waitFor(() => {
      expect(vi.mocked(questionsApi.search)).toHaveBeenCalledWith(expect.objectContaining({ tag: 'L1' }));
    });
  });

  it('does NOT pass a tag filter when no ?level param is set', async () => {
    renderWithProviders(<PreparePage />, { initialEntries: ['/prepare'] });
    await waitFor(() => {
      expect(vi.mocked(questionsApi.search)).toHaveBeenCalledWith(expect.objectContaining({ tag: undefined }));
    });
  });

  it('result cards do not show the language badge', async () => {
    vi.mocked(questionsApi.search).mockResolvedValue(questionPage);
    renderWithProviders(<PreparePage />, { initialEntries: ['/prepare'] });
    await waitFor(() => {
      expect(screen.getByText('What is polymorphism?')).toBeInTheDocument();
    });
    expect(screen.queryByText('Java')).not.toBeInTheDocument();
  });

  it('result cards link to /prepare/questions/:id (read-only route)', async () => {
    vi.mocked(questionsApi.search).mockResolvedValue(questionPage);
    renderWithProviders(<PreparePage />, { initialEntries: ['/prepare'] });
    await waitFor(() => {
      expect(screen.getByText('What is polymorphism?')).toBeInTheDocument();
    });
    const cardLink = screen.getByRole('link', { name: /What is polymorphism/i });
    expect(cardLink).toHaveAttribute('href', '/prepare/questions/1');
  });

  it('shows category badge on result cards when no category is selected (All)', async () => {
    vi.mocked(questionsApi.search).mockResolvedValue(questionPage);
    // selectedCategoryId is null by default
    renderWithProviders(<PreparePage />, { initialEntries: ['/prepare'] });
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
    renderWithProviders(<PreparePage />, { initialEntries: ['/prepare'] });
    await waitFor(() => {
      expect(screen.getByText('What is polymorphism?')).toBeInTheDocument();
    });
    expect(screen.queryByText('OOP')).not.toBeInTheDocument();
  });
});
