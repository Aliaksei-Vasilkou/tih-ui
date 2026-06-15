import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';
import Header from './Header';

describe('Header', () => {
  it('renders the app logo link to /', () => {
    renderWithProviders(<Header />, { initialEntries: ['/'] });
    expect(screen.getByRole('link', { name: /tech interview helper/i })).toHaveAttribute('href', '/');
  });

  it('renders the Manage Questions icon-button on the home screen', () => {
    renderWithProviders(<Header />, { initialEntries: ['/'] });
    expect(screen.getByRole('button', { name: /manage questions/i })).toBeInTheDocument();
  });

  it('does NOT render the Manage Questions button when not on home screen', () => {
    renderWithProviders(<Header />, { initialEntries: ['/prepare'] });
    expect(screen.queryByRole('button', { name: /manage questions/i })).not.toBeInTheDocument();
  });

  it('does NOT render the Manage Questions button on /manage', () => {
    renderWithProviders(<Header />, { initialEntries: ['/manage'] });
    expect(screen.queryByRole('button', { name: /manage questions/i })).not.toBeInTheDocument();
  });

  it('does NOT show a mode indicator on the home page', () => {
    renderWithProviders(<Header />, { initialEntries: ['/'] });
    expect(screen.queryByText('Prepare')).not.toBeInTheDocument();
    expect(screen.queryByText('Practice')).not.toBeInTheDocument();
    expect(screen.queryByText('Hack')).not.toBeInTheDocument();
  });

  it('shows "Prepare" mode indicator on /prepare', () => {
    renderWithProviders(<Header />, { initialEntries: ['/prepare'] });
    expect(screen.getByText('Prepare')).toBeInTheDocument();
  });

  it('shows "Prepare" mode indicator on /prepare/questions/1', () => {
    renderWithProviders(<Header />, { initialEntries: ['/prepare/questions/1'] });
    expect(screen.getByText('Prepare')).toBeInTheDocument();
  });

  it('shows "Practice" mode indicator on /practice', () => {
    renderWithProviders(<Header />, { initialEntries: ['/practice'] });
    expect(screen.getByText('Practice')).toBeInTheDocument();
  });

  it('shows "Hack" mode indicator on /hack', () => {
    renderWithProviders(<Header />, { initialEntries: ['/hack'] });
    expect(screen.getByText('Hack')).toBeInTheDocument();
  });

  it('does NOT show a mode indicator on /manage', () => {
    renderWithProviders(<Header />, { initialEntries: ['/manage'] });
    expect(screen.queryByText('Prepare')).not.toBeInTheDocument();
    expect(screen.queryByText('Practice')).not.toBeInTheDocument();
    expect(screen.queryByText('Hack')).not.toBeInTheDocument();
  });

  it('does NOT render a New Question button', () => {
    renderWithProviders(<Header />, { initialEntries: ['/'] });
    expect(screen.queryByRole('button', { name: /new question/i })).not.toBeInTheDocument();
  });

  it('does NOT render an Import button', () => {
    renderWithProviders(<Header />, { initialEntries: ['/'] });
    expect(screen.queryByRole('button', { name: /import/i })).not.toBeInTheDocument();
  });

  it('does NOT render an Export button', () => {
    renderWithProviders(<Header />, { initialEntries: ['/'] });
    expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument();
  });
});
