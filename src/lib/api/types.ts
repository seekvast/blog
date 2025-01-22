export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiError extends Error {
  code?: number;
  status?: number;
  data?: any;
}

export interface FetchOptions extends RequestInit {
  params?: Record<string, any>;
  retry?: number;
  timeout?: number;
}

export type ApiResult<T> = Promise<T>;

export interface RequestInterceptor {
  (options: FetchOptions): Promise<FetchOptions> | FetchOptions;
}

export interface ResponseInterceptor {
  (response: Response): Promise<Response> | Response;
}

export interface ResponseDataInterceptor {
  (data: ApiResponse): Promise<ApiResponse> | ApiResponse;
}

export interface CacheOptions {
  key: string;
  ttl?: number;
}
