type CacheItem<T> = {
  data: T
  timestamp: number
  ttl: number
}

class Cache {
  private cache: Map<string, CacheItem<any>>
  private maxSize: number

  constructor(maxSize = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // 清理过期项
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// 创建全局缓存实例
export const globalCache = new Cache()

// 定期清理过期缓存
setInterval(() => {
  globalCache.cleanup()
}, 60 * 1000) // 每分钟清理一次
