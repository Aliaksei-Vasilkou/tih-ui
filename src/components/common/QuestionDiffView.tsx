import clsx from 'clsx';

import type { DuplicateConflict } from '@/types';
import MarkdownViewer from '@/components/common/MarkdownViewer';

interface QuestionDiffViewProps {
  conflict: DuplicateConflict;
}

interface DiffRow {
  label: string;
  existing: string;
  incoming: string;
  renderAsMarkdown?: boolean;
}

interface DiffSegment {
  text: string;
  changed: boolean;
}

function isWhitespace(text: string) {
  return /^\s+$/.test(text);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function coalesceSegments(segments: DiffSegment[]): DiffSegment[] {
  if (segments.length === 0) {
    return segments;
  }

  // If whitespace is between changed tokens, treat it as changed too to keep one visual block.
  const normalized = segments.map((segment, index) => {
    if (!segment.changed && isWhitespace(segment.text) && index > 0 && index < segments.length - 1) {
      const previousChanged = segments[index - 1].changed;
      const nextChanged = segments[index + 1].changed;
      if (previousChanged && nextChanged) {
        return { ...segment, changed: true };
      }
    }

    return segment;
  });

  const result: DiffSegment[] = [];
  for (const segment of normalized) {
    const previous = result[result.length - 1];
    if (previous && previous.changed === segment.changed) {
      previous.text += segment.text;
      continue;
    }

    result.push({ ...segment });
  }

  return result;
}

function normalizeTags(tags: string[]) {
  return [...tags].sort((a, b) => a.localeCompare(b)).join(', ');
}

function toDiffRows(conflict: DuplicateConflict): DiffRow[] {
  return [
    {
      label: 'Question',
      existing: conflict.existing.questionText,
      incoming: conflict.incoming.question,
      renderAsMarkdown: true,
    },
    {
      label: 'Answer',
      existing: conflict.existing.answerContent,
      incoming: conflict.incoming.answer,
      renderAsMarkdown: true,
    },
    {
      label: 'Language',
      existing: conflict.existing.languageCode,
      incoming: conflict.incoming.language,
    },
    {
      label: 'Category',
      existing: conflict.existing.categoryName,
      incoming: conflict.incoming.category,
    },
    {
      label: 'Tags',
      existing: normalizeTags(conflict.existing.tags),
      incoming: normalizeTags(conflict.incoming.tags),
    },
  ];
}

/** Split text into tokens: words and whitespace separately, preserving structure */
function tokenize(text: string): string[] {
  return text.match(/\S+|\s+/g) || [];
}

/** Find longest common subsequence to identify which tokens changed */
function computeWordDiff(
  existing: string,
  incoming: string
): { existingSegments: DiffSegment[]; incomingSegments: DiffSegment[] } {
  const existingTokens = tokenize(existing);
  const incomingTokens = tokenize(incoming);

  const n = existingTokens.length;
  const m = incomingTokens.length;

  const lcs: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      if (existingTokens[i] === incomingTokens[j]) {
        lcs[i][j] = lcs[i + 1][j + 1] + 1;
      } else {
        lcs[i][j] = Math.max(lcs[i + 1][j], lcs[i][j + 1]);
      }
    }
  }

  const existingUsed = Array(n).fill(false);
  const incomingUsed = Array(m).fill(false);

  let i = 0;
  let j = 0;

  while (i < n && j < m) {
    if (existingTokens[i] === incomingTokens[j]) {
      existingUsed[i] = false;
      incomingUsed[j] = false;
      i += 1;
      j += 1;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      existingUsed[i] = true;
      i += 1;
    } else {
      incomingUsed[j] = true;
      j += 1;
    }
  }

  while (i < n) {
    existingUsed[i] = true;
    i += 1;
  }

  while (j < m) {
    incomingUsed[j] = true;
    j += 1;
  }

  const existingSegments = existingTokens.map((token, idx) => ({
    text: token,
    changed: existingUsed[idx],
  }));

  const incomingSegments = incomingTokens.map((token, idx) => ({
    text: token,
    changed: incomingUsed[idx],
  }));

  return { existingSegments, incomingSegments };
}

