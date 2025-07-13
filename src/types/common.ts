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
  icon?: string;
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
  username?: string;
  q?: string;
  from?: string;
  to?: string;
  poll_id?: number;
  discussion_slug?: string;
  hashid?: string;
  blocked_type?: "user" | "board";
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

export interface Board {
  id: number;
  hashid: string;
  name: string;
  slug: string;
  desc?: string;
  avatar?: string;
  visibility?: number;
  poll_role?: number[];
  badge_visible?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface BlacklistItem {
  id: number;
  user_hashid: string;
  blockable_hashid: string;
  blockable_type?: "App\\Models\\User" | "App\\Models\\Board";
  blockable: User | Board;
}
