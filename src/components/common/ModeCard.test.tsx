import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { BookOpen } from 'lucide-react';

import { renderWithProviders } from '@/test/renderWithProviders';
import type { ModeDefinition } from '@/types';
import ModeCard from './ModeCard';

const activeMode: ModeDefinition = {
  id: 'prepare',
  title: 'Prepare',
  description: 'Browse and search interview questions.',
  icon: BookOpen,
  route: '/prepare',
  status: 'active',
};

const comingSoonMode: ModeDefinition = {
  id: 'practice',
  title: 'Practice',
  description: 'Spaced repetition sessions.',
  icon: BookOpen,
  route: '/practice',
  status: 'coming-soon',
};

describe('ModeCard', () => {
  it('renders the mode title', () => {
    renderWithProviders(<ModeCard mode={activeMode} />);
    expect(screen.getByText('Prepare')).toBeInTheDocument();
  });

  it('renders the mode description', () => {
    renderWithProviders(<ModeCard mode={activeMode} />);
    expect(screen.getByText('Browse and search interview questions.')).toBeInTheDocument();
  });

  it('renders the entire card as a link (no separate CTA button)', () => {
    renderWithProviders(<ModeCard mode={activeMode} />);
    const link = screen.getByRole('link', { name: /prepare mode/i });
    expect(link).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('links to the correct route', () => {
    renderWithProviders(<ModeCard mode={activeMode} />);
    expect(screen.getByRole('link', { name: /prepare mode/i })).toHaveAttribute('href', '/prepare');
  });

  it('does NOT show "Coming soon" badge for active mode', () => {
    renderWithProviders(<ModeCard mode={activeMode} />);
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });

  it('shows "Coming soon" badge for coming-soon mode', () => {
    renderWithProviders(<ModeCard mode={comingSoonMode} />);
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it('still navigates via card link for coming-soon mode', () => {
    renderWithProviders(<ModeCard mode={comingSoonMode} />);
    expect(screen.getByRole('link', { name: /practice mode/i })).toHaveAttribute('href', '/practice');
  });
});
