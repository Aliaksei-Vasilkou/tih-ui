import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { questionsApi } from '@/api/questions';
import { renderWithProviders } from '@/test/renderWithProviders';

import BatchUpload from './BatchUpload';

vi.mock('@/api/questions');

afterEach(() => {
  vi.clearAllMocks();
});

describe('BatchUpload', () => {
  it('should commit non-duplicates silently before showing duplicate review', async () => {
    const user = userEvent.setup();
    const file = new File(['[]'], 'questions.json', { type: 'application/json' });

    vi.mocked(questionsApi.batchAnalyse).mockResolvedValue({
      newItems: [
        {
          extId: 'new-1',
          question: 'New question',
          answer: 'Answer',
          language: 'java',
          category: 'Core',
          tags: ['L1'],
        },
      ],
      duplicates: [
        {
          extId: 'dup-1',
          existing: {
            id: 1,
            questionText: 'Old question',
            answerContent: 'Old answer',
            languageId: 1,
            languageName: 'Java',
            languageCode: 'java',
            categoryId: 1,
            categoryName: 'Core',
            tags: ['L1'],
            createdAt: '2026-06-17T12:00:00Z',
            updatedAt: '2026-06-17T12:00:00Z',
            createdBy: 'user@example.com',
          },
          incoming: {
            extId: 'dup-1',
            question: 'Old question',
            answer: 'New answer',
            language: 'java',
            category: 'Core',
            tags: ['L1', 'OOP'],
          },
        },
      ],
    });

    vi.mocked(questionsApi.batchCommit)
      .mockResolvedValueOnce({
        totalItems: 1,
        successCount: 1,
        updatedCount: 0,
        failureCount: 0,
        skippedCount: 0,
        errors: [],
        skipped: [],
      })
      .mockResolvedValueOnce({
        totalItems: 1,
        successCount: 0,
        updatedCount: 1,
        failureCount: 0,
        skippedCount: 0,
        errors: [],
        skipped: [],
      });

    const { container } = renderWithProviders(<BatchUpload />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(questionsApi.batchCommit).toHaveBeenCalledWith({
        newItems: [
          {
            extId: 'new-1',
            question: 'New question',
            answer: 'Answer',
            language: 'java',
            category: 'Core',
            tags: ['L1'],
          },
        ],
        resolutions: [],
      });
    });

    expect(await screen.findByText(/review duplicate/i)).toBeInTheDocument();
  });

  it('should open duplicate review and submit accept decision', async () => {
    const user = userEvent.setup();
    const file = new File(['[]'], 'questions.json', { type: 'application/json' });

    vi.mocked(questionsApi.batchAnalyse).mockResolvedValue({
      newItems: [],
      duplicates: [
        {
          extId: 'dup-1',
          existing: {
            id: 1,
            questionText: 'Old question',
            answerContent: 'Old answer',
            languageId: 1,
            languageName: 'Java',
            languageCode: 'java',
            categoryId: 1,
            categoryName: 'Core',
            tags: ['L1'],
            createdAt: '2026-06-17T12:00:00Z',
            updatedAt: '2026-06-17T12:00:00Z',
            createdBy: 'user@example.com',
          },
          incoming: {
            extId: 'dup-1',
            question: 'Old question',
            answer: 'New answer',
            language: 'java',
            category: 'Core',
            tags: ['L1', 'OOP'],
          },
        },
      ],
    });

    vi.mocked(questionsApi.batchCommit).mockResolvedValue({
      totalItems: 1,
      successCount: 0,
      updatedCount: 1,
      failureCount: 0,
      skippedCount: 0,
      errors: [],
      skipped: [],
    });

    const { container } = renderWithProviders(<BatchUpload />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, file);

    expect(await screen.findByText(/review duplicate/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /accept new version/i }));

    await waitFor(() => {
      expect(questionsApi.batchCommit).toHaveBeenCalledWith({
        newItems: [
          {
            extId: 'dup-1',
            question: 'Old question',
            answer: 'New answer',
            language: 'java',
            category: 'Core',
            tags: ['L1', 'OOP'],
          },
        ],
        resolutions: [{ extId: 'dup-1', action: 'accept' }],
      });
    });
  });

  it('should commit immediately when analyse returns no duplicates', async () => {
    const user = userEvent.setup();
    const file = new File(['[]'], 'questions.json', { type: 'application/json' });

    vi.mocked(questionsApi.batchAnalyse).mockResolvedValue({
      newItems: [
        {
          extId: 'new-1',
          question: 'New question',
          answer: 'Answer',
          language: 'java',
          category: 'Core',
          tags: ['L1'],
        },
      ],
      duplicates: [],
    });

    vi.mocked(questionsApi.batchCommit).mockResolvedValue({
      totalItems: 1,
      successCount: 1,
      updatedCount: 0,
      failureCount: 0,
      skippedCount: 0,
      errors: [],
      skipped: [],
    });

    const { container } = renderWithProviders(<BatchUpload />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(questionsApi.batchCommit).toHaveBeenCalledWith({
        newItems: [
          {
            extId: 'new-1',
            question: 'New question',
            answer: 'Answer',
            language: 'java',
            category: 'Core',
            tags: ['L1'],
          },
        ],
        resolutions: [],
      });
    });

    expect(await screen.findByText(/1 of 1 imported/i)).toBeInTheDocument();
  });
});
