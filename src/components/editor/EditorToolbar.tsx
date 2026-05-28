import { useState, useRef, useEffect, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import clsx from 'clsx';
import {
  ChevronDown,
  Highlighter,
  Baseline,
  List,
  ListOrdered,
  Table,
  Link,
  Braces,
  CodeXml,
  Quote,
  ChartArea,
} from 'lucide-react';
import { HIGHLIGHT_COLORS, TEXT_COLORS } from '@/constants/editorPalette';

// ─── Shared sub-components ───────────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={clsx(
        'px-2 py-1 rounded text-sm font-medium transition-colors',
        active
          ? 'bg-toolbar-active-bg text-toolbar-active-text'
          : 'text-muted hover:bg-surface-alt hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-border-strong mx-1" />;
}

/** Closes a dropdown on outside mousedown. */
function useOutsideClose(open: boolean, ref: React.RefObject<HTMLElement>, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, ref, onClose]);
}

// ─── HeadingStyleDropdown ────────────────────────────────────────────────────

interface HeadingStyleDropdownProps {
  editor: Editor;
}

function HeadingStyleDropdown({ editor }: HeadingStyleDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(open, ref, () => setOpen(false));

  let currentStyle = 'Normal';
  if (editor.isActive('heading', { level: 1 })) currentStyle = 'Heading 1';
  else if (editor.isActive('heading', { level: 2 })) currentStyle = 'Heading 2';
  else if (editor.isActive('heading', { level: 3 })) currentStyle = 'Heading 3';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        title="Heading style"
        className={clsx(
          'px-2 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1',
          open
            ? 'bg-toolbar-active-bg text-toolbar-active-text'
            : 'text-muted hover:bg-surface-alt hover:text-foreground'
        )}
      >
        {currentStyle}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-surface border border-border rounded-lg shadow-theme-md py-1 w-40">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().setParagraph().run();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface-alt transition-colors text-foreground"
          >
            Normal
          </button>
          {([1, 2, 3] as const).map((level) => (
            <button
              key={level}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level }).run();
                setOpen(false);
              }}
              className={clsx(
                'w-full text-left px-3 py-1.5 hover:bg-surface-alt transition-colors text-foreground font-bold',
                level === 1 && 'text-xl',
                level === 2 && 'text-lg',
                level === 3 && 'text-base'
              )}
            >
              Heading {level}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── HighlightDropdown ───────────────────────────────────────────────────────

interface HighlightDropdownProps {
  editor: Editor;
}

