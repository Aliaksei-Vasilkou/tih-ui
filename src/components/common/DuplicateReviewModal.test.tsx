import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/renderWithProviders';
import type { DuplicateConflict } from '@/types';

import DuplicateReviewModal from './DuplicateReviewModal';

const conflict: DuplicateConflict = {
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
};

describe('DuplicateReviewModal', () => {
  it('should render progress and extId', () => {
    renderWithProviders(
      <DuplicateReviewModal
        conflict={conflict}
        currentIndex={2}
        totalConflicts={3}
        isSubmitting={false}
        onAccept={vi.fn()}
        onSkip={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/duplicate 2 of 3/i)).toBeInTheDocument();
    expect(screen.getByText('dup-1')).toBeInTheDocument();
  });

  it('should call action callbacks from footer buttons', async () => {
    const onAccept = vi.fn();
    const onSkip = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <DuplicateReviewModal
        conflict={conflict}
        currentIndex={1}
        totalConflicts={1}
        isSubmitting={false}
        onAccept={onAccept}
        onSkip={onSkip}
        onClose={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /skip/i }));
    await user.click(screen.getByRole('button', { name: /accept new version/i }));

    expect(onSkip).toHaveBeenCalledOnce();
    expect(onAccept).toHaveBeenCalledOnce();
  });
});
