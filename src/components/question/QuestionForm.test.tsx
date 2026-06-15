import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/renderWithProviders';

import QuestionForm from './QuestionForm';

vi.mock('@/api/questions');
vi.mock('@/api/languages');
vi.mock('@/api/categories');
vi.mock('@/api/tags');
vi.mock('@/components/editor/RichTextEditor', () => ({
  default: ({ content, onChange }: { content: string; onChange: (v: string) => void }) => (
    <textarea data-testid="rich-text-editor" value={content} onChange={(e) => onChange(e.target.value)} />
  ),
}));
// useBlocker requires a data router (createBrowserRouter), not MemoryRouter — mock it away
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

const mockLanguages = [
  {
    id: 1,
    name: 'JavaScript',
    code: 'javascript',
    createdAt: '',
    updatedAt: '',
    createdBy: '',
  },
  {
    id: 2,
    name: 'Java',
    code: 'java',
    createdAt: '',
    updatedAt: '',
    createdBy: '',
  },
];
const mockCategories = [
  {
    id: 10,
    name: 'Functions',
    languageId: 1,
    languageName: 'JavaScript',
    languageCode: 'javascript',
    createdAt: '',
    updatedAt: '',
    createdBy: '',
  },
];

beforeEach(() => {
  vi.mocked(languagesApi.getAll).mockResolvedValue(mockLanguages);
  vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
  vi.mocked(tagsApi.getAll).mockResolvedValue([]);
  vi.mocked(questionsApi.create).mockResolvedValue({
    id: 99,
    questionText: 'What is a closure?',
    answerContent: '',
    languageId: 1,
    languageName: 'JavaScript',
    languageCode: 'javascript',
    categoryId: 10,
    categoryName: 'Functions',
    tags: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin',
  });
});

// Helper: opens the language dropdown and selects an option
async function selectDropdownOption(
  user: ReturnType<typeof userEvent.setup>,
  triggerText: string | RegExp,
  optionText: string
) {
  await user.click(screen.getByRole('button', { name: triggerText }));
  await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());
  await user.click(screen.getByRole('button', { name: optionText }));
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
}

