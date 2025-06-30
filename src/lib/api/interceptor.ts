import type {
  RequestInterceptor,
  ResponseInterceptor,
  ResponseDataInterceptor,
  FetchOptions,
  ApiResponse,
} from "./types";
import { getSession } from "@/lib/auth";
import { ServerError } from "./types";
import { needsAuth, SKIP_ENDPOINTS } from "./auth-config";

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];
const responseDataInterceptors: ResponseDataInterceptor[] = [];

export const interceptors = {
  request: requestInterceptors,
  response: responseInterceptors,
  responseData: responseDataInterceptors,
};

export function addRequestInterceptor(interceptor: RequestInterceptor) {
  requestInterceptors.push(interceptor);
}

export function addResponseInterceptor(interceptor: ResponseInterceptor) {
  responseInterceptors.push(interceptor);
}

export function addResponseDataInterceptor(
  interceptor: ResponseDataInterceptor
) {
  responseDataInterceptors.push(interceptor);
}

export async function runRequestInterceptors(
  endpoint: string,
  options: FetchOptions
): Promise<FetchOptions> {
  let interceptedOptions = { ...options };

  // 添加认证检查拦截器
  const session = await getSession();
  if (!session && shouldSkipRequest(endpoint, options)) {
    interceptedOptions.skipRequest = true;
    return interceptedOptions;
  }

  for (const interceptor of requestInterceptors) {
    interceptedOptions = await interceptor(interceptedOptions);
  }

  return interceptedOptions;
}

export async function runResponseInterceptors(
  response: Response
): Promise<Response> {
  let interceptedResponse = response;

  for (const interceptor of responseInterceptors) {
    interceptedResponse = await interceptor(interceptedResponse);
  }

  return interceptedResponse;
}

export async function runResponseDataInterceptors(
  data: ApiResponse
): Promise<ApiResponse> {
  let interceptedData = { ...data };

  for (const interceptor of responseDataInterceptors) {
    interceptedData = await interceptor(interceptedData);
  }

  return interceptedData;
}

// 默认拦截器
addRequestInterceptor(async (options) => {
  // 处理查询参数
  if (options.params) {
    const baseUrl = typeof window !== "undefined" ? window.location.href : "";
    const url = new URL(baseUrl);
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    options.params = undefined;
  }
  return options;
});

// 响应拦截器
addResponseInterceptor(async (response) => {
  if (response.headers.get("X-User-Data-Changed") === "true") {
    if (typeof window === "undefined") {
      return response;
    }
    const { refreshUserData } = await import("@/lib/auth");
    refreshUserData().catch((error) => {
      console.error("刷新用户数据失败:", error);
    });
  }
  return response;
});

addResponseDataInterceptor(async (data) => {
  // 通用数据转换
  return data;
});

const shouldSkipRequest = (endpoint: string, options: FetchOptions) => {
  const method = options.method?.toUpperCase() || "GET";
  return SKIP_ENDPOINTS.paths.some(
    (skipPath) =>
      endpoint.startsWith(skipPath) &&
      (!SKIP_ENDPOINTS.methods || SKIP_ENDPOINTS.methods.includes(method))
  );
};
