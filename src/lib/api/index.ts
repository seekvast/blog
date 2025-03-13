import { serverApi } from './server'
import { clientApi } from './client'

export * from './types'
export * from './fetch'
export * from './interceptor'
export * from './cache'
export * from './error-middleware'
export { http } from './http'

export { createApi } from './factory'

export { clearCache, removeCached } from './cache'
export { errorMiddleware } from './error-middleware'
export { interceptors } from './interceptor'

export { serverApi } from './server'
export { clientApi } from './client'

const isServer = typeof window === 'undefined'
export const api = isServer ? serverApi : clientApi
