import { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const CODE_LANGUAGES: ReadonlyArray<{ value: string; label: string }> = [
  { value: '', label: 'Plain text' },
  { value: 'bash', label: 'Bash / Shell' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'css', label: 'CSS' },
  { value: 'diff', label: 'Diff' },
  { value: 'go', label: 'Go' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'json', label: 'JSON' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'php', label: 'PHP' },
  { value: 'python', label: 'Python' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'rust', label: 'Rust' },
  { value: 'scss', label: 'SCSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'swift', label: 'Swift' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'xml', label: 'XML / HTML' },
  { value: 'yaml', label: 'YAML' },
];

function useOutsideClose(open: boolean, ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, ref, onClose]);
}

interface LanguageSelectorProps {
  lang: string;
  onChange: (lang: string) => void;
}

function LanguageSelector({ lang, onChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(open, ref, () => setOpen(false));

  const currentLabel = (CODE_LANGUAGES.find((l) => l.value === lang)?.label ?? lang) || 'Plain text';

  return (
    <div ref={ref} className="relative" contentEditable={false}>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className={clsx(
          'flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium transition-colors',
          'bg-code-block-text/10 text-code-block-text/60 hover:bg-code-block-text/20 hover:text-code-block-text',
          open && 'bg-code-block-text/20 text-code-block-text'
        )}
        title="Change syntax highlighting language"
      >
        <span>{currentLabel}</span>
        <ChevronDown size={11} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border rounded-lg shadow-theme-md py-1 w-44 max-h-64 overflow-y-auto">
          {CODE_LANGUAGES.map((l) => (
            <button
              key={l.value}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(l.value);
                setOpen(false);
              }}
              className={clsx(
                'w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-surface-alt',
                lang === l.value ? 'text-primary-600 font-medium' : 'text-foreground'
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CodeBlockNodeView({ node, updateAttributes }: NodeViewProps) {
  const lang: string = (node.attrs as { language: string | null }).language ?? '';

  return (
    <NodeViewWrapper className="code-block-node-view">
      <div className="relative">
        <div className="absolute top-2 right-2 z-10" contentEditable={false}>
          <LanguageSelector
            lang={lang}
            onChange={(value) => updateAttributes({ language: value === '' ? null : value })}
          />
        </div>
        <pre>
          <NodeViewContent as="code" />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}
