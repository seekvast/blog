import { getSession } from "next-auth/react";
import { ApiResponse, FetchOptions, ApiError } from "./types";
import {
  runRequestInterceptors,
  runResponseInterceptors,
  runResponseDataInterceptors,
} from "./interceptor";
import { getBaseUrl, API_CONFIG } from './config';

const { DEFAULT_RETRY, DEFAULT_TIMEOUT } = API_CONFIG;

async function createHeaders(options: FetchOptions): Promise<Headers> {
  const session = await getSession();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.user?.token) {
    headers.set("Authorization", `Bearer ${session.user.token}`);
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const interceptedResponse = await runResponseInterceptors(response);
  if (!interceptedResponse.ok) {
    let errorData;
    try {
      errorData = await interceptedResponse.json();
    } catch (e) {
      const error = new Error(
        `HTTP error! status: ${interceptedResponse.status}`
      ) as ApiError;
      error.status = interceptedResponse.status;
      throw error;
    }

    // 处理错误响应
    const error = new Error() as ApiError;
    error.status = interceptedResponse.status;
    error.data = errorData;

    // 如果错误消息是对象，将其转换为字符串
    if (typeof errorData.message === "object") {
      error.message = Object.entries(errorData.message)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
    } else {
      error.message =
        errorData.message ||
        `HTTP error! status: ${interceptedResponse.status}`;
    }

    throw error;
  }

  const data: ApiResponse<T> = await interceptedResponse.json();
  const interceptedData = await runResponseDataInterceptors(data);
  if (interceptedData.code !== 0) {
    const error = new Error() as ApiError;
    error.code = interceptedData.code;
    error.data = interceptedData.data;

    // 如果错误消息是对象，将其转换为字符串
    if (typeof interceptedData.message === "object") {
      error.message = Object.entries(interceptedData.message)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
    } else {
      error.message = interceptedData.message || "操作失败";
    }

    throw error;
  }

  return interceptedData.data;
}

async function timeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${ms}ms`));
    }, ms);
  });
}

export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    params,
    retry = DEFAULT_RETRY,
    timeout = DEFAULT_TIMEOUT,
    ...restOptions
  } = options;

  // 处理 URL
  const isServer = typeof window === 'undefined';
  const baseUrl = getBaseUrl(isServer);

  // 在服务端必须使用完整 URL，在客户端可以使用相对路径
  const url = isServer
    ? new URL(endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`)
    : new URL(endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`, window.location.origin);
  // 添加查询参数
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
console.log(url, 'fetch,url.........................')
  // 创建请求选项
  const headers = await createHeaders(restOptions);
  const interceptedOptions = await runRequestInterceptors({
    ...restOptions,
    headers,
  });

  let lastError: Error | null = null;
  let attempts = 0;

  while (attempts < retry) {
    try {
      // 发起请求
      const response = await Promise.race([
        fetch(url.toString(), interceptedOptions),
        timeoutPromise(timeout),
      ]);

      return await handleResponse<T>(response);
    } catch (error) {
      lastError = error as Error;
      attempts++;

      // 如果是最后一次尝试或者是不需要重试的错误，直接抛出
      if (
        attempts === retry ||
        (error as ApiError).status === 401 ||
        (error as ApiError).status === 403 ||
        (error as ApiError).status === 422
      ) {
        throw error;
      }

      // 等待一段时间后重试
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempts) * 1000)
      );
    }
  }

  throw lastError;
}
