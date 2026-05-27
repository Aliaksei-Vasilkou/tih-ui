import { Search, X } from 'lucide-react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBox({ value, onChange, placeholder = 'Search questions…' }: SearchBoxProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-placeholder pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 rounded-xl border border-border-strong bg-surface text-foreground
                   placeholder-placeholder text-base shadow-theme-sm
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-border-focus
                   transition-shadow"
        autoComplete="off"
        autoFocus
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-placeholder hover:text-muted"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
