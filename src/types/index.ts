// ──────────────────────────────────────────────
// Domain models (mirror backend DTOs)
// ──────────────────────────────────────────────

export interface Language {
  id: number
  name: string
  code: string
  active: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface Category {
  id: number
  name: string
  languageId: number
  languageName: string
  languageCode: string
  active: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface Question {
  id: number
  questionText: string
  answerContent: string
  languageId: number
  languageName: string
  languageCode: string
  categoryId: number
  categoryName: string
  active: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

// ──────────────────────────────────────────────
// Request / response shapes
// ──────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface QuestionCreateRequest {
  questionText: string
  answerContent: string
  languageId: number
  categoryId: number
}

export interface LanguageCreateRequest {
  name: string
  code: string
}

export interface CategoryCreateRequest {
  name: string
  languageId: number
}

export interface BatchUploadResponse {
  totalItems: number
  successCount: number
  failureCount: number
  errors: string[]
}

// ──────────────────────────────────────────────
// UI state
// ──────────────────────────────────────────────

export interface FilterState {
  selectedLanguageId: number | null
  selectedCategoryId: number | null
  setLanguage: (id: number | null) => void
  setCategory: (id: number | null) => void
  reset: () => void
}
