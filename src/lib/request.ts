import { getSession, signOut } from "next-auth/react";

interface RequestOptions extends RequestInit {
  auth?: boolean;  // 是否需要认证
  raw?: boolean;   // 是否返回原始响应
  token?: string;  // 可选的认证 token
}

interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

class RequestError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: number
  ) {
    super(message);
    this.name = 'RequestError';
  }
}

export async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    auth = true,  // 默认需要认证
    raw = false,  // 默认不返回原始响应
    token,        // 从选项中获取 token
    headers = {},
    ...rest
  } = options;

  // 构建完整的 URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  // 准备请求头
  const defaultHeaders: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  // 如果需要认证，添加 token
  if (auth) {
    if (!token) {
      throw new RequestError('未提供访问令牌', 401);
    }
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...rest,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    });

    // 如果需要原始响应，直接返回
    if (raw) {
      return response as any;
    }

    // 处理非 JSON 响应
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new RequestError('服务器返回了非 JSON 格式的数据', response.status);
    }

    const data: ApiResponse<T> = await response.json();

    // 处理业务错误
    if (data.code !== 0) {
      throw new RequestError(data.message || '请求失败', response.status, data.code);
    }

    // 处理 HTTP 错误
    if (!response.ok) {
      throw new RequestError(data.message || '请求失败', response.status, data.code);
    }

    // 处理登录过期
    if (data.code === 401 || response.status === 401) {
      await signOut({ redirect: true, callbackUrl: '/login' });
      throw new RequestError('登录已过期，请重新登录', 401);
    }

    return data.data;
  } catch (error) {
    if (error instanceof RequestError) {
      throw error;
    }
    throw new RequestError(
      error instanceof Error ? error.message : '网络请求失败'
    );
  }
}

// 导出便捷方法
export const http = {
  get: <T = any>(endpoint: string, token?: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'GET', token, ...options }),

  post: <T = any>(endpoint: string, data?: any, token?: string, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
      ...options,
    }),

  put: <T = any>(endpoint: string, data?: any, token?: string, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
      ...options,
    }),

  delete: <T = any>(endpoint: string, token?: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'DELETE', token, ...options }),
};
