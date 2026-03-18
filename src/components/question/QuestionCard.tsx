import { useNavigate } from 'react-router-dom'
import type { Question } from '@/types'
import clsx from 'clsx'
import HighlightText from '@/components/common/HighlightText'

interface QuestionCardProps {
  question: Question
  query?: string
}

const LANGUAGE_COLORS: Record<string, string> = {
  java:       'bg-orange-100 text-orange-700',
  typescript: 'bg-blue-100 text-blue-700',
  general:    'bg-gray-100 text-gray-700',
}

export default function QuestionCard({ question, query = '' }: QuestionCardProps) {
  const navigate = useNavigate()
  const langColor = LANGUAGE_COLORS[question.languageCode] ?? 'bg-gray-100 text-gray-700'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/questions/${question.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/questions/${question.id}`)}
      className="bg-white rounded-xl border border-gray-200 px-4 py-3 hover:border-primary-500
                 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-gray-900 font-medium leading-snug group-hover:text-primary-700 transition-colors">
          <HighlightText text={question.questionText} query={query} />
        </p>
        <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0 max-w-[55%]">
          <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap', langColor)}>
            {question.languageName}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">
            {question.categoryName}
          </span>
          {question.tags?.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
