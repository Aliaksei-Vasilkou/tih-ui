import type { Category, Language } from '@/types';

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCategoryLabel(category: Category, allCategories: Category[], languages: Language[]): string {
  const hasDuplicate = allCategories.some((c) => c.id !== category.id && c.name === category.name);
  if (!hasDuplicate) return category.name;

  const isGeneralCategory = !languages.some((l) => l.id === category.languageId);
  const prefix = isGeneralCategory ? 'General' : category.languageName;
  return `${prefix}/${category.name}`;
}
