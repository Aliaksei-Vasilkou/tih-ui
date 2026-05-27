import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import InlineNameForm from './InlineNameForm';

function setup(overrides: Partial<React.ComponentProps<typeof InlineNameForm>> = {}) {
  const props = {
    value: '',
    onChange: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
    isPending: false,
    error: '',
    ...overrides,
  };
  renderWithProviders(<InlineNameForm {...props} />);
  return props;
}

describe('InlineNameForm', () => {
  it('should render the input with the provided value', () => {
    setup({ value: 'Java' });
    expect(screen.getByRole('textbox')).toHaveValue('Java');
  });

  it('should render the default placeholder', () => {
    setup();
    expect(screen.getByPlaceholderText('Name…')).toBeInTheDocument();
  });

  it('should render a custom placeholder', () => {
    setup({ placeholder: 'Category name…' });
    expect(screen.getByPlaceholderText('Category name…')).toBeInTheDocument();
  });

  it('should call onChange when the user types', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    setup({ onChange });
    await user.type(screen.getByRole('textbox'), 'J');
    expect(onChange).toHaveBeenCalledWith('J');
  });

  it('should call onSave when the save button is clicked', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    setup({ onSave });
    await user.click(screen.getByTitle('Save'));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('should call onSave when Enter is pressed in the input', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    setup({ onSave });
    await user.type(screen.getByRole('textbox'), '{Enter}');
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('should call onCancel when the cancel button is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    setup({ onCancel });
    await user.click(screen.getByTitle('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('should disable the save button while isPending is true', () => {
    setup({ isPending: true });
    const saveBtn = screen.getByTitle('Save');
    expect(saveBtn).toBeDisabled();
  });

  it('should show a spinner in the save button while isPending', () => {
    setup({ isPending: true });
    const saveBtn = screen.getByTitle('Save');
    expect(saveBtn.querySelector('svg')).toBeInTheDocument();
  });

  it('should display an error message when error prop is set', () => {
    setup({ error: 'Name already exists' });
    expect(screen.getByText('Name already exists')).toBeInTheDocument();
  });

  it('should not display an error message when error is empty', () => {
    setup({ error: '' });
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});
