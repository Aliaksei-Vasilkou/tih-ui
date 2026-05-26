import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRoute } from '@/test/renderWithRoute';
import EditQuestionPage from './EditQuestionPage';

vi.mock('@/api/questions');
vi.mock('@/api/languages');
vi.mock('@/api/categories');
vi.mock('@/api/tags');
vi.mock('@/components/editor/RichTextEditor', () => ({
  default: ({ content, onChange }: { content: string; onChange: (v: string) => void }) => (
    <textarea data-testid="rich-text-editor" value={content} onChange={(e) => onChange(e.target.value)} />
  ),
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useBlocker: vi.fn(() => ({
      state: 'unblocked',
      reset: undefined,
      proceed: undefined,
    })),
  };
});

import { questionsApi } from '@/api/questions';
import { languagesApi } from '@/api/languages';
import { categoriesApi } from '@/api/categories';
import { tagsApi } from '@/api/tags';

function makeQuestion(overrides = {}) {
  return {
    id: 5,
    questionText: 'What is a closure?',
    answerContent: 'A closure is...',
    languageId: 1,
    languageName: 'JavaScript',
    languageCode: 'javascript',
    categoryId: 1,
    categoryName: 'Functions',
    tags: ['L2'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'admin',
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(questionsApi.getById).mockResolvedValue(makeQuestion());
  vi.mocked(languagesApi.getAll).mockResolvedValue([
    {
      id: 1,
      name: 'JavaScript',
      code: 'javascript',
      createdAt: '',
      updatedAt: '',
      createdBy: '',
    },
  ]);
  vi.mocked(categoriesApi.getAll).mockResolvedValue([
    {
      id: 1,
      name: 'Functions',
      languageId: 1,
      languageName: 'JavaScript',
      languageCode: 'javascript',
      createdAt: '',
      updatedAt: '',
      createdBy: '',
    },
  ]);
  vi.mocked(tagsApi.getAll).mockResolvedValue([]);
});

describe('EditQuestionPage', () => {
  it('should show a loading state while fetching the question', () => {
    vi.mocked(questionsApi.getById).mockImplementation(() => new Promise(() => undefined));
    renderWithRoute(<EditQuestionPage />, {
      path: '/questions/:id/edit',
      initialEntry: '/questions/5/edit',
    });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should show an error state when the question cannot be loaded', async () => {
    vi.mocked(questionsApi.getById).mockRejectedValue(new Error('Not found'));
    renderWithRoute(<EditQuestionPage />, {
      path: '/questions/:id/edit',
      initialEntry: '/questions/999/edit',
    });
    await waitFor(() => {
      expect(screen.getByText(/question not found/i)).toBeInTheDocument();
    });
  });

  it('should pre-fill the question text from initialData', async () => {
    renderWithRoute(<EditQuestionPage />, {
      path: '/questions/:id/edit',
      initialEntry: '/questions/5/edit',
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('What is a closure?')).toBeInTheDocument();
    });
  });

  it('should show Edit Question as the form title', async () => {
    renderWithRoute(<EditQuestionPage />, {
      path: '/questions/:id/edit',
      initialEntry: '/questions/5/edit',
    });
    await waitFor(() => {
      expect(screen.getByText('Edit Question')).toBeInTheDocument();
    });
  });

  it('should show "Save Changes" submit button', async () => {
    renderWithRoute(<EditQuestionPage />, {
      path: '/questions/:id/edit',
      initialEntry: '/questions/5/edit',
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });
  });
});
