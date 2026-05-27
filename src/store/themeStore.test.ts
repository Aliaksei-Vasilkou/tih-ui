import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useThemeStore } from './themeStore';
import type { ThemeManifest } from '@/themes/types';

const mockManifest: ThemeManifest = {
  defaultThemeId: 'default-light',
  themes: [
    { id: 'default-light', name: 'Light', file: 'default-light.json' },
    { id: 'default-dark', name: 'Dark', file: 'default-dark.json' },
  ],
};

function mockFetchForTheme(manifest = mockManifest) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url: string) => {
      if (url === '/themes/_manifest.json') {
        return Promise.resolve({ ok: true, json: async () => manifest });
      }
      // any theme file
      return Promise.resolve({
        ok: true,
        json: async () => ({ id: 'default-light', name: 'Light', tokens: {} }),
      });
    })
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  act(() => {
    useThemeStore.setState({
      currentThemeId: null,
      availableThemes: [],
      isLoaded: false,
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('themeStore', () => {
  describe('init', () => {
    it('should load manifest themes and pick the default theme', async () => {
      mockFetchForTheme();
      await act(async () => {
        await useThemeStore.getState().init();
      });
      const { currentThemeId, availableThemes, isLoaded } = useThemeStore.getState();
      expect(availableThemes).toHaveLength(2);
      expect(currentThemeId).toBe('default-light');
      expect(isLoaded).toBe(true);
    });

    it('should use a valid saved localStorage theme preference', async () => {
      localStorage.setItem('tih-theme-id', 'default-dark');
      mockFetchForTheme();
      await act(async () => {
        await useThemeStore.getState().init();
      });
      expect(useThemeStore.getState().currentThemeId).toBe('default-dark');
    });

    it('should fall back to default when savedId is not in manifest', async () => {
      localStorage.setItem('tih-theme-id', 'nonexistent-theme');
      mockFetchForTheme();
      await act(async () => {
        await useThemeStore.getState().init();
      });
      expect(useThemeStore.getState().currentThemeId).toBe('default-light');
    });

    it('should set isLoaded to true even if fetch fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
      await act(async () => {
        await useThemeStore.getState().init();
      });
      expect(useThemeStore.getState().isLoaded).toBe(true);
      expect(useThemeStore.getState().currentThemeId).toBeNull();
    });
  });

  describe('setTheme', () => {
    it('should switch to an existing theme and persist to localStorage', async () => {
      mockFetchForTheme();
      act(() => {
        useThemeStore.setState({ availableThemes: mockManifest.themes });
      });
      await act(async () => {
        await useThemeStore.getState().setTheme('default-dark');
      });
      expect(useThemeStore.getState().currentThemeId).toBe('default-dark');
      expect(localStorage.getItem('tih-theme-id')).toBe('default-dark');
    });

    it('should not change currentThemeId when theme id is not in manifest', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      act(() => {
        useThemeStore.setState({
          availableThemes: mockManifest.themes,
          currentThemeId: 'default-light',
        });
      });
      await act(async () => {
        await useThemeStore.getState().setTheme('unknown-theme');
      });
      expect(useThemeStore.getState().currentThemeId).toBe('default-light');
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('unknown-theme'));
    });

    it('should call fetch with the correct theme file path', async () => {
      mockFetchForTheme();
      act(() => {
        useThemeStore.setState({ availableThemes: mockManifest.themes });
      });
      await act(async () => {
        await useThemeStore.getState().setTheme('default-dark');
      });
      expect(fetch).toHaveBeenCalledWith('/themes/default-dark.json');
    });
  });
});
