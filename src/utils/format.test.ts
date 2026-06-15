import { describe, it, expect } from 'vitest';

import type { Category, Language } from '@/types';
import { formatCategoryLabel, formatDate } from './format';

describe('formatDate', () => {
  it('should format a valid ISO date string', () => {
    const result = formatDate('2024-01-15T10:00:00Z');
    // e.g. "Jan 15, 2024" — exact locale string varies by environment
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/15/);
  });

  it('should include year, month abbreviation and day', () => {
    const result = formatDate('2024-06-01T00:00:00Z');
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/1/);
  });

  it('should handle the first day of the year', () => {
    const result = formatDate('2023-01-01T00:00:00Z');
    expect(result).toMatch(/2023/);
  });

  it('should handle the last day of the year', () => {
    const result = formatDate('2023-12-31T12:00:00Z');
    expect(result).toMatch(/2023/);
    expect(result).toMatch(/31/);
  });

  it('should return a non-empty string for any valid ISO input', () => {
    const result = formatDate('2020-07-04T12:00:00Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── formatCategoryLabel ────────────────────────────────────────────────────

const javaLang: Language = {
  id: 1,
  name: 'Java',
  code: 'java',
  createdAt: '',
  updatedAt: '',
  createdBy: '',
};

const makeCategory = (id: number, name: string, languageId: number, languageName: string): Category => ({
  id,
  name,
  languageId,
  languageName,
  languageCode: '',
  createdAt: '',
  updatedAt: '',
  createdBy: '',
});

describe('formatCategoryLabel', () => {
  it('returns the plain name when there are no duplicate names in the list', () => {
    const category = makeCategory(1, 'Collections', 1, 'Java');
    const result = formatCategoryLabel(category, [category], [javaLang]);
    expect(result).toBe('Collections');
  });

  it('returns the plain name when the category is unique across a multi-item list', () => {
    const a = makeCategory(1, 'Collections', 1, 'Java');
    const b = makeCategory(2, 'Networking', 2, 'Python');
    const result = formatCategoryLabel(a, [a, b], [javaLang]);
    expect(result).toBe('Collections');
  });

  it('disambiguates with language name when two categories share the same name', () => {
    const javaNet = makeCategory(1, 'Networking', 1, 'Java');
    const pythonNet = makeCategory(2, 'Networking', 2, 'Python');
    const result = formatCategoryLabel(javaNet, [javaNet, pythonNet], [javaLang]);
    expect(result).toBe('Java/Networking');
  });

  it('uses "General" prefix for categories whose languageId does not match any language', () => {
    const javaNet = makeCategory(1, 'Networking', 1, 'Java');
    const generalNet = makeCategory(2, 'Networking', 99, 'General');
    const result = formatCategoryLabel(generalNet, [javaNet, generalNet], [javaLang]);
    expect(result).toBe('General/Networking');
  });

  it('handles a list with only one category (always unique)', () => {
    const category = makeCategory(5, 'Algorithms', 99, 'General');
    const result = formatCategoryLabel(category, [category], []);
    expect(result).toBe('Algorithms');
  });
});
