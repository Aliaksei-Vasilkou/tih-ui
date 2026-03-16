import type { AxiosResponse } from 'axios'
import apiClient from './client'
import type { Question, QuestionCreateRequest, PageResponse, BatchUploadResponse } from '@/types'

const unwrap = <T>(r: AxiosResponse<T>) => r.data

export const questionsApi = {
  getAll: (params?: {
    languageId?: number | null
    categoryId?: number | null
    page?: number
    size?: number
  }) =>
    apiClient
      .get<PageResponse<Question>>('/questions', { params })
      .then(unwrap<PageResponse<Question>>),

  search: (params: {
    q?: string
    languageId?: number | null
    categoryId?: number | null
    page?: number
    size?: number
  }) =>
    apiClient
      .get<PageResponse<Question>>('/questions/search', { params })
      .then(unwrap<PageResponse<Question>>),

  getById: (id: number) =>
    apiClient.get<Question>(`/questions/${id}`).then(unwrap<Question>),

  create: (data: QuestionCreateRequest) =>
    apiClient.post<Question>('/questions', data).then(unwrap<Question>),

  update: (id: number, data: QuestionCreateRequest) =>
    apiClient.put<Question>(`/questions/${id}`, data).then(unwrap<Question>),

  delete: (id: number) =>
    apiClient.delete(`/questions/${id}`),

  batchUpload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient
      .post<BatchUploadResponse>('/batch/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrap<BatchUploadResponse>)
  },
}
