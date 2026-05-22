/**
 * Editor content colour palettes.
 *
 * WHY THESE ARE NOT IN THEME CONFIG FILES:
 * ─────────────────────────────────────────
 * These colours are applied to *authored content* and get stored verbatim in
 * the database (TipTap serialises them as inline style attributes, e.g.
 * `style="color: #ef4444"` or `style="background-color: #fecaca"`).
 *
 * If these values were CSS variables from a theme config, changing or renaming
 * a theme token would silently break the display of all previously saved
 * answers. The colours therefore must be stable, explicit hex values that
 * never depend on the active theme.
 *
 * Adding a new colour: just append an entry to the relevant array below.
 * No theme file or Tailwind config changes are needed.
 */

export interface PaletteColor {
  label: string
  value: string
}

export interface NullablePaletteColor {
  label: string
  value: string | null
}

/**
 * Background highlight colours shown in the toolbar palette picker.
 * Applied via TipTap's Highlight extension as background-color.
 */
export const HIGHLIGHT_COLORS: PaletteColor[] = [
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green',  value: '#bbf7d0' },
  { label: 'Red',    value: '#fecaca' },
  { label: 'Blue',   value: '#bfdbfe' },
  { label: 'Violet', value: '#e9d5ff' },
]

/**
 * Foreground text colours shown in the toolbar palette picker.
 * `value: null` means "remove colour / use default".
 * Applied via TipTap's Color extension as color.
 */
export const TEXT_COLORS: NullablePaletteColor[] = [
  { label: 'Default', value: null     },
  { label: 'Red',     value: '#ef4444' },
  { label: 'Green',   value: '#22c55e' },
  { label: 'Blue',    value: '#3b82f6' },
  { label: 'Violet',  value: '#8b5cf6' },
]
