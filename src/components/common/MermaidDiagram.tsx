import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

interface MermaidDiagramProps {
  code: string;
}

/**
 * Determines how wide the SVG should be rendered relative to its container.
 *
 * The SVG's natural width (from the viewBox) reflects content complexity:
 *   - A tiny diagram with 2 nodes → small viewBox → scale it up so it doesn't look lost
 *   - A large diagram with many nodes/edges → large viewBox → let it fill the container
 *
 * Thresholds are expressed as the ratio (naturalWidth / containerWidth):
 *   ≥ 0.85  → fill the container (100%)
 *   ≥ 0.55  → slightly inset    (90%)
 *   ≥ 0.35  → medium scale      (75%)
 *   ≥ 0.15  → small diagram     (60%)
 *   <  0.15 → very small        (50%)
 */
function computeDiagramWidth(svg: SVGElement, containerWidth: number): string {
  const viewBox = svg.getAttribute('viewBox');
  const parts = viewBox?.trim().split(/\s+/).map(Number);
  const naturalWidth = parts && parts.length >= 3 ? parts[2] : parseFloat(svg.getAttribute('width') ?? '0');

  if (!naturalWidth || !containerWidth) return '80%';

  const ratio = naturalWidth / containerWidth;

  if (ratio >= 0.85) return '100%';
  if (ratio >= 0.55) return '90%';
  if (ratio >= 0.35) return '75%';
  if (ratio >= 0.15) return '60%';
  return '50%';
}

export default function MermaidDiagram({ code }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let cancelled = false;

    setError('');
    setLoading(true);
    container.innerHTML = '';
    (async () => {
      try {
        await mermaid.parse(code);

        if (cancelled || !container) return;

        const pre = document.createElement('pre');
        pre.className = 'mermaid';
        pre.textContent = code;
        container.appendChild(pre);

        await mermaid.run({ nodes: [pre], suppressErrors: false });

        if (cancelled || !container) return;

        const svg = container.querySelector('svg');
        if (svg) {
          const containerWidth = container.offsetWidth;
          svg.style.width = computeDiagramWidth(svg, containerWidth);
          svg.style.height = 'auto';
          svg.style.display = 'block';
          svg.style.margin = '0 auto';
        }

        setLoading(false);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      container.innerHTML = '';
    };
  }, [code]);

  if (error) {
    return (
      <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
        <span className="font-semibold">Mermaid error: </span>
        <span className="font-mono">{error}</span>
      </div>
    );
  }

  return (
    <div className="relative my-4 rounded-lg border border-gray-200 bg-white overflow-x-auto">
      {loading && <div className="flex items-center justify-center py-8 text-sm text-gray-400">Rendering diagram…</div>}
      <div ref={containerRef} className="w-full p-4" />
    </div>
  );
}
