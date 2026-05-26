import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import QuestionCard from './QuestionCard';
import type { Question } from '@/types';

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 42,
    questionText: 'What is polymorphism?',
    answerContent: 'Polymorphism allows...',
    languageId: 1,
    languageName: 'Java',
    languageCode: 'java',
    categoryId: 1,
    categoryName: 'OOP',
    tags: ['L2', 'OOP'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'admin',
    ...overrides,
  };
}

describe('QuestionCard', () => {
  it('should render the question text', () => {
    renderWithProviders(<QuestionCard question={makeQuestion()} />);
    expect(screen.getByText('What is polymorphism?')).toBeInTheDocument();
  });

  it('should render a link pointing to the question detail page', () => {
    renderWithProviders(<QuestionCard question={makeQuestion({ id: 42 })} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/questions/42');
  });

  it('should display the language badge', () => {
    renderWithProviders(<QuestionCard question={makeQuestion({ languageName: 'Java' })} />);
    expect(screen.getByText('Java')).toBeInTheDocument();
  });

  it('should display the category badge', () => {
    renderWithProviders(<QuestionCard question={makeQuestion({ categoryName: 'MyCategory' })} />);
    expect(screen.getByText('MyCategory')).toBeInTheDocument();
  });

  it('should display all tags', () => {
    renderWithProviders(<QuestionCard question={makeQuestion({ tags: ['L2', 'Basics', 'Beginner'] })} />);
    expect(screen.getByText('L2')).toBeInTheDocument();
    expect(screen.getByText('Basics')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  it('should render correctly with an empty tags array', () => {
    renderWithProviders(<QuestionCard question={makeQuestion({ tags: [] })} />);
    // No errors thrown, question text still visible
    expect(screen.getByText('What is polymorphism?')).toBeInTheDocument();
  });

  it('should highlight matching query text inside the question', () => {
    renderWithProviders(<QuestionCard question={makeQuestion()} query="polymorphism" />);
    expect(screen.getByText('polymorphism').tagName).toBe('MARK');
  });

  it('should not highlight anything when query is empty', () => {
    renderWithProviders(<QuestionCard question={makeQuestion()} query="" />);
    expect(document.querySelectorAll('mark')).toHaveLength(0);
  });

  it('should use the default language color for unknown language codes', () => {
    // Should render without error for unknown language code
    renderWithProviders(<QuestionCard question={makeQuestion({ languageCode: 'unknown_lang_xyz' })} />);
    expect(screen.getByText('Java')).toBeInTheDocument();
  });
});
