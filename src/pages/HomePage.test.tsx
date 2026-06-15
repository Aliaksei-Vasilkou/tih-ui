import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';
import HomePage from './HomePage';

describe('HomePage', () => {
  it('renders all three mode cards', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Prepare')).toBeInTheDocument();
    expect(screen.getByText('Practice')).toBeInTheDocument();
    expect(screen.getByText('Hack')).toBeInTheDocument();
  });

  it('renders a heading for the home hub', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('does NOT render the old ambiguous subtitle', () => {
    renderWithProviders(<HomePage />);
    expect(screen.queryByText(/select how you want to use/i)).not.toBeInTheDocument();
  });

  it('renders each mode as a card-link (no separate CTA buttons)', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByRole('link', { name: /prepare mode/i })).toHaveAttribute('href', '/prepare');
    expect(screen.getByRole('link', { name: /practice mode/i })).toHaveAttribute('href', '/practice');
    expect(screen.getByRole('link', { name: /hack mode/i })).toHaveAttribute('href', '/hack');
  });

  it('does NOT render standalone CTA buttons (no Enter link)', () => {
    renderWithProviders(<HomePage />);
    expect(screen.queryByRole('link', { name: /enter/i })).not.toBeInTheDocument();
  });

  it('shows "Coming soon" badges for Practice and Hack modes', () => {
    renderWithProviders(<HomePage />);
    const comingSoonBadges = screen.getAllByText(/coming soon/i);
    expect(comingSoonBadges).toHaveLength(2);
  });

  it('all card links are focusable', () => {
    renderWithProviders(<HomePage />);
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).not.toHaveAttribute('tabindex', '-1');
    });
  });
});
