import { createApi } from './factory'

// 服务端 API 实例
export const serverApi = createApi({
    prefix: '/api', next: { revalidate: 3600 }  // 使用 Next.js 缓存
})
