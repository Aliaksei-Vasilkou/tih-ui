import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import HackPage from './HackPage';

describe('HackPage', () => {
  it('should render a coming soon message', () => {
    renderWithProviders(<HackPage />);
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it('should display the mode title', () => {
    renderWithProviders(<HackPage />);
    expect(screen.getByRole('heading', { name: /hack/i })).toBeInTheDocument();
  });

  it('should display a description of the planned functionality', () => {
    renderWithProviders(<HackPage />);
    expect(screen.getByText(/coding exercise|live feedback|timed/i)).toBeInTheDocument();
  });

  it('should render a link back to home', () => {
    renderWithProviders(<HackPage />);
    expect(screen.getByRole('link', { name: /back to home|home/i })).toHaveAttribute('href', '/');
  });
});
