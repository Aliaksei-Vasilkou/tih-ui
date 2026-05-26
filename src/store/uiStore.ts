import { create } from 'zustand';

interface UIState {
  showUpload: boolean;
  toggleUpload: () => void;
  setShowUpload: (value: boolean) => void;
  showExport: boolean;
  toggleExport: () => void;
  setShowExport: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showUpload: false,
  toggleUpload: () => set((s) => ({ showUpload: !s.showUpload, showExport: false })),
  setShowUpload: (value) => set({ showUpload: value }),
  showExport: false,
  toggleExport: () => set((s) => ({ showExport: !s.showExport, showUpload: false })),
  setShowExport: (value) => set({ showExport: value }),
}));
