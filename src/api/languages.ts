import type { AxiosResponse } from 'axios'
import apiClient from './client'
import type { Language, LanguageCreateRequest } from '@/types'

const unwrap = <T>(r: AxiosResponse<T>) => r.data

export const languagesApi = {
  getAll: () =>
    apiClient.get<Language[]>('/languages').then(unwrap<Language[]>),

  getById: (id: number) =>
    apiClient.get<Language>(`/languages/${id}`).then(unwrap<Language>),

  create: (data: LanguageCreateRequest) =>
    apiClient.post<Language>('/languages', data).then(unwrap<Language>),

  update: (id: number, data: LanguageCreateRequest) =>
    apiClient.put<Language>(`/languages/${id}`, data).then(unwrap<Language>),

  delete: (id: number) =>
    apiClient.delete(`/languages/${id}`),
}
