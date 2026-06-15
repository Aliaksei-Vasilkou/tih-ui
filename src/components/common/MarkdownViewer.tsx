import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { lowlight } from 'lowlight';
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

// ── Lowlight hast → React ───────────────────────────────────────────────────
interface HastText {
  type: 'text';
  value: string;
}
interface HastElement {
  type: 'element';
  tagName: string;
  properties: { className?: string[] };
  children: HastNode[];
}
type HastNode = HastText | HastElement;

function renderHastNodes(nodes: HastNode[], prefix: string): React.ReactNode[] {
  return nodes.map((n, i) => {
    if (n.type === 'text') return n.value;
    const cls = (n.properties?.className ?? []).join(' ');
    return (
      <span key={`${prefix}-${i}`} className={cls}>
        {renderHastNodes(n.children, `${prefix}-${i}`)}
      </span>
    );
  });
}

function highlightCode(lang: string, code: string): React.ReactNode {
  if (lang && lowlight.registered(lang)) {
    const root = lowlight.highlight(lang, code);
    return renderHastNodes(root.children as HastNode[], 'h');
  }
  return code;
}
// ────────────────────────────────────────────────────────────────────────────

const components: Components = {
  a({ href, children, ...props }) {
    return (
      <a href={ensureAbsoluteUrl(href)} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  // Suppress react-markdown's default <pre> — we emit our own <pre class="md-code-block">
  // from the code handler so diagrams don't inherit code-block styles.
  pre({ children }) {
    return <>{children}</>;
  },
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1].toLowerCase() : '';

    // react-markdown always ends fenced-code content with \n; inline code never does.
    // Check the raw children BEFORE stripping so single-line blocks are detected correctly.
    const rawContent = String(children);
    const isBlock = !!match || rawContent.endsWith('\n');
    const code = rawContent.replace(/\n$/, '');

    if (isBlock) {
      if (DIAGRAM_LANGS.has(lang)) return <MermaidDiagram code={code} />;
      if (PLANTUML_LANGS.has(lang)) return <PlantUmlDiagram code={code} />;

      return (
        <pre className="md-code-block">
          <code className={lang ? `language-${lang}` : undefined}>{highlightCode(lang, code)}</code>
        </pre>
      );
    }

    return (
      <code className="md-inline-code" {...props}>
        {children}
      </code>
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
