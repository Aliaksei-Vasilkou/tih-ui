import { useState, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import clsx from 'clsx';
import { HIGHLIGHT_COLORS, TEXT_COLORS } from '@/constants/editorPalette';

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
        active ? 'bg-primary-100 text-primary-700' : 'text-muted hover:bg-surface-alt hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

interface EditorToolbarProps {
  editor: Editor;
}

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

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

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
          'px-2 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1',
          open ? 'bg-primary-100 text-primary-700' : 'text-muted hover:bg-surface-alt hover:text-foreground'
        )}
      >
        ⬡ Diagram
        <span className="text-[10px] opacity-60">▾</span>
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

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const inTable = editor.isActive('table');

  return (
    <div className="flex flex-col border-b border-border bg-surface-alt rounded-t-lg">
      {/* ── Row 1: history + formatting controls ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)">
          ↩
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)">
          ↪
        </ToolbarButton>

        <div className="w-px h-5 bg-border-strong mx-1" />

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
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline code"
        >
          {'</>'}
        </ToolbarButton>

        <div className="w-px h-5 bg-border-strong mx-1" />

        {([1, 2, 3] as const).map((level) => (
          <ToolbarButton
            key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            active={editor.isActive('heading', { level })}
            title={`Heading ${level}`}
          >
            H{level}
          </ToolbarButton>
        ))}

        <div className="w-px h-5 bg-border-strong mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
        >
          1. List
        </ToolbarButton>

        <div className="w-px h-5 bg-border-strong mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          active={inTable}
          title="Insert table"
        >
          ⊞ Table
        </ToolbarButton>

        <div className="w-px h-5 bg-border-strong mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code block"
        >
          Code block
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          ❝
        </ToolbarButton>

        <div className="w-px h-5 bg-border-strong mx-1" />

        <DiagramMenu editor={editor} />
      </div>

      {/* ── Row 2: colour palettes ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-t border-border">
        <span className="text-xs text-muted mr-1">Color:</span>
        {TEXT_COLORS.map((c) =>
          c.value === null ? (
            <button
              key="reset"
              type="button"
              title="Remove colour"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().unsetColor().run();
              }}
              className="w-5 h-5 rounded border-2 border-border-strong bg-surface flex items-center
                         justify-center text-muted text-xs hover:border-foreground transition-colors"
            >
              ✕
            </button>
          ) : (
            <button
              key={c.value}
              type="button"
              title={`Text: ${c.label}`}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().setColor(c.value!).run();
              }}
              className={clsx(
                'w-5 h-5 rounded border-2 transition-transform hover:scale-110',
                editor.isActive('textStyle', { color: c.value })
                  ? 'border-foreground scale-110'
                  : 'border-border-strong'
              )}
              style={{ backgroundColor: c.value }}
            />
          )
        )}

        <div className="w-px h-5 bg-border-strong mx-2" />

        <span className="text-xs text-muted mr-1">Highlight:</span>
        <button
          type="button"
          title="Remove highlight"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().unsetHighlight().run();
          }}
          className="w-5 h-5 rounded border-2 border-border-strong bg-surface flex items-center
                     justify-center text-muted text-xs hover:border-foreground transition-colors"
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
            }}
            className={clsx(
              'w-5 h-5 rounded border-2 transition-transform hover:scale-110',
              editor.isActive('highlight', { color: color.value })
                ? 'border-foreground scale-110'
                : 'border-border-strong'
            )}
            style={{ backgroundColor: color.value }}
          />
        ))}
      </div>

      {/* ── Row 3: table controls ── */}
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
