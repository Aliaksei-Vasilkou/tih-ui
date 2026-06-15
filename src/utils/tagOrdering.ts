import type { LevelTag, Tag } from '@/types';

const LEVEL_TAG_ORDER: Record<LevelTag, number> = {
  L1: 0,
  L2: 1,
  L3: 2,
  L4: 3,
};

function getLevelTagOrder(tagName: string): number | null {
  const normalizedName = tagName.trim().toUpperCase() as LevelTag;

  return normalizedName in LEVEL_TAG_ORDER ? LEVEL_TAG_ORDER[normalizedName] : null;
}

function compareTagNames(a: string, b: string): number {
  const aLevelOrder = getLevelTagOrder(a);
  const bLevelOrder = getLevelTagOrder(b);

  if (aLevelOrder !== null && bLevelOrder !== null) {
    return aLevelOrder - bLevelOrder;
  }

  if (aLevelOrder !== null) {
    return -1;
  }

  if (bLevelOrder !== null) {
    return 1;
  }

  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

export function sortTagNames(tagNames: string[]): string[] {
  return [...tagNames].sort(compareTagNames);
}

export function sortTags(tags: Tag[]): Tag[] {
  return [...tags].sort((a, b) => compareTagNames(a.name, b.name));
}
