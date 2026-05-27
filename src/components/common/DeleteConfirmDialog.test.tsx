import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import DeleteConfirmDialog from './DeleteConfirmDialog';

describe('DeleteConfirmDialog', () => {
  it('should render the itemLabel in the confirmation message', () => {
    renderWithProviders(
      <DeleteConfirmDialog itemLabel="this question" isDeleting={false} onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText(/this question/)).toBeInTheDocument();
  });

  it('should render the default itemLabel when not provided', () => {
    renderWithProviders(<DeleteConfirmDialog isDeleting={false} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText(/this item/)).toBeInTheDocument();
  });

  it('should call onConfirm when the Delete button is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<DeleteConfirmDialog isDeleting={false} onConfirm={onConfirm} onCancel={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('should call onCancel when the Cancel button is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<DeleteConfirmDialog isDeleting={false} onConfirm={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('should disable both buttons while isDeleting is true', () => {
    renderWithProviders(<DeleteConfirmDialog isDeleting={true} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('should show a spinner inside the Delete button while isDeleting', () => {
    renderWithProviders(<DeleteConfirmDialog isDeleting={true} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    // Loader2 renders an svg inside the delete button
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    expect(deleteBtn.querySelector('svg')).toBeInTheDocument();
  });

  it('should not show spinner when not deleting', () => {
    renderWithProviders(<DeleteConfirmDialog isDeleting={false} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    // no animated SVG when not deleting
    expect(deleteBtn.querySelector('.animate-spin')).toBeNull();
  });
});
