import type { Editor } from '@tiptap/react'
import clsx from 'clsx'

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      title={title}
      className={clsx(
        'px-2 py-1 rounded text-sm font-medium transition-colors',
        active
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      )}
    >
      {children}
    </button>
  )
}

const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green',  value: '#bbf7d0' },
  { label: 'Red',    value: '#fecaca' },
  { label: 'Blue',   value: '#bfdbfe' },
  { label: 'Purple', value: '#e9d5ff' },
]

const TEXT_COLORS = [
  { label: 'Default', value: null },
  { label: 'Red',     value: '#ef4444' },
  { label: 'Orange',  value: '#f97316' },
  { label: 'Green',   value: '#16a34a' },
  { label: 'Blue',    value: '#2563eb' },
  { label: 'Purple',  value: '#7c3aed' },
  { label: 'Pink',    value: '#db2777' },
  { label: 'Gray',    value: '#6b7280' },
]

interface EditorToolbarProps {
  editor: Editor
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  return (
    <div className="flex flex-col border-b border-gray-200 bg-gray-50 sticky top-16 z-30 rounded-t-lg shadow-sm">

      {/* ── Row 1: history + formatting controls ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2">

        {/* History — moved to front */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)">↩</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)">↪</ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Text style */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strike-through">
          <span className="line-through">S</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
          {'</>'}
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Headings */}
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

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Lists & blocks */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          • List
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          1. List
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
          Code block
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          ❝
        </ToolbarButton>
      </div>

      {/* ── Row 2: colour palettes ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-t border-gray-200">

        {/* Text colour */}
        <span className="text-xs text-gray-500 mr-1">Color:</span>
        {TEXT_COLORS.map((c) =>
          c.value === null ? (
            <button
              key="reset"
              type="button"
              title="Remove colour"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run() }}
              className="w-5 h-5 rounded border-2 border-gray-300 bg-white flex items-center
                         justify-center text-gray-400 text-xs hover:border-gray-500 transition-colors"
            >
              ✕
            </button>
          ) : (
            <button
              key={c.value}
              type="button"
              title={`Text: ${c.label}`}
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c.value!).run() }}
              className={clsx(
                'w-5 h-5 rounded border-2 transition-transform hover:scale-110',
                editor.isActive('textStyle', { color: c.value }) ? 'border-gray-700 scale-110' : 'border-gray-300',
              )}
              style={{ backgroundColor: c.value }}
            />
          ),
        )}

        <div className="w-px h-5 bg-gray-300 mx-2" />

        {/* Highlight colour */}
        <span className="text-xs text-gray-500 mr-1">Highlight:</span>
        <button
          type="button"
          title="Remove highlight"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetHighlight().run() }}
          className="w-5 h-5 rounded border-2 border-gray-300 bg-white flex items-center
                     justify-center text-gray-400 text-xs hover:border-gray-500 transition-colors"
        >
          ✕
        </button>
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            title={`Highlight: ${color.label}`}
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHighlight({ color: color.value }).run() }}
            className={clsx(
              'w-5 h-5 rounded border-2 transition-transform hover:scale-110',
              editor.isActive('highlight', { color: color.value }) ? 'border-gray-700 scale-110' : 'border-gray-300',
            )}
            style={{ backgroundColor: color.value }}
          />
        ))}
      </div>

    </div>
  )
}
