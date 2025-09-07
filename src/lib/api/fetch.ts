import { getSession } from "@/lib/auth";
import { ApiResponse, FetchOptions, ApiError } from "./types";
import {
  runRequestInterceptors,
  runResponseInterceptors,
  runResponseDataInterceptors,
} from "./interceptor";
import { getBaseUrl, API_CONFIG } from "./config";

const { DEFAULT_RETRY, DEFAULT_TIMEOUT } = API_CONFIG;

async function createHeaders(
  options: FetchOptions,
  isServer: boolean
): Promise<Headers> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (isServer) {
    const session = await getSession();
    if (session?.user?.token) {
      headers.set("Authorization", `Bearer ${session.user.token}`);
    }
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

    const error = new Error() as ApiError;
    error.status = interceptedResponse.status;
    error.data = errorData;

    if (typeof errorData.message === "object") {
      error.message = Object.entries(errorData.message)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
    } else if (errorData.error) {
      error.message = errorData.error;
      error.code = errorData.code;
    } else {
      error.message =
        errorData.message ||
        `HTTP error! status: ${interceptedResponse.status}`;
    }
    throw error;
  }

  const contentType = interceptedResponse.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null as T;
  }

  const data: ApiResponse<T> = await interceptedResponse.json();
  const interceptedData = await runResponseDataInterceptors(data);

  if (interceptedData.code !== 0) {
    const error = new Error() as ApiError;
    error.code = interceptedData.code;
    error.data = interceptedData.data;

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

  const isServer = typeof window === "undefined";
  const baseUrl = getBaseUrl(isServer);
  const urlPath = `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const url = isServer
    ? new URL(urlPath)
    : new URL(urlPath, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  const headers = await createHeaders(restOptions, isServer);
  const interceptedOptions = await runRequestInterceptors(endpoint, {
    ...restOptions,
    headers,
  });

  let lastError: Error | null = null;
  let attempts = 0;

  while (attempts < retry) {
    try {
      const response = await Promise.race([
        fetch(url.toString(), interceptedOptions),
        timeoutPromise(timeout),
      ]);

      return await handleResponse<T>(response);
    } catch (error) {
      lastError = error as Error;
      attempts++;

      const apiError = error as ApiError;
      if (
        attempts === retry ||
        apiError.status === 401 ||
        apiError.status === 403 ||
        apiError.status === 422 ||
        (apiError.status && apiError.status >= 500 && apiError.status < 600)
      ) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempts) * 1000)
      );
    }
  }

  throw lastError;
}
