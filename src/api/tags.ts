import type { AxiosResponse } from 'axios'
import apiClient from './client'
import type { Tag, TagCreateRequest } from '@/types'

const unwrap = <T>(r: AxiosResponse<T>) => r.data

export const tagsApi = {
  getAll: (languageId: number) =>
    apiClient
      .get<Tag[]>(`/languages/${languageId}/tags`)
      .then(unwrap<Tag[]>),

  create: (languageId: number, data: TagCreateRequest) =>
    apiClient
      .post<Tag>(`/languages/${languageId}/tags`, data)
      .then(unwrap<Tag>),

  update: (languageId: number, id: number, data: TagCreateRequest) =>
    apiClient
      .put<Tag>(`/languages/${languageId}/tags/${id}`, data)
      .then(unwrap<Tag>),

  delete: (languageId: number, id: number) =>
    apiClient.delete(`/languages/${languageId}/tags/${id}`),
}
