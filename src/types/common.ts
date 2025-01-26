export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface Pagination<T> {
  code: number;

  items: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;

  message: string;
}

export interface BaseModel {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseModel {
  username: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
}

export interface Tag extends BaseModel {
  name: string;
  slug: string;
  description?: string;
}

export interface Category extends BaseModel {
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
}

export type SortOrder = "asc" | "desc";

export interface QueryParams extends PaginationParams {
  sort?: string;
  name?: string;
  keyword?: string;
  order?: SortOrder;
  search?: string;
  per_page?: number;
  page?: number;
}
