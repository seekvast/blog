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

export class ServerError extends Error implements ApiError {
  status?: number;
  code?: number;
  data?: any;

  constructor(
    message: string,
    options?: { status?: number; code?: number; data?: any }
  ) {
    super(message);
    this.name = "ServerError";
    this.status = options?.status;
    this.code = options?.code;
    this.data = options?.data;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      data: this.data,
    };
  }
}

export function createServerError(
  message: string,
  options?: { status?: number; code?: number; data?: any }
): ServerError {
  return new ServerError(message, options);
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
