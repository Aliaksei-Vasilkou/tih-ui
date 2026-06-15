import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Settings2 } from 'lucide-react';
import clsx from 'clsx';

import LanguageSelector from '@/components/common/LanguageSelector';
import LevelSelector from '@/components/common/LevelSelector';
import ThemeSwitcher from './ThemeSwitcher';

const MODE_LABELS: Record<string, string> = {
  '/prepare': 'Prepare',
  '/practice': 'Practice',
  '/hack': 'Hack',
};

function getModeLabel(pathname: string): string | null {
  const key = Object.keys(MODE_LABELS).find((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return key ? MODE_LABELS[key] : null;
}

type HeaderVariant = 'home' | 'prepare' | 'manage' | 'stub';

function getVariant(pathname: string): HeaderVariant {
  if (pathname === '/') return 'home';
  if (pathname === '/prepare' || pathname.startsWith('/prepare/')) return 'prepare';
  if (pathname === '/manage' || pathname.startsWith('/manage/') || pathname.startsWith('/questions/')) return 'manage';
  return 'stub';
}

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const variant = getVariant(pathname);
  const modeLabel = getModeLabel(pathname);

  return (
    <header className="bg-surface border-b border-border shadow-theme-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* ── Logo ── */}
          <Link
            to="/"
            className="flex items-center gap-2 text-primary-700 font-bold text-lg hover:text-primary-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded shrink-0"
            aria-label="Tech Interview Helper — Home"
          >
            <BookOpen className="w-6 h-6" aria-hidden="true" />
            <span className="hidden sm:block">Tech Interview Helper</span>
            <span className="sm:hidden">TIH</span>
          </Link>

          {/* ── Centre controls ── */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Language selector — active on home + manage; inactive (disabled) on prepare + stubs */}
            <LanguageSelector disabled={variant === 'prepare' || variant === 'stub'} />

            {/* Level selector — Prepare only */}
            {variant === 'prepare' && <LevelSelector />}

            {/* Mode marker pill — Prepare + stubs */}
            {modeLabel && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary-600/10 text-primary-600 font-medium whitespace-nowrap">
                {modeLabel}
              </span>
            )}
          </div>

          {/* ── Right controls ── */}
          <nav className="flex items-center gap-2 shrink-0" aria-label="Main navigation">
            {/* Manage Questions icon — Home screen only */}
            {variant === 'home' && (
              <button
                onClick={() => navigate('/manage')}
                aria-label="Manage Questions"
                title="Manage Questions"
                className={clsx(
                  'p-2 rounded-lg border border-border-strong text-muted transition-colors',
                  'hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus'
                )}
              >
                <Settings2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            <ThemeSwitcher />
          </nav>
        </div>
      </div>
    </header>
  );
}
