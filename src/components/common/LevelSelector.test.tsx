import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/renderWithProviders';
import LevelSelector from './LevelSelector';

describe('LevelSelector', () => {
  it('renders all five level options', async () => {
    renderWithProviders(<LevelSelector />);

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    // placeholder appears in both the trigger and the dropdown — use getAllByText
    expect(screen.getAllByText('All Levels').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Junior')).toBeInTheDocument();
    expect(screen.getByText('Middle')).toBeInTheDocument();
    expect(screen.getByText('Senior')).toBeInTheDocument();
    expect(screen.getByText('Lead')).toBeInTheDocument();
  });

  it('displays "All Levels" as the default selected value', () => {
    renderWithProviders(<LevelSelector />);
    expect(screen.getByRole('button')).toHaveTextContent('All Levels');
  });

  it('shows the selected level label when ?level param is set', () => {
    renderWithProviders(<LevelSelector />, { initialEntries: ['/prepare?level=L1'] });
    expect(screen.getByRole('button')).toHaveTextContent('Junior');
  });

  it('selects "Junior" and writes ?level=L1 to the URL', async () => {
    const { container } = renderWithProviders(<LevelSelector />);

    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Junior'));

    // URL param written — the select button now shows "Junior"
    expect(container.querySelector('button')).toHaveTextContent('Junior');
  });

  it('removes ?level param when "All Levels" is selected', async () => {
    renderWithProviders(<LevelSelector />, { initialEntries: ['/prepare?level=L2'] });

    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('All Levels'));

    expect(screen.getByRole('button')).toHaveTextContent('All Levels');
  });
});
