import { create } from 'zustand'

interface UIState {
  showUpload: boolean
  toggleUpload: () => void
  setShowUpload: (value: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  showUpload: false,
  toggleUpload: () => set((s) => ({ showUpload: !s.showUpload })),
  setShowUpload: (value) => set({ showUpload: value }),
}))
