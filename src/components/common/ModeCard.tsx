import { Link } from 'react-router-dom';
import clsx from 'clsx';

import type { ModeDefinition } from '@/types';

interface ModeCardProps {
  mode: ModeDefinition;
}

export default function ModeCard({ mode }: ModeCardProps) {
  const Icon = mode.icon;
  const isComingSoon = mode.status === 'coming-soon';

  return (
    <Link
      to={mode.route}
      aria-label={`${mode.title} mode`}
      className={clsx(
        'relative flex flex-row items-stretch gap-6 rounded-2xl border border-border',
        'bg-surface shadow-theme-md p-8 transition-colors w-full max-w-2xl',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
        isComingSoon ? 'hover:bg-surface-alt' : 'hover:bg-surface-alt'
      )}
    >
      {/* Coming Soon badge */}
      {isComingSoon && (
        <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-surface-alt text-muted border border-border">
          Coming soon
        </span>
      )}

      {/* Icon — left column, full card height */}
      <div className="flex items-center justify-center w-24 shrink-0 rounded-xl bg-primary-600/10 text-primary-600">
        <Icon className="w-12 h-12" aria-hidden="true" />
      </div>

      {/* Text — right column */}
      <div className="flex flex-col justify-center gap-2 min-w-0">
        <h2 className="text-xl font-semibold text-foreground">{mode.title}</h2>
        <p className="text-base text-foreground-secondary leading-snug">{mode.description}</p>
      </div>
    </Link>
  );
}
