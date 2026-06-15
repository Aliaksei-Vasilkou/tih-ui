import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import PracticePage from './PracticePage';

describe('PracticePage', () => {
  it('should render a coming soon message', () => {
    renderWithProviders(<PracticePage />);
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it('should display the mode title', () => {
    renderWithProviders(<PracticePage />);
    expect(screen.getByRole('heading', { name: /practice/i })).toBeInTheDocument();
  });

  it('should display a description of the planned functionality', () => {
    renderWithProviders(<PracticePage />);
    expect(screen.getByText(/spaced repetition|q&a session/i)).toBeInTheDocument();
  });

  it('should render a link back to home', () => {
    renderWithProviders(<PracticePage />);
    expect(screen.getByRole('link', { name: /back to home|home/i })).toHaveAttribute('href', '/');
  });
});
