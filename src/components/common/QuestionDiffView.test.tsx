import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';
import type { DuplicateConflict } from '@/types';

import QuestionDiffView from './QuestionDiffView';

const baseConflict: DuplicateConflict = {
  extId: 'dup-1',
  existing: {
    id: 1,
    questionText: 'What is polymorphism?',
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
    question: 'What is polymorphism?',
    answer: 'Improved answer',
    language: 'java',
    category: 'Core',
    tags: ['L1', 'OOP'],
  },
};

describe('QuestionDiffView', () => {
  it('should render markdown content for question and answer fields', () => {
    renderWithProviders(<QuestionDiffView conflict={baseConflict} />);

    // Question text should be rendered in markdown (may appear twice for existing/incoming)
    expect(screen.getAllByText('What is polymorphism?').length).toBeGreaterThan(0);
    
    // Answer text is split with mark tags, so check using flexible matcher
    const answerElements = screen.queryAllByText((_content, element) => {
      return element ? element.textContent?.includes('Old answer') ?? false : false;
    });
    expect(answerElements.length).toBeGreaterThan(0);

    const incomingAnswerElements = screen.queryAllByText((_content, element) => {
      return element ? element.textContent?.includes('Improved answer') ?? false : false;
    });
    expect(incomingAnswerElements.length).toBeGreaterThan(0);
  });

  it('should highlight changed words in plain text fields', () => {
    renderWithProviders(<QuestionDiffView conflict={baseConflict} />);

    // Tags should be rendered with changed parts highlighted as one contiguous block
    expect(screen.getByText('L1')).toBeInTheDocument();
    expect(
      screen.getAllByText((_content, element) => {
        return element ? element.textContent?.includes('L1, OOP') ?? false : false;
      }).length
    ).toBeGreaterThan(0);
  });

  it('should show skip recommendation when no differences are found', () => {
    const identicalConflict: DuplicateConflict = {
      ...baseConflict,
      incoming: {
        extId: 'dup-1',
        question: baseConflict.existing.questionText,
        answer: baseConflict.existing.answerContent,
        language: baseConflict.existing.languageCode,
        category: baseConflict.existing.categoryName,
        tags: [...baseConflict.existing.tags],
      },
    };

    renderWithProviders(<QuestionDiffView conflict={identicalConflict} />);

    expect(screen.getByText(/skipping is recommended/i)).toBeInTheDocument();
  });
});
