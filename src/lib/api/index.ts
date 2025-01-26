import { serverApi } from './server'
import { clientApi } from './client'

// 导出基础功能
export * from './types'
export * from './fetch'
export * from './interceptor'
export * from './cache'
export * from './error-middleware'
export { http } from './http'

// 导出 API 工厂
export { createApi } from './factory'

// 导出一些常用的工具函数
export { clearCache, removeCached } from './cache'
export { errorMiddleware } from './error-middleware'
export { interceptors } from './interceptor'

// 根据环境导出适当的 API 客户端
export { serverApi } from './server'
export { clientApi } from './client'

// 自动选择合适的 API 客户端
const isServer = typeof window === 'undefined'
export const api = isServer ? serverApi : clientApi
