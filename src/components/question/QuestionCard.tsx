import { Link } from 'react-router-dom';
import type { Question } from '@/types';
import { LANGUAGE_COLORS, DEFAULT_LANGUAGE_COLOR } from '@/constants/languageColors';
import clsx from 'clsx';
import HighlightText from '@/components/common/HighlightText';

interface QuestionCardProps {
  question: Question;
  query?: string;
}

export default function QuestionCard({ question, query = '' }: QuestionCardProps) {
  const langColor = LANGUAGE_COLORS[question.languageCode] ?? DEFAULT_LANGUAGE_COLOR;

  return (
    <Link
      to={`/questions/${question.id}`}
      className="block bg-surface rounded-xl border border-border px-4 py-3 hover:border-primary-500
                 hover:shadow-theme-md transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-foreground font-medium leading-snug group-hover:text-primary-700 transition-colors">
          <HighlightText text={question.questionText} query={query} />
        </p>
        <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0 max-w-[55%]">
          <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap', langColor)}>
            {question.languageName}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-badge-category-bg text-badge-category-text whitespace-nowrap">
            {question.categoryName}
          </span>
          {question.tags?.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
