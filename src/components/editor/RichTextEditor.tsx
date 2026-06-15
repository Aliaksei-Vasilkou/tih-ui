import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';
import CodeBlockNodeView from './CodeBlockNodeView';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import EditorToolbar from './EditorToolbar';
import clsx from 'clsx';

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
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
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockNodeView);
        },
      }).configure({ lowlight, defaultLanguage: null }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({ openOnClick: false, autolink: true }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content focus:outline-none',
        'data-placeholder': placeholder,
      },
    },
  });

  return (
    <div
      className={clsx(
        'rounded-lg border border-border-strong bg-surface',
        !readOnly && 'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-border-focus',
        className
      )}
    >
      {!readOnly && editor && <EditorToolbar editor={editor} />}
      <div className="overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
