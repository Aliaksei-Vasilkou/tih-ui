import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import MermaidDiagram from './MermaidDiagram';
import PlantUmlDiagram from './PlantUmlDiagram';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

const DIAGRAM_LANGS = new Set(['mermaid']);
const PLANTUML_LANGS = new Set(['plantuml', 'puml']);

/** Ensures hrefs stored without a protocol open as absolute URLs, not relative paths. */
function ensureAbsoluteUrl(href: string | undefined): string | undefined {
  if (!href) return href;
  if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href) || /^tel:/i.test(href) || href.startsWith('#')) {
    return href;
  }
  return `https://${href}`;
}

const components: Components = {
  a({ href, children, ...props }) {
    return (
      <a href={ensureAbsoluteUrl(href)} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1].toLowerCase() : '';
    const code = String(children).replace(/\n$/, '');

    if (DIAGRAM_LANGS.has(lang)) {
      return <MermaidDiagram code={code} />;
    }

    if (PLANTUML_LANGS.has(lang)) {
      return <PlantUmlDiagram code={code} />;
    }

    const isInline = !match && !String(children).includes('\n');

    if (isInline) {
      return (
        <code className="md-inline-code" {...props}>
          {children}
        </code>
      );
    }

    return (
      <SyntaxHighlighter
        style={oneLight}
        language={lang || 'text'}
        PreTag="div"
        customStyle={{
          margin: '0 0 1rem 0',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          border: '1px solid #e5e7eb',
        }}
      >
        {code}
      </SyntaxHighlighter>
    );
  },
};

export default function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <div className={`md-content ${className ?? ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
