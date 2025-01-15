import { getSession, signOut } from "next-auth/react";

interface RequestOptions extends RequestInit {
  auth?: boolean;  // 是否需要认证
  raw?: boolean;   // 是否返回原始响应
  params?: Record<string, any>; // 查询参数
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
    raw = false,  // 默认返回处理后的数据
    params,
    ...init
  } = options;

  // 处理 URL
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  const url = endpoint.startsWith('http') ? endpoint : `${baseURL}${endpoint}`;

  // 如果需要认证，获取 session
  if (auth) {
    const session = await getSession();
    if (session?.accessToken) {
      init.headers = {
        ...init.headers,
        Authorization: `Bearer ${session.accessToken}`,
      };
    }
  }

  // 设置默认 headers
  init.headers = {
    Accept: 'application/json',
    ...(!(init.body instanceof FormData) && {
      'Content-Type': 'application/json'
    }),
    ...init.headers,
  };

  try {
    const response = await fetch(url, init);
    
    // 如果需要原始响应，直接返回
    if (raw) {
      return response as T;
    }
    console.log('Response Status.................:', url, response);
    const data = await response.json();

    // 处理业务错误
    if (data.code > 0) {
      throw new RequestError(
        typeof data.message === 'string' ? data.message : JSON.stringify(data.message),
        response.status,
        data.code
      );
    }

    // 处理 HTTP 错误
    if (!response.ok) {
      throw new RequestError(
        data.message || response.statusText,
        response.status,
        data.code
      );
    }

    // 处理登录过期
    if (data.code === 401) {
      await signOut({ redirect: true });
      throw new RequestError('登录已过期，请重新登录', 401);
    }

    return data;
  } catch (error: any) {
    if (error instanceof RequestError) {
      throw error;
    }
    throw new RequestError(error.message);
  }
}

// 导出便捷方法
export const http = {
  async get<T = any>(endpoint: string, options?: RequestOptions) {
    return request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  },

  async post(endpoint: string, data?: any, options?: RequestOptions) {
    const headers: Record<string, string> = {};
    let body: string | FormData = JSON.stringify(data);

    // 如果是 FormData，不设置 Content-Type，让浏览器自动设置
    if (data instanceof FormData) {
      body = data;
    } else {
      headers['Content-Type'] = 'application/json';
    }

    return request(endpoint, {
      method: 'POST',
      body,
      headers,
      ...options,
    });
  },

  async put(endpoint: string, data?: any, options?: RequestOptions) {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  },

  async delete(endpoint: string, options?: RequestOptions) {
    return request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  },
};
