import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import SearchResults from './SearchResults';
import type { PageResponse, Question } from '@/types';

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 1,
    questionText: 'What is a closure?',
    answerContent: 'A closure...',
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

function makePage(overrides: Partial<PageResponse<Question>> = {}): PageResponse<Question> {
  return {
    content: [makeQuestion()],
    page: 0,
    size: 20,
    totalElements: 1,
    totalPages: 1,
    last: true,
    ...overrides,
  };
}

describe('SearchResults', () => {
  it('should show a loading indicator while isLoading is true', () => {
    renderWithProviders(
      <SearchResults data={undefined} isLoading={true} isError={false} query="" page={0} onPageChange={vi.fn()} />
    );
    // PageLoader renders text "Searching…" when loading
    expect(screen.getByText(/searching/i)).toBeInTheDocument();
  });

  it('should show an error message when isError is true', () => {
    renderWithProviders(
      <SearchResults data={undefined} isLoading={false} isError={true} query="" page={0} onPageChange={vi.fn()} />
    );
    expect(screen.getByText(/failed to load results/i)).toBeInTheDocument();
  });

  it('should show empty state with generic message when no results and no query', () => {
    renderWithProviders(
      <SearchResults
        data={makePage({ content: [], totalElements: 0 })}
        isLoading={false}
        isError={false}
        query=""
        page={0}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText(/no questions found/i)).toBeInTheDocument();
  });

  it('should show empty state with query in message when no results but query provided', () => {
    renderWithProviders(
      <SearchResults
        data={makePage({ content: [], totalElements: 0 })}
        isLoading={false}
        isError={false}
        query="react hooks"
        page={0}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText(/no results for "react hooks"/i)).toBeInTheDocument();
  });

  it('should show empty state when data is undefined', () => {
    renderWithProviders(
      <SearchResults data={undefined} isLoading={false} isError={false} query="" page={0} onPageChange={vi.fn()} />
    );
    expect(screen.getByText(/no questions found/i)).toBeInTheDocument();
  });

  it('should render question cards when results are present', () => {
    const data = makePage({
      content: [
        makeQuestion({ id: 1, questionText: 'What is a closure?' }),
        makeQuestion({ id: 2, questionText: 'Explain hoisting' }),
      ],
      totalElements: 2,
    });
    renderWithProviders(
      <SearchResults data={data} isLoading={false} isError={false} query="" page={0} onPageChange={vi.fn()} />
    );
    expect(screen.getByText('What is a closure?')).toBeInTheDocument();
    expect(screen.getByText('Explain hoisting')).toBeInTheDocument();
  });

  it('should show correct result count (plural)', () => {
    const data = makePage({ totalElements: 5 });
    renderWithProviders(
      <SearchResults data={data} isLoading={false} isError={false} query="" page={0} onPageChange={vi.fn()} />
    );
    expect(screen.getByText(/5 questions found/i)).toBeInTheDocument();
  });

  it('should show correct result count (singular)', () => {
    const data = makePage({ totalElements: 1 });
    renderWithProviders(
      <SearchResults data={data} isLoading={false} isError={false} query="" page={0} onPageChange={vi.fn()} />
    );
    expect(screen.getByText(/1 question found/i)).toBeInTheDocument();
  });

  it('should show query in result count header when query is present', () => {
    const data = makePage({ totalElements: 3 });
    renderWithProviders(
      <SearchResults data={data} isLoading={false} isError={false} query="closure" page={0} onPageChange={vi.fn()} />
    );
    expect(screen.getByText(/3 questions found/i)).toBeInTheDocument();
    expect(screen.getByText(/"closure"/i)).toBeInTheDocument();
  });

  it('should not show pagination when there is only one page', () => {
    const data = makePage({ totalPages: 1 });
    renderWithProviders(
      <SearchResults data={data} isLoading={false} isError={false} query="" page={0} onPageChange={vi.fn()} />
    );
    expect(screen.queryByText(/page \d+ of \d+/i)).not.toBeInTheDocument();
  });

  it('should show pagination when there are multiple pages', () => {
    const data = makePage({ totalPages: 3, last: false });
    renderWithProviders(
      <SearchResults data={data} isLoading={false} isError={false} query="" page={1} onPageChange={vi.fn()} />
    );
    expect(screen.getByText(/page 2 of 3/i)).toBeInTheDocument();
  });

  it('should disable the prev button on the first page', () => {
    const data = makePage({ totalPages: 3, last: false });
    renderWithProviders(
      <SearchResults data={data} isLoading={false} isError={false} query="" page={0} onPageChange={vi.fn()} />
    );
    const buttons = screen.getAllByRole('button');
    // First button = prev
    expect(buttons[0]).toBeDisabled();
  });

  it('should disable the next button on the last page', () => {
    const data = makePage({ totalPages: 3, last: true });
    renderWithProviders(
      <SearchResults data={data} isLoading={false} isError={false} query="" page={2} onPageChange={vi.fn()} />
    );
    const buttons = screen.getAllByRole('button');
    // Second button = next
    expect(buttons[1]).toBeDisabled();
  });

  it('should call onPageChange with previous page when prev button clicked', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    const data = makePage({ totalPages: 3, last: false });
    renderWithProviders(
      <SearchResults data={data} isLoading={false} isError={false} query="" page={2} onPageChange={onPageChange} />
    );
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('should call onPageChange with next page when next button clicked', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    const data = makePage({ totalPages: 3, last: false });
    renderWithProviders(
      <SearchResults data={data} isLoading={false} isError={false} query="" page={0} onPageChange={onPageChange} />
    );
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
