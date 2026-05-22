import { useRef, useState, useEffect } from 'react'
import { Palette, Check, ChevronDown } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import clsx from 'clsx'

export default function ThemeSwitcher() {
  const { availableThemes, currentThemeId, setTheme, isLoaded } = useThemeStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  if (!isLoaded || availableThemes.length === 0) return null

  const currentTheme = availableThemes.find((t) => t.id === currentThemeId)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Switch theme"
        className={clsx(
          'flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
          'text-muted hover:text-foreground hover:bg-surface-alt border border-transparent',
          open && 'bg-surface-alt text-foreground border-border',
        )}
      >
        <Palette className="w-4 h-4 shrink-0" />
        <span className="hidden sm:block">{currentTheme?.name ?? 'Theme'}</span>
        <ChevronDown className={clsx('w-3 h-3 hidden sm:block transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select theme"
          className="absolute right-0 top-full mt-1 min-w-[10rem] bg-surface border border-border rounded-xl shadow-theme-md py-1 z-50"
        >
          {availableThemes.map((theme) => {
            const isActive = theme.id === currentThemeId
            return (
              <button
                key={theme.id}
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  setTheme(theme.id)
                  setOpen(false)
                }}
                className={clsx(
                  'w-full flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors text-left',
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-foreground hover:bg-surface-alt',
                )}
              >
                <span>{theme.name}</span>
                {isActive && <Check className="w-3.5 h-3.5 shrink-0 text-primary-600" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
