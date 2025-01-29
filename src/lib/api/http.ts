import { fetchApi } from './fetch'
import type { FetchOptions, ApiResult } from './types'
import { withCache, generateCacheKey } from './cache'
import { handleApiError } from './error-middleware'

interface ApiOptions extends FetchOptions {
  useCache?: boolean
  ttl?: number
}

async function handleRequest<T>(
  promise: Promise<T>,
  options?: ApiOptions
): Promise<T> {
  try {
    return await promise
  } catch (error) {
    await handleApiError(error)
    throw error
  }
}

const get = <T>(
  endpoint: string,
  params?: Record<string, any>,
  options: ApiOptions = {}
): ApiResult<T> => {
  const { useCache, ttl, ...fetchOptions } = options
  const request = () => fetchApi<T>(endpoint, { ...fetchOptions, params })

  if (useCache) {
    const cacheKey = generateCacheKey(endpoint, params)
    return handleRequest(
      withCache(request, { key: cacheKey, ttl }),
      options
    )
  }

  return handleRequest(request(), options)
}

const post = <T>(
  endpoint: string,
  data?: any,
  options: ApiOptions = {}
): ApiResult<T> =>
  handleRequest(
    fetchApi<T>(endpoint, {
      ...options,
      method: 'POST',
      headers: {
        ...(!(data instanceof FormData) && {
          'Content-Type': 'application/json'
        }),
        ...options.headers
      },
      body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    options
  )

const put = <T>(
  endpoint: string,
  data?: any,
  options: ApiOptions = {}
): ApiResult<T> =>
  handleRequest(
    fetchApi<T>(endpoint, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    }),
    options
  )

const delete_ = <T>(
  endpoint: string,
  options: ApiOptions = {}
): ApiResult<T> =>
  handleRequest(
    fetchApi<T>(endpoint, { 
      ...options,
      method: 'DELETE' 
    }),
    options
  )

const patch = <T>(
  endpoint: string,
  data?: any,
  options: ApiOptions = {}
): ApiResult<T> =>
  handleRequest(
    fetchApi<T>(endpoint, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    }),
    options
  )

export const http = {
  get,
  post,
  put,
  delete: delete_,
  patch
}

export const api = http
