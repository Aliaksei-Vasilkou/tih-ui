import { Link } from 'react-router-dom';
import clsx from 'clsx';

import type { Question } from '@/types';
import { LANGUAGE_COLORS, DEFAULT_LANGUAGE_COLOR } from '@/constants/languageColors';
import HighlightText from '@/components/common/HighlightText';

const LEVEL_TAG_RE = /^L[1-4]$/i;

interface QuestionCardProps {
  question: Question;
  query?: string;
  // When true: hides language badge, shows only level tags, links to /prepare/questions/:id
  readOnly?: boolean;
  // When true: hides language badge, shows only level tags, links to /questions/:id (full-edit route)
  hideLanguage?: boolean;
  // When false, the category badge is hidden (use when a specific category is already selected)
  showCategory?: boolean;
}

export default function QuestionCard({
  question,
  query = '',
  readOnly = false,
  hideLanguage = false,
  showCategory = true,
}: QuestionCardProps) {
  const langColor = LANGUAGE_COLORS[question.languageCode] ?? DEFAULT_LANGUAGE_COLOR;
  const href = readOnly ? `/prepare/questions/${question.id}` : `/questions/${question.id}`;

  // Both readOnly (Prepare) and hideLanguage (Manage) modes show only level tags in result cards
  const levelTagsOnly = readOnly || hideLanguage;
  const visibleTags = levelTagsOnly ? (question.tags ?? []).filter((t) => LEVEL_TAG_RE.test(t)) : (question.tags ?? []);

  const showLanguageBadge = !readOnly && !hideLanguage;

  return (
    <Link
      to={href}
      className="block bg-surface rounded-xl border border-border px-4 py-3 hover:border-primary-500
                 hover:shadow-theme-md transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-foreground font-medium leading-snug group-hover:text-primary-700 transition-colors">
          <HighlightText text={question.questionText} query={query} />
        </p>
        <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0 max-w-[55%]">
          {showLanguageBadge && (
            <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap', langColor)}>
              {question.languageName}
            </span>
          )}
          {showCategory && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-badge-category-bg text-badge-category-text whitespace-nowrap">
              {question.categoryName}
            </span>
          )}
          {visibleTags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
