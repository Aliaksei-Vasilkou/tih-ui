// ──────────────────────────────────────────────
// Domain models (mirror backend DTOs)
// ──────────────────────────────────────────────

export interface Language {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Category {
  id: number;
  name: string;
  languageId: number;
  languageName: string;
  languageCode: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Tag {
  id: number;
  name: string;
  languageId: number;
  languageName: string;
  languageCode: string;
}

export interface Question {
  id: number;
  questionText: string;
  answerContent: string;
  languageId: number;
  languageName: string;
  languageCode: string;
  categoryId: number;
  categoryName: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ──────────────────────────────────────────────
// Request / response shapes
// ──────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface QuestionCreateRequest {
  questionText: string;
  answerContent: string;
  languageId: number;
  categoryId: number;
  tagIds?: number[];
}

export interface LanguageCreateRequest {
  name: string;
  code: string;
}

export interface CategoryCreateRequest {
  name: string;
  languageId: number;
}

export interface TagCreateRequest {
  name: string;
}

export interface BatchUploadResponse {
  totalItems: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  errors: string[];
  skipped: string[];
}

/** Unified import/export format — mirrors QuestionTransferItem on the backend */
export interface QuestionTransferItem {
  extId?: string;
  question: string;
  answer: string;
  language: string;
  category: string;
  tags: string[];
}

// ──────────────────────────────────────────────
// UI — Home screen mode definitions
// ──────────────────────────────────────────────

import type { ComponentType } from 'react';

export type LevelTag = 'L1' | 'L2' | 'L3' | 'L4';

export interface LevelOption {
  label: string;
  tag: LevelTag | null;
}

export interface ModeDefinition {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  route: string;
  status: 'active' | 'coming-soon';
}

// ──────────────────────────────────────────────
// UI state
// ──────────────────────────────────────────────

export interface FilterState {
  selectedLanguageId: number | null;
  selectedCategoryId: number | null;
  setLanguage: (id: number | null) => void;
  setCategory: (id: number | null) => void;
  reset: () => void;
}
