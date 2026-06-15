import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import { renderWithRoute } from '@/test/renderWithRoute';
import PrepareQuestionDetailPage from './PrepareQuestionDetailPage';

vi.mock('@/api/questions');
vi.mock('@/components/common/MarkdownViewer', () => ({
  default: ({ content }: { content: string }) => <div data-testid="markdown-viewer">{content}</div>,
}));

import { questionsApi } from '@/api/questions';

function makeQuestion(overrides = {}) {
  return {
    id: 1,
    questionText: 'What is a closure?',
    answerContent: 'A closure is...',
    languageId: 1,
    languageName: 'JavaScript',
    languageCode: 'javascript',
    categoryId: 1,
    categoryName: 'Functions',
    tags: ['L2', 'advanced'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'admin',
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(questionsApi.getById).mockResolvedValue(makeQuestion());
});

describe('PrepareQuestionDetailPage', () => {
  it('shows PageLoader while loading', () => {
    vi.mocked(questionsApi.getById).mockImplementation(() => new Promise(() => undefined));
    renderWithRoute(<PrepareQuestionDetailPage />, {
      path: '/prepare/questions/:id',
      initialEntry: '/prepare/questions/1',
    });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows PageError when the query fails', async () => {
    vi.mocked(questionsApi.getById).mockRejectedValue(new Error('Not found'));
    renderWithRoute(<PrepareQuestionDetailPage />, {
      path: '/prepare/questions/:id',
      initialEntry: '/prepare/questions/99',
    });
    await waitFor(() => {
      expect(screen.getByText(/question not found/i)).toBeInTheDocument();
    });
  });

  it('displays the question text after loading', async () => {
    renderWithRoute(<PrepareQuestionDetailPage />, {
      path: '/prepare/questions/:id',
      initialEntry: '/prepare/questions/1',
    });
    await waitFor(() => {
      expect(screen.getByText('What is a closure?')).toBeInTheDocument();
    });
  });

  it('displays the language name badge on the answer card', async () => {
    renderWithRoute(<PrepareQuestionDetailPage />, {
      path: '/prepare/questions/:id',
      initialEntry: '/prepare/questions/1',
    });
    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });
  });

  it('displays the category name badge', async () => {
    renderWithRoute(<PrepareQuestionDetailPage />, {
      path: '/prepare/questions/:id',
      initialEntry: '/prepare/questions/1',
    });
    await waitFor(() => {
      expect(screen.getByText('Functions')).toBeInTheDocument();
    });
  });

  it('displays full tag list including non-level tags', async () => {
    renderWithRoute(<PrepareQuestionDetailPage />, {
      path: '/prepare/questions/:id',
      initialEntry: '/prepare/questions/1',
    });
    await waitFor(() => {
      expect(screen.getByText('L2')).toBeInTheDocument();
      expect(screen.getByText('advanced')).toBeInTheDocument();
    });
  });

  it('does NOT render an Edit button', async () => {
    renderWithRoute(<PrepareQuestionDetailPage />, {
      path: '/prepare/questions/:id',
      initialEntry: '/prepare/questions/1',
    });
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /edit/i })).not.toBeInTheDocument();
    });
  });

  it('does NOT render a Delete button', async () => {
    renderWithRoute(<PrepareQuestionDetailPage />, {
      path: '/prepare/questions/:id',
      initialEntry: '/prepare/questions/1',
    });
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });
  });

  it('renders a back navigation button', async () => {
    renderWithRoute(<PrepareQuestionDetailPage />, {
      path: '/prepare/questions/:id',
      initialEntry: '/prepare/questions/1',
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });
});
