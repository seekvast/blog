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

export interface Response<T> {
  code: number;
  data: T;
  message: string;
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
  slug?: string;
  sort?: string;
  name?: string;
  keyword?: string;
  order?: SortOrder;
  search?: string;
  per_page?: number;
  page?: number;
  category_id?: number;
  board_child_id?: number;
  board_id?: number;
  user_hashid?: string;
  q?: string;
}

export interface Attachment {
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  visibility: string;
  attachment_type: string;
  updated_at: string;
  created_at: string;
  id: number;
  host: string;
  url: string;
}

export type UploadResponse = Response<Attachment>;
