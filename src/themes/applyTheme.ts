import type { ThemeTokens, ThemeConfig, ThemeManifest } from './types';

/**
 * Applies a token map to the document root as CSS custom properties.
 * Each key in the tokens object becomes `--{key}` on :root.
 */
export function applyTokens(tokens: ThemeTokens): void {
  const root = document.documentElement;
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}

/**
 * Fetches a theme JSON file from /themes/{filename} and applies it.
 * Returns the full ThemeConfig for storage.
 */
export async function loadTheme(filename: string): Promise<ThemeConfig> {
  const response = await fetch(`/themes/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to load theme: ${filename}`);
  }
  const config: ThemeConfig = await response.json();
  applyTokens(config.tokens);
  return config;
}

/**
 * Fetches the theme manifest listing all available themes.
 */
export async function loadManifest(): Promise<ThemeManifest> {
  const response = await fetch('/themes/_manifest.json');
  if (!response.ok) {
    throw new Error('Failed to load theme manifest');
  }
  return response.json();
}
