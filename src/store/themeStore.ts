import { create } from 'zustand'
import type { ThemeManifestEntry } from '@/themes/types'
import { loadManifest, loadTheme } from '@/themes/applyTheme'

const THEME_STORAGE_KEY = 'tih-theme-id'

interface ThemeState {
  currentThemeId: string | null
  availableThemes: ThemeManifestEntry[]
  isLoaded: boolean
  init: () => Promise<void>
  setTheme: (id: string) => Promise<void>
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentThemeId: null,
  availableThemes: [],
  isLoaded: false,

  init: async () => {
    try {
      const manifest = await loadManifest()
      set({ availableThemes: manifest.themes })

      // Use saved preference or default from manifest
      const savedId = localStorage.getItem(THEME_STORAGE_KEY)
      const targetId = savedId && manifest.themes.some((t) => t.id === savedId)
        ? savedId
        : manifest.defaultThemeId

      const entry = manifest.themes.find((t) => t.id === targetId)
      if (entry) {
        await loadTheme(entry.file)
        set({ currentThemeId: targetId, isLoaded: true })
      }
    } catch (error) {
      console.error('Failed to initialize theme:', error)
      // App still works with CSS defaults embedded in index.css
      set({ isLoaded: true })
    }
  },

  setTheme: async (id: string) => {
    const { availableThemes } = get()
    const entry = availableThemes.find((t) => t.id === id)
    if (!entry) {
      console.warn(`Theme "${id}" not found in manifest`)
      return
    }
    try {
      await loadTheme(entry.file)
      localStorage.setItem(THEME_STORAGE_KEY, id)
      set({ currentThemeId: id })
    } catch (error) {
      console.error(`Failed to switch to theme "${id}":`, error)
    }
  },
}))