describe('QuestionForm', () => {
  describe('validation', () => {
    it('should show an error when question text is empty on submit', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuestionForm title="New Question" />, {
        initialEntries: ['/questions/new'],
      });

      await user.click(screen.getByRole('button', { name: /create question/i }));

      await waitFor(() => {
        expect(screen.getByText(/question text is required/i)).toBeInTheDocument();
      });
    });

    it('should show an error when no language is selected on submit', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuestionForm title="New Question" />, {
        initialEntries: ['/questions/new'],
      });

      await user.type(screen.getByPlaceholderText(/enter the interview question/i), 'What is X?');
      await user.click(screen.getByRole('button', { name: /create question/i }));

      await waitFor(() => {
        expect(screen.getByText(/please select a language/i)).toBeInTheDocument();
      });
    });

    it('should show an error when no category is selected on submit', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuestionForm title="New Question" />, {
        initialEntries: ['/questions/new'],
      });

      await user.type(screen.getByPlaceholderText(/enter the interview question/i), 'What is X?');

      // Select a language
      await waitFor(() =>
        expect(screen.getAllByRole('button', { name: /select language/i }).length).toBeGreaterThan(0)
      );
      await selectDropdownOption(user, /select language/i, 'JavaScript');

      // Submit without category
      await user.click(screen.getByRole('button', { name: /create question/i }));

      await waitFor(() => {
        expect(screen.getByText(/please select a category/i)).toBeInTheDocument();
      });
    });

    it('should clear validation errors when fields are properly filled', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuestionForm title="New Question" />, {
        initialEntries: ['/questions/new'],
      });

      // Submit empty form to show errors
      await user.click(screen.getByRole('button', { name: /create question/i }));
      await waitFor(() => expect(screen.getByText(/question text is required/i)).toBeInTheDocument());

      // Fill the question
      await user.type(screen.getByPlaceholderText(/enter the interview question/i), 'What is X?');
      // Select language
      await waitFor(() =>
        expect(screen.getAllByRole('button', { name: /select language/i }).length).toBeGreaterThan(0)
      );
      await selectDropdownOption(user, /select language/i, 'JavaScript');
      // Select category
      await waitFor(() =>
        expect(screen.getAllByRole('button', { name: /select category/i }).length).toBeGreaterThan(0)
      );
      await selectDropdownOption(user, /select category/i, 'Functions');

      await user.click(screen.getByRole('button', { name: /create question/i }));

      await waitFor(() => {
        expect(screen.queryByText(/question text is required/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/please select a language/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/please select a category/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('render', () => {
    it('should render Create Question title when provided', () => {
      renderWithProviders(<QuestionForm title="New Question" />, {
        initialEntries: ['/questions/new'],
      });
      expect(screen.getByText('New Question')).toBeInTheDocument();
    });

    it('should render "Create Question" submit button for new form', () => {
      renderWithProviders(<QuestionForm />, {
        initialEntries: ['/questions/new'],
      });
      expect(screen.getByRole('button', { name: /create question/i })).toBeInTheDocument();
    });

    it('should render "Save Changes" submit button when editing', () => {
      const initialData = {
        id: 5,
        questionText: 'Existing question',
        answerContent: 'Answer',
        languageId: 1,
        languageName: 'JavaScript',
        languageCode: 'javascript',
        categoryId: 10,
        categoryName: 'Functions',
        tags: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'admin',
      };
      renderWithProviders(<QuestionForm initialData={initialData} title="Edit Question" />, {
        initialEntries: ['/questions/5/edit'],
      });
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });

    it('should pre-fill question text when initialData is provided', () => {
      const initialData = {
        id: 5,
        questionText: 'Pre-filled question',
        answerContent: '',
        languageId: 1,
        languageName: 'JavaScript',
        languageCode: 'javascript',
        categoryId: 10,
        categoryName: 'Functions',
        tags: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'admin',
      };
      renderWithProviders(<QuestionForm initialData={initialData} />, {
        initialEntries: ['/questions/5/edit'],
      });
      expect(screen.getByDisplayValue('Pre-filled question')).toBeInTheDocument();
    });

    it('should show "Unsaved" indicator after modifying a field', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuestionForm title="New Question" />, {
        initialEntries: ['/questions/new'],
      });

      await user.type(screen.getByPlaceholderText(/enter the interview question/i), 'A');
      expect(screen.getByText(/unsaved/i)).toBeInTheDocument();
    });

    it('should order available tags with level tags first and all others alphabetically in the picker', async () => {
      const user = userEvent.setup();
      vi.mocked(tagsApi.getAll).mockResolvedValue([
        { id: 2, name: 'beginner', languageId: 1, languageName: 'JavaScript', languageCode: 'javascript' },
        { id: 4, name: 'algorithms', languageId: 1, languageName: 'JavaScript', languageCode: 'javascript' },
        { id: 3, name: 'L3', languageId: 1, languageName: 'JavaScript', languageCode: 'javascript' },
        { id: 1, name: 'L1', languageId: 1, languageName: 'JavaScript', languageCode: 'javascript' },
      ]);

      renderWithProviders(
        <QuestionForm
          initialData={{
            id: 5,
            questionText: 'Existing question',
            answerContent: 'Answer',
            languageId: 1,
            languageName: 'JavaScript',
            languageCode: 'javascript',
            categoryId: 10,
            categoryName: 'Functions',
            tags: ['L1'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            createdBy: 'admin',
          }}
          title="Edit Question"
        />,
        {
          initialEntries: ['/questions/5/edit'],
        }
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing question')).toBeInTheDocument();
      });

      await user.click(screen.getByTitle(/manage tags/i));

      await waitFor(() => {
        const tagTexts = Array.from(document.querySelectorAll('.tag-selected, .tag-interactive')).map((element) =>
          element.textContent?.trim()
        );

        expect(tagTexts).toEqual(['L1', 'L3', 'algorithms', 'beginner']);
      });
    });
  });

  describe('submission', () => {
    it('should call questionsApi.create with correct data on valid submission', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuestionForm title="New Question" />, {
        initialEntries: ['/questions/new'],
      });

      await user.type(screen.getByPlaceholderText(/enter the interview question/i), 'What is a closure?');

      await waitFor(() =>
        expect(screen.getAllByRole('button', { name: /select language/i }).length).toBeGreaterThan(0)
      );
      await selectDropdownOption(user, /select language/i, 'JavaScript');

      await waitFor(() =>
        expect(screen.getAllByRole('button', { name: /select category/i }).length).toBeGreaterThan(0)
      );
      await selectDropdownOption(user, /select category/i, 'Functions');

      await user.click(screen.getByRole('button', { name: /create question/i }));

      await waitFor(() => {
        expect(questionsApi.create).toHaveBeenCalledWith(
          expect.objectContaining({
            questionText: 'What is a closure?',
            languageId: 1,
            categoryId: 10,
          })
        );
      });
    });
  });
});
