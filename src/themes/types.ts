/**
 * Theme system type definitions.
 *
 * These interfaces define the shape of theme configuration files
 * stored in public/themes/. The token keys use kebab-case and map
 * directly to CSS custom properties (e.g., "color-primary-600" → --color-primary-600).
 */

/** A single entry in the theme manifest */
export interface ThemeManifestEntry {
  id: string;
  name: string;
  file: string;
}

/** The manifest listing all available themes */
export interface ThemeManifest {
  defaultThemeId: string;
  themes: ThemeManifestEntry[];
}

/** A flat map of token names to CSS values */
export type ThemeTokens = Record<string, string>;

/** Full theme configuration as stored in a JSON file */
export interface ThemeConfig {
  id: string;
  name: string;
  tokens: ThemeTokens;
}
