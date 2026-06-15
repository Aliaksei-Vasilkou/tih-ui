import { describe, expect, it } from 'vitest';

import type { Tag } from '@/types';

import { sortTagNames, sortTags } from './tagOrdering';

const mockTags: Tag[] = [
  { id: 2, name: 'beginner', languageId: 1, languageName: 'JavaScript', languageCode: 'javascript' },
  { id: 4, name: 'algorithms', languageId: 1, languageName: 'JavaScript', languageCode: 'javascript' },
  { id: 3, name: 'L3', languageId: 1, languageName: 'JavaScript', languageCode: 'javascript' },
  { id: 1, name: 'L1', languageId: 1, languageName: 'JavaScript', languageCode: 'javascript' },
];

describe('sortTagNames', () => {
  it('sorts level tags first in L1-L4 order and other tags alphabetically', () => {
    expect(sortTagNames(['beginner', 'algorithms', 'L3', 'L1'])).toEqual(['L1', 'L3', 'algorithms', 'beginner']);
  });
});

describe('sortTags', () => {
  it('sorts tag objects by the same display order', () => {
    expect(sortTags(mockTags).map((tag) => tag.name)).toEqual(['L1', 'L3', 'algorithms', 'beginner']);
  });
});
