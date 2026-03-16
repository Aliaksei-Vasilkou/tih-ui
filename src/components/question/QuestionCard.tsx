import { useNavigate } from 'react-router-dom'
import type { Question } from '@/types'
import clsx from 'clsx'

interface QuestionCardProps {
  question: Question
}

const LANGUAGE_COLORS: Record<string, string> = {
  java:       'bg-orange-100 text-orange-700',
  typescript: 'bg-blue-100 text-blue-700',
  general:    'bg-gray-100 text-gray-700',
}

export default function QuestionCard({ question }: QuestionCardProps) {
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
      <div className="flex items-center justify-between gap-3">
        <p className="text-gray-900 font-medium leading-snug group-hover:text-primary-700 transition-colors">
          {question.questionText}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', langColor)}>
            {question.languageName}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {question.categoryName}
          </span>
        </div>
      </div>
    </div>
  )
}
