import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import SearchBox from './SearchBox';

describe('SearchBox', () => {
  it('should render with the provided value', () => {
    renderWithProviders(<SearchBox value="react hooks" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('react hooks');
  });

  it('should render with the default placeholder', () => {
    renderWithProviders(<SearchBox value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search questions…')).toBeInTheDocument();
  });

  it('should render with a custom placeholder', () => {
    renderWithProviders(<SearchBox value="" onChange={vi.fn()} placeholder="Find something…" />);
    expect(screen.getByPlaceholderText('Find something…')).toBeInTheDocument();
  });

  it('should call onChange with the typed value', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<SearchBox value="" onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'c');
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('should not show the clear button when value is empty', () => {
    renderWithProviders(<SearchBox value="" onChange={vi.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should show the clear button when value is non-empty', () => {
    renderWithProviders(<SearchBox value="something" onChange={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call onChange with empty string when clear button is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<SearchBox value="react" onChange={onChange} />);
    await user.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith('');
  });
});