function renderDiffContent(
  content: string,
  renderAsMarkdown: boolean,
  side: 'existing' | 'incoming',
  segments: DiffSegment[]
) {
  if (!content) {
    return <span className="text-muted-light italic">-</span>;
  }

  // For markdown, apply diff highlighting by wrapping changed words in spans with inline styles
  if (renderAsMarkdown) {
    const bgColor = side === 'existing' ? 'var(--color-error-bg)' : 'var(--color-success-bg)';
    const textColor = side === 'existing' ? 'var(--color-error)' : 'var(--color-success)';
    const borderColor = side === 'existing' ? 'var(--color-error-light)' : 'var(--color-success-light)';
    const mergedSegments = coalesceSegments(segments);

    // If there are segments and content has changed, apply highlighting
    const highlightedContent =
      mergedSegments.length > 0
        ? mergedSegments
            .map((seg) => {
              if (!seg.changed) {
                return seg.text;
              }
              // Wrap changed text in HTML with inline styles for strong, contiguous highlight blocks.
              return `<mark style="background-color: ${bgColor}; color: ${textColor}; border: 2px solid ${borderColor}; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-weight: 700; box-shadow: 0 0 0 1px ${borderColor} inset;">${escapeHtml(seg.text)}</mark>`;
            })
            .join('')
        : content;

    return <MarkdownViewer content={highlightedContent} className="text-sm" />;
  }

  // If no segments (field hasn't changed), render plain text without highlighting
  if (segments.length === 0) {
    return <div className="whitespace-pre-wrap break-words font-mono text-sm">{content}</div>;
  }

  const mergedSegments = coalesceSegments(segments);

  // Render plain text with enhanced diff highlighting
  return (
    <div className="whitespace-pre-wrap break-words font-mono text-sm">
      {mergedSegments.map((segment, idx) => {
        const isRemoved = segment.changed && side === 'existing';
        const isAdded = segment.changed && side === 'incoming';

        return (
          <span
            key={idx}
            className={clsx(
              isRemoved && 'px-1.5 py-0.5 rounded border-2 border-error-light bg-error-bg text-error font-bold',
              isAdded && 'px-1.5 py-0.5 rounded border-2 border-success-light bg-success-bg text-success font-bold'
            )}
          >
            {segment.text}
          </span>
        );
      })}
    </div>
  );
}

export default function QuestionDiffView({ conflict }: QuestionDiffViewProps) {
  const rows = toDiffRows(conflict);
  const hasAnyDifference = rows.some((row) => row.existing !== row.incoming);

  return (
    <div className="space-y-3 px-6 py-4">
      {!hasAnyDifference && (
        <div className="rounded-lg border border-warning-border bg-warning-bg px-3 py-2 text-sm text-warning">
          No field changes detected. Skipping is recommended for this duplicate.
        </div>
      )}

      <div className="overflow-auto rounded-lg border border-border">
        <table className="w-full border-collapse table-fixed">
          <thead className="sticky top-0 bg-surface-alt text-muted-light uppercase tracking-wide text-xs">
            <tr>
              <th className="w-32 px-4 py-2 text-left font-semibold">Field</th>
              <th className="px-4 py-2 text-left font-semibold">Existing</th>
              <th className="px-4 py-2 text-left font-semibold">Incoming</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {rows.map((row) => {
              const changed = row.existing !== row.incoming;
              const { existingSegments, incomingSegments } = changed
                ? computeWordDiff(row.existing, row.incoming)
                : { existingSegments: [], incomingSegments: [] };

              return (
                <tr key={row.label} className={clsx(changed && 'bg-surface-alt')}>
                  <td className="px-4 py-3 font-medium text-foreground-secondary align-top">{row.label}</td>
                  <td className="px-4 py-3 align-top">
                    {renderDiffContent(row.existing, row.renderAsMarkdown ?? false, 'existing', existingSegments)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {renderDiffContent(row.incoming, row.renderAsMarkdown ?? false, 'incoming', incomingSegments)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
