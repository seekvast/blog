import { createApi } from './factory'
import type { Discussion } from '@/types'
import { http } from './http'

const options = { prefix: '/api' }
// 创建基础客户端 API 实例
const baseApi = createApi(options)

export const clientApi = {
  ...baseApi,
  discussions: {
    ...baseApi.discussions,
    // 重写特定方法
    get: (slug: string) =>
        http.get<Discussion>(`${options.prefix}/discussions/${slug}`, undefined),
  }
}
