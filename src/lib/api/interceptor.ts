import type { 
  RequestInterceptor, 
  ResponseInterceptor,
  ResponseDataInterceptor,
  FetchOptions,
  ApiResponse
} from './types'

const requestInterceptors: RequestInterceptor[] = []
const responseInterceptors: ResponseInterceptor[] = []
const responseDataInterceptors: ResponseDataInterceptor[] = []

export const interceptors = {
  request: requestInterceptors,
  response: responseInterceptors,
  responseData: responseDataInterceptors
}

export function addRequestInterceptor(interceptor: RequestInterceptor) {
  requestInterceptors.push(interceptor)
}

export function addResponseInterceptor(interceptor: ResponseInterceptor) {
  responseInterceptors.push(interceptor)
}

export function addResponseDataInterceptor(interceptor: ResponseDataInterceptor) {
  responseDataInterceptors.push(interceptor)
}

export async function runRequestInterceptors(options: FetchOptions): Promise<FetchOptions> {
  let interceptedOptions = { ...options }
  
  for (const interceptor of requestInterceptors) {
    interceptedOptions = await interceptor(interceptedOptions)
  }
  
  return interceptedOptions
}

export async function runResponseInterceptors(response: Response): Promise<Response> {
  let interceptedResponse = response
  
  for (const interceptor of responseInterceptors) {
    interceptedResponse = await interceptor(interceptedResponse)
  }
  
  return interceptedResponse
}

export async function runResponseDataInterceptors(data: ApiResponse): Promise<ApiResponse> {
  let interceptedData = { ...data }
  
  for (const interceptor of responseDataInterceptors) {
    interceptedData = await interceptor(interceptedData)
  }
  
  return interceptedData
}

// 添加默认拦截器
addRequestInterceptor(async (options) => {
  // 处理查询参数
  if (options.params) {
    const baseUrl = typeof window !== 'undefined' ? window.location.href : '';
    const url = new URL(baseUrl);
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
    options.params = undefined; // Clear params after processing
  }
  return options
})

// 添加响应拦截器
addResponseInterceptor(async (response) => {
  // 可以在这里处理通用响应逻辑
  return response
})

// 添加响应数据拦截器
addResponseDataInterceptor(async (data) => {
  // 可以在这里处理通用数据转换
  return data
})