function HighlightDropdown({ editor }: HighlightDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(open, ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        title="Highlight colour"
        className={clsx(
          'px-2 py-1 rounded text-sm font-medium transition-colors flex items-center',
          open
            ? 'bg-toolbar-active-bg text-toolbar-active-text'
            : 'text-muted hover:bg-surface-alt hover:text-foreground'
        )}
      >
        <Highlighter size={18} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-surface border border-border rounded-lg shadow-theme-md p-2">
          <div className="flex gap-1">
            <button
              type="button"
              title="Remove highlight"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().unsetHighlight().run();
                setOpen(false);
              }}
              className="w-6 h-6 rounded border-2 border-border-strong bg-surface flex items-center justify-center text-muted text-xs hover:border-foreground transition-colors"
            >
              ✕
            </button>
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                title={`Highlight: ${color.label}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleHighlight({ color: color.value }).run();
                  setOpen(false);
                }}
                className={clsx(
                  'w-6 h-6 rounded border-2 transition-transform hover:scale-110',
                  editor.isActive('highlight', { color: color.value })
                    ? 'border-foreground scale-110'
                    : 'border-border-strong'
                )}
                style={{ backgroundColor: color.value }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ColorDropdown ───────────────────────────────────────────────────────────

interface ColorDropdownProps {
  editor: Editor;
}

function ColorDropdown({ editor }: ColorDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(open, ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        title="Text colour"
        className={clsx(
          'px-2 py-1 rounded text-sm font-medium transition-colors flex items-center',
          open
            ? 'bg-toolbar-active-bg text-toolbar-active-text'
            : 'text-muted hover:bg-surface-alt hover:text-foreground'
        )}
      >
        <Baseline size={18} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-surface border border-border rounded-lg shadow-theme-md p-2">
          <div className="flex gap-1">
            {TEXT_COLORS.map((c) => {
              if (c.value === null) {
                return (
                  <button
                    key="reset"
                    type="button"
                    title="Remove colour"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().unsetColor().run();
                      setOpen(false);
                    }}
                    className="w-6 h-6 rounded border-2 border-border-strong bg-surface flex items-center justify-center text-muted text-xs hover:border-foreground transition-colors"
                  >
                    ✕
                  </button>
                );
              }
              const hexColor = c.value; // narrowed: string (not null)
              return (
                <button
                  key={hexColor}
                  type="button"
                  title={`Text: ${c.label}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().setColor(hexColor).run();
                    setOpen(false);
                  }}
                  className={clsx(
                    'w-6 h-6 rounded border-2 transition-transform hover:scale-110',
                    editor.isActive('textStyle', { color: hexColor })
                      ? 'border-foreground scale-110'
                      : 'border-border-strong'
                  )}
                  style={{ backgroundColor: hexColor }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ListsDropdown ───────────────────────────────────────────────────────────

interface ListsDropdownProps {
  editor: Editor;
}

function ListsDropdown({ editor }: ListsDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(open, ref, () => setOpen(false));

  const isListActive = editor.isActive('bulletList') || editor.isActive('orderedList');

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        title="Lists"
        className={clsx(
          'px-2 py-1 rounded text-sm font-medium transition-colors flex items-center',
          open || isListActive
            ? 'bg-toolbar-active-bg text-toolbar-active-text'
            : 'text-muted hover:bg-surface-alt hover:text-foreground'
        )}
      >
        <List size={18} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-surface border border-border rounded-lg shadow-theme-md py-1 w-44">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBulletList().run();
              setOpen(false);
            }}
            className={clsx(
              'w-full text-left px-3 py-2 flex items-center gap-2 text-sm hover:bg-surface-alt transition-colors',
              editor.isActive('bulletList') ? 'text-toolbar-active-text' : 'text-foreground'
            )}
          >
            <List size={18} />
            Bullet list
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleOrderedList().run();
              setOpen(false);
            }}
            className={clsx(
              'w-full text-left px-3 py-2 flex items-center gap-2 text-sm hover:bg-surface-alt transition-colors',
              editor.isActive('orderedList') ? 'text-toolbar-active-text' : 'text-foreground'
            )}
          >
            <ListOrdered size={18} />
            Numbered list
          </button>
        </div>
      )}
    </div>
  );
}

// ─── LinkPopover ─────────────────────────────────────────────────────────────

interface LinkPopoverProps {
  editor: Editor;
}

/** Ensures a user-typed URL has an absolute protocol so it is never treated as a relative path. */
function ensureAbsoluteUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function LinkPopover({ editor }: LinkPopoverProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isActive = editor.isActive('link');

  const closePopover = useCallback(() => setOpen(false), []);
  useOutsideClose(open, ref, closePopover);

  const openPopover = () => {
    const currentHref = editor.getAttributes('link').href as string | undefined;
    setUrl(currentHref ?? '');
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const apply = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    editor
      .chain()
      .focus()
      .setLink({ href: ensureAbsoluteUrl(trimmed) })
      .run();
    setOpen(false);
  };

  const remove = () => {
    editor.chain().focus().unsetLink().run();
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          openPopover();
        }}
        title="Insert / edit link"
        className={clsx(
          'px-2 py-1 rounded text-sm font-medium transition-colors flex items-center',
          isActive || open
            ? 'bg-toolbar-active-bg text-toolbar-active-text'
            : 'text-muted hover:bg-surface-alt hover:text-foreground'
        )}
      >
        <Link size={18} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-surface border border-border rounded-lg shadow-theme-md p-3 w-72">
          <div className="text-xs font-medium text-muted mb-1.5">URL</div>
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                apply();
              }
              if (e.key === 'Escape') setOpen(false);
            }}
            placeholder="https://..."
            className="w-full px-2 py-1.5 text-sm border border-border rounded bg-surface-alt text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-border-focus focus:border-border-focus"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                apply();
              }}
              disabled={!url.trim()}
              className="flex-1 px-3 py-1 text-sm rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Apply
            </button>
            {isActive && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  remove();
                }}
                className="px-3 py-1 text-sm rounded border border-error text-error hover:bg-error-bg transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DiagramMenu ─────────────────────────────────────────────────────────────

const DIAGRAM_OPTIONS = [
  {
    key: 'plantuml',
    label: 'PlantUML',
    description: 'UML sequences, components, states…',
    lang: 'plantuml',
    template: `@startuml\nAlice -> Bob: Hello\nBob --> Alice: Hi there!\n@enduml`,
    recommended: true,
    hint: '@startuml\nA -> B: message\n@enduml',
    docsUrl: 'https://plantuml.com/',
  },
  {
    key: 'mermaid',
    label: 'Mermaid',
    description: 'Flowcharts, sequences, class diagrams…',
    lang: 'mermaid',
    template: `graph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Do it]\n    B -->|No| D[Skip]`,
    recommended: false,
    hint: 'graph TD\n  A --> B --> C',
    docsUrl: 'https://mermaid.js.org/intro/',
  },
] as const;

