/**
 * Language badge color mapping using semantic theme tokens.
 * These classes reference CSS variables defined in the theme config files.
 */
export const LANGUAGE_COLORS: Record<string, string> = {
  java:       'bg-badge-lang-java-bg text-badge-lang-java-text',
  typescript: 'bg-badge-lang-ts-bg text-badge-lang-ts-text',
  general:    'bg-badge-default-bg text-badge-default-text',
}

export const DEFAULT_LANGUAGE_COLOR = 'bg-badge-default-bg text-badge-default-text'
