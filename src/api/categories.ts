import type { AxiosResponse } from 'axios'
import apiClient from './client'
import type { Category, CategoryCreateRequest } from '@/types'

const unwrap = <T>(r: AxiosResponse<T>) => r.data

export const categoriesApi = {
  getAll: (languageId?: number) =>
    apiClient
      .get<Category[]>('/categories', { params: languageId ? { languageId } : {} })
      .then(unwrap<Category[]>),

  getById: (id: number) =>
    apiClient.get<Category>(`/categories/${id}`).then(unwrap<Category>),

  create: (data: CategoryCreateRequest) =>
    apiClient.post<Category>('/categories', data).then(unwrap<Category>),

  update: (id: number, data: CategoryCreateRequest) =>
    apiClient.put<Category>(`/categories/${id}`, data).then(unwrap<Category>),

  delete: (id: number) =>
    apiClient.delete(`/categories/${id}`),
}
