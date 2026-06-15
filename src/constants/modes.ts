import { BookOpen, Code2, Zap } from 'lucide-react';

import type { LevelOption, ModeDefinition } from '@/types';

export const MODES: ModeDefinition[] = [
  {
    id: 'prepare',
    title: 'Prepare',
    description: 'Browse and search interview questions by topic and language. Study at your own pace.',
    icon: BookOpen,
    route: '/prepare',
    status: 'active',
  },
  {
    id: 'practice',
    title: 'Practice',
    description: 'Reinforce your knowledge with spaced repetition and interactive Q&A sessions.',
    icon: Code2,
    route: '/practice',
    status: 'coming-soon',
  },
  {
    id: 'hack',
    title: 'Hack',
    description: 'Challenge yourself with timed coding exercises and get instant feedback.',
    icon: Zap,
    route: '/hack',
    status: 'coming-soon',
  },
];

export const LEVEL_OPTIONS: LevelOption[] = [
  { label: 'All', tag: null },
  { label: 'Junior', tag: 'L1' },
  { label: 'Middle', tag: 'L2' },
  { label: 'Senior', tag: 'L3' },
  { label: 'Lead', tag: 'L4' },
];
