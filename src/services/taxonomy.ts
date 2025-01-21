import { api } from '@/lib/api'
import type { 
  Category, 
  Tag, 
  PaginatedResponse,
  QueryParams 
} from '@/types/common'

interface CreateCategoryDto {
  name: string
  description?: string
  parentId?: number
}

interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  id: number
}

interface CreateTagDto {
  name: string
  description?: string
}

interface UpdateTagDto extends Partial<CreateTagDto> {
  id: number
}

export const categoryService = {
  getCategories: (params?: QueryParams) => 
    api.get<PaginatedResponse<Category>>('/categories', params),

  getAllCategories: () => 
    api.get<Category[]>('/categories/all', undefined, { useCache: true }),

  getCategory: (id: number) => 
    api.get<Category>(`/categories/${id}`),

  getCategoryBySlug: (slug: string) => 
    api.get<Category>(`/categories/slug/${slug}`),

  createCategory: (data: CreateCategoryDto) => 
    api.post<Category>('/categories', data),

  updateCategory: ({ id, ...data }: UpdateCategoryDto) => 
    api.patch<Category>(`/categories/${id}`, data),

  deleteCategory: (id: number) => 
    api.delete(`/categories/${id}`)
}

export const tagService = {
  getTags: (params?: QueryParams) => 
    api.get<PaginatedResponse<Tag>>('/tags', params),

  getAllTags: () => 
    api.get<Tag[]>('/tags/all', undefined, { useCache: true }),

  getTag: (id: number) => 
    api.get<Tag>(`/tags/${id}`),

  getTagBySlug: (slug: string) => 
    api.get<Tag>(`/tags/slug/${slug}`),

  createTag: (data: CreateTagDto) => 
    api.post<Tag>('/tags', data),

  updateTag: ({ id, ...data }: UpdateTagDto) => 
    api.patch<Tag>(`/tags/${id}`, data),

  deleteTag: (id: number) => 
    api.delete(`/tags/${id}`)
}
