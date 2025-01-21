export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface BaseModel {
  id: number
  createdAt: string
  updatedAt: string
}

export interface User extends BaseModel {
  username: string
  email: string
  avatar?: string
  role: 'user' | 'admin'
}

export interface Tag extends BaseModel {
  name: string
  slug: string
  description?: string
}

export interface Category extends BaseModel {
  name: string
  slug: string
  description?: string
  parentId?: number
}

export type SortOrder = 'asc' | 'desc'

export interface QueryParams extends PaginationParams {
  sort?: string
  order?: SortOrder
  search?: string
}
