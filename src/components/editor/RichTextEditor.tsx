import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Underline from '@tiptap/extension-underline'
import EditorToolbar from './EditorToolbar'
import clsx from 'clsx'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  readOnly?: boolean
  className?: string
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write your answer here…',
  readOnly = false,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content focus:outline-none',
        'data-placeholder': placeholder,
      },
    },
  })

  return (
    <div
      className={clsx(
        'rounded-lg border border-gray-300 bg-white overflow-hidden',
        !readOnly && 'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500',
        className,
      )}
    >
      {!readOnly && editor && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}
