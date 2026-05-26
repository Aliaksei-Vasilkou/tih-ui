import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRoute } from '@/test/renderWithRoute';
import QuestionDetailPage from './QuestionDetailPage';

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
  vi.mocked(questionsApi.delete).mockResolvedValue(undefined as never);
});

describe('QuestionDetailPage', () => {
  it('should show PageLoader while the question is loading', () => {
    // delay the resolution so loading state is captured
    vi.mocked(questionsApi.getById).mockImplementation(() => new Promise(() => undefined));
    renderWithRoute(<QuestionDetailPage />, {
      path: '/questions/:id',
      initialEntry: '/questions/1',
    });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should show PageError when the query fails', async () => {
    vi.mocked(questionsApi.getById).mockRejectedValue(new Error('Not found'));
    renderWithRoute(<QuestionDetailPage />, {
      path: '/questions/:id',
      initialEntry: '/questions/99',
    });
    await waitFor(() => {
      expect(screen.getByText(/question not found/i)).toBeInTheDocument();
    });
  });

  it('should display the question text after loading', async () => {
    renderWithRoute(<QuestionDetailPage />, {
      path: '/questions/:id',
      initialEntry: '/questions/1',
    });
    await waitFor(() => {
      expect(screen.getByText('What is a closure?')).toBeInTheDocument();
    });
  });

  it('should display the language name badge', async () => {
    renderWithRoute(<QuestionDetailPage />, {
      path: '/questions/:id',
      initialEntry: '/questions/1',
    });
    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });
  });

  it('should display the category name badge', async () => {
    renderWithRoute(<QuestionDetailPage />, {
      path: '/questions/:id',
      initialEntry: '/questions/1',
    });
    await waitFor(() => {
      expect(screen.getByText('Functions')).toBeInTheDocument();
    });
  });

  it('should display the createdBy author', async () => {
    renderWithRoute(<QuestionDetailPage />, {
      path: '/questions/:id',
      initialEntry: '/questions/1',
    });
    await waitFor(() => {
      expect(screen.getByText(/admin/i)).toBeInTheDocument();
    });
  });

  it('should sort level tags (L1-L4) before other tags', async () => {
    vi.mocked(questionsApi.getById).mockResolvedValue(makeQuestion({ tags: ['beginner', 'L2', 'OOP', 'L1'] }));
    renderWithRoute(<QuestionDetailPage />, {
      path: '/questions/:id',
      initialEntry: '/questions/1',
    });
    await waitFor(() => {
      const tagEls = document.querySelectorAll('.tag');
      const tagTexts = Array.from(tagEls).map((el) => el.textContent);
      const l1Index = tagTexts.indexOf('L1');
      const l2Index = tagTexts.indexOf('L2');
      const oopIndex = tagTexts.indexOf('OOP');
      const beginnerIndex = tagTexts.indexOf('beginner');
      expect(l1Index).toBeLessThan(oopIndex);
      expect(l2Index).toBeLessThan(beginnerIndex);
    });
  });

  it('should show "No answer added yet." when answerContent is empty', async () => {
    vi.mocked(questionsApi.getById).mockResolvedValue(makeQuestion({ answerContent: '' }));
    renderWithRoute(<QuestionDetailPage />, {
      path: '/questions/:id',
      initialEntry: '/questions/1',
    });
    await waitFor(() => {
      expect(screen.getByText(/no answer added yet/i)).toBeInTheDocument();
    });
  });

  it('should open the delete dialog when the Delete button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRoute(<QuestionDetailPage />, {
      path: '/questions/:id',
      initialEntry: '/questions/1',
    });
    await waitFor(() => expect(screen.getByText('What is a closure?')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('should close the delete dialog when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithRoute(<QuestionDetailPage />, {
      path: '/questions/:id',
      initialEntry: '/questions/1',
    });
    await waitFor(() => expect(screen.getByText('What is a closure?')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    // Click cancel inside the dialog
    const cancelBtn = screen.getAllByRole('button', { name: /cancel/i })[0];
    await user.click(cancelBtn);
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
  });

  it('should call questionsApi.delete when confirm is clicked in the dialog', async () => {
    const user = userEvent.setup();
    renderWithRoute(<QuestionDetailPage />, {
      path: '/questions/:id',
      initialEntry: '/questions/1',
    });
    await waitFor(() => expect(screen.getByText('What is a closure?')).toBeInTheDocument());

    // Click the page-level Delete button to open the dialog
    const pageDeleteBtn = screen.getByRole('button', { name: /delete/i });
    await user.click(pageDeleteBtn);
    await waitFor(() => expect(screen.getByText(/are you sure/i)).toBeInTheDocument());

    // Now there are two Delete buttons - find the one inside the dialog (the second one)
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    const dialogDeleteBtn = deleteButtons[1]; // Second Delete button is in the dialog
    await user.click(dialogDeleteBtn);

    await waitFor(() => expect(questionsApi.delete).toHaveBeenCalledWith(1));
  });
});
