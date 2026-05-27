import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** 'sm' = compact header/toolbar variant, 'md' = default form variant */
  size?: 'sm' | 'md';
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  className,
  size = 'md',
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleSelect = (optValue: string | number) => {
    onChange(optValue);
    setOpen(false);
  };

  const allOptions: SelectOption[] = [{ value: '', label: placeholder }, ...options];

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          'flex items-center justify-between w-full gap-2 rounded-lg border bg-surface text-left',
          'border-border-strong hover:border-primary-500',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'transition-colors',
          disabled ? 'opacity-60 cursor-not-allowed bg-surface-alt' : 'cursor-pointer',
          size === 'sm' ? 'pl-3 pr-2.5 py-1.5 text-sm' : 'pl-3 pr-2.5 py-2 text-sm',
          selected ? 'text-foreground' : 'text-placeholder'
        )}
      >
        <span className="truncate min-w-0">{selected ? selected.label : placeholder}</span>
        <ChevronDown className={clsx('w-3.5 h-3.5 text-muted transition-transform shrink-0', open && 'rotate-180')} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-lg shadow-theme-md py-1 max-h-60 overflow-y-auto"
        >
          {allOptions.map((option) => {
            const isSelected = option.value === value;
            const isEmpty = option.value === '';
            let optionColorClass: string;
            if (isEmpty) {
              optionColorClass = 'text-placeholder italic';
            } else if (isSelected) {
              optionColorClass = 'text-primary-700 font-medium';
            } else {
              optionColorClass = 'text-foreground-secondary';
            }
            return (
              <li key={isEmpty ? '__placeholder__' : option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={clsx(
                    'flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors',
                    'hover:bg-primary-50',
                    optionColorClass
                  )}
                >
                  <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                    {isSelected && !isEmpty && <Check className="w-3.5 h-3.5 text-primary-600" />}
                  </span>
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
