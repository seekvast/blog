import type { CacheOptions } from './types'

interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number
}

class Cache {
  private storage: Map<string, CacheItem>
  private maxSize: number

  constructor(maxSize = 100) {
    this.storage = new Map()
    this.maxSize = maxSize
    this.startCleanup()
  }

  set<T>(key: string, data: T, ttl = 5 * 60 * 1000): void {
    // 如果缓存已满，删除最旧的项
    if (this.storage.size >= this.maxSize) {
      const oldestKey = this.storage.keys().next().value
      this.storage.delete(oldestKey)
    }

    this.storage.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.storage.get(key)

    if (!item) {
      return null
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.storage.delete(key)
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    return this.storage.has(key)
  }

  delete(key: string): void {
    this.storage.delete(key)
  }

  clear(): void {
    this.storage.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.storage.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.storage.delete(key)
      }
    }
  }

  private startCleanup(): void {
    setInterval(() => this.cleanup(), 60 * 1000) // 每分钟清理一次
  }
}

// 创建全局缓存实例
const globalCache = new Cache()

export function clearCache() {
  globalCache.clear()
}

export function removeCached(key: string) {
  globalCache.delete(key)
}

export function generateCacheKey(
  endpoint: string,
  params?: Record<string, any>
): string {
  return `${endpoint}:${params ? JSON.stringify(params) : ''}`
}

export async function withCache<T>(
  request: () => Promise<T>,
  options: CacheOptions
): Promise<T> {
  const cachedData = globalCache.get<T>(options.key)
  if (cachedData) {
    return cachedData
  }

  const data = await request()
  globalCache.set(options.key, data, options.ttl)
  return data
}
