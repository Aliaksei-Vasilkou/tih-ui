import { create } from 'zustand';
import type { FilterState } from '@/types';

export const useFilterStore = create<FilterState>((set) => ({
  selectedLanguageId: null,
  selectedCategoryId: null,
  setLanguage: (id) => set({ selectedLanguageId: id, selectedCategoryId: null }),
  setCategory: (id) => set({ selectedCategoryId: id }),
  reset: () => set({ selectedLanguageId: null, selectedCategoryId: null }),
}));
