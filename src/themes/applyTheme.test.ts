import { describe, it, expect, vi, beforeEach } from 'vitest';
import { applyTokens, loadTheme, loadManifest } from './applyTheme';
import type { ThemeTokens, ThemeConfig, ThemeManifest } from './types';

describe('applyTokens', () => {
  it('should set each token as a CSS custom property on :root', () => {
    const tokens: ThemeTokens = {
      'color-primary-600': '#3b82f6',
      'color-surface': '#ffffff',
    };
    applyTokens(tokens);
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--color-primary-600')).toBe('#3b82f6');
    expect(root.style.getPropertyValue('--color-surface')).toBe('#ffffff');
  });

  it('should handle an empty token map without throwing', () => {
    expect(() => applyTokens({})).not.toThrow();
  });

  it('should overwrite a previously set property', () => {
    applyTokens({ 'color-border': 'blue' });
    applyTokens({ 'color-border': 'red' });
    expect(document.documentElement.style.getPropertyValue('--color-border')).toBe('red');
  });
});

describe('loadTheme', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch the theme file and apply tokens', async () => {
    const mockConfig: ThemeConfig = {
      id: 'default-light',
      name: 'Light',
      tokens: { 'color-primary': '#000' },
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockConfig,
      })
    );

    const result = await loadTheme('default-light.json');
    expect(fetch).toHaveBeenCalledWith('/themes/default-light.json');
    expect(result).toEqual(mockConfig);
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#000');
  });

  it('should throw when the fetch response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await expect(loadTheme('bad.json')).rejects.toThrow('Failed to load theme: bad.json');
  });
});

describe('loadManifest', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch and return the theme manifest', async () => {
    const mockManifest: ThemeManifest = {
      defaultThemeId: 'default-light',
      themes: [{ id: 'default-light', name: 'Light', file: 'default-light.json' }],
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      })
    );

    const result = await loadManifest();
    expect(fetch).toHaveBeenCalledWith('/themes/_manifest.json');
    expect(result).toEqual(mockManifest);
  });

  it('should throw when the manifest fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await expect(loadManifest()).rejects.toThrow('Failed to load theme manifest');
  });
});