function DiagramMenu({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(open, ref, () => setOpen(false));

  const insert = (opt: (typeof DIAGRAM_OPTIONS)[number]) => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'codeBlock',
        attrs: { language: opt.lang },
        content: [{ type: 'text', text: opt.template }],
      })
      .run();
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        title="Insert diagram"
        className={clsx(
          'px-2 py-1 rounded text-sm font-medium transition-colors flex items-center',
          open
            ? 'bg-toolbar-active-bg text-toolbar-active-text'
            : 'text-muted hover:bg-surface-alt hover:text-foreground'
        )}
      >
        <ChartArea size={18} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-diagram-menu-bg border border-border rounded-lg shadow-theme-md py-1 w-72">
          {DIAGRAM_OPTIONS.map((opt) => (
            <div key={opt.key} className="border-b border-border last:border-0">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insert(opt);
                }}
                className="w-full text-left px-3 py-2 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                  {opt.recommended ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-success-bg text-success">
                      Recommended
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-warning-bg text-warning">
                      Beta
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted mb-1.5">{opt.description}</div>
                <pre className="text-[10px] leading-relaxed bg-surface-alt border border-border rounded px-2 py-1.5 text-muted font-mono whitespace-pre">
                  {opt.hint}
                </pre>
              </button>
              <div className="px-3 pb-1.5">
                <a
                  href={opt.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseDown={(e) => e.stopPropagation()}
                  className="text-[10px] text-primary-500 hover:text-primary-700 hover:underline transition-colors"
                >
                  View full syntax docs ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main EditorToolbar ───────────────────────────────────────────────────────

interface EditorToolbarProps {
  editor: Editor;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const inTable = editor.isActive('table');

  return (
    <div className="flex flex-col border-b border-border bg-surface-alt rounded-t-lg">
      {/* ── Row 1: main formatting controls ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2">
        {/* 1. Heading style */}
        <HeadingStyleDropdown editor={editor} />

        <Sep />

        {/* 3. Font style: Bold · Italic · Underline · Strike */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strike-through"
        >
          <span className="line-through">S</span>
        </ToolbarButton>

        <Sep />

        {/* 5–6. Colour dropdowns */}
        <HighlightDropdown editor={editor} />
        <ColorDropdown editor={editor} />

        <Sep />

        {/* 8. Lists dropdown */}
        <ListsDropdown editor={editor} />

        <Sep />

        {/* 10. Table */}
        <ToolbarButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          active={inTable}
          title="Insert table"
        >
          <Table size={18} />
        </ToolbarButton>

        {/* 11. Diagram */}
        <DiagramMenu editor={editor} />

        {/* 12. Link */}
        <LinkPopover editor={editor} />

        <Sep />

        {/* 14. Code block */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code block"
        >
          <Braces size={18} />
        </ToolbarButton>

        {/* 15. Inline code */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline code"
        >
          <CodeXml size={18} />
        </ToolbarButton>

        {/* 16. Blockquote */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote size={18} />
        </ToolbarButton>
      </div>

      {/* ── Row 3: table controls (unchanged) ── */}
      {inTable && (
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-t border-border bg-primary-50">
          <span className="text-xs text-primary-500 font-medium mr-1">Table:</span>

          <ToolbarButton onClick={() => editor.chain().focus().addRowBefore().run()} title="Add row above">
            ↑ Row
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add row below">
            ↓ Row
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().deleteRow().run()} title="Delete row">
            ✕ Row
          </ToolbarButton>

          <div className="w-px h-5 bg-primary-400 mx-1" />

          <ToolbarButton onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add column left">
            ← Col
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add column right">
            → Col
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete column">
            ✕ Col
          </ToolbarButton>

          <div className="w-px h-5 bg-primary-400 mx-1" />

          <ToolbarButton onClick={() => editor.chain().focus().mergeCells().run()} title="Merge selected cells">
            Merge
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().splitCell().run()} title="Split cell">
            Split
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeaderRow().run()} title="Toggle header row">
            Header row
          </ToolbarButton>

          <div className="w-px h-5 bg-primary-400 mx-1" />

          <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete table">
            <span className="text-error">✕ Table</span>
          </ToolbarButton>
        </div>
      )}
    </div>
  );
}
