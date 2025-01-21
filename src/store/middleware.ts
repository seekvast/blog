import { StateCreator, StoreMutatorIdentifier } from 'zustand'

type Logger = <
  T extends unknown,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>

type PersistOptions = {
  name: string
  whitelist?: string[]
  blacklist?: string[]
}

export const logger: Logger = (f, name) => (set, get, store) => {
  type T = ReturnType<typeof f>
  
  const loggedSet: typeof set = (...a) => {
    const next = a[0]
    
    if (process.env.NODE_ENV === 'development') {
      console.group(
        `%c${name || 'store'} %c${new Date().toLocaleTimeString()}`,
        'color: #0066cc; font-weight: bold;',
        'color: gray; font-weight: lighter;'
      )
      console.log('prev:', get())
      console.log('next:', typeof next === 'function' ? next(get()) : next)
      console.groupEnd()
    }
    
    return set(...a)
  }
  
  store.setState = loggedSet
  
  return f(loggedSet, get, store)
}

export const persist = <T extends object>(
  config: PersistOptions
) => (f: StateCreator<T>) => (set, get, api): T => {
  const { name, whitelist, blacklist } = config

  // 创建持久化存储方法
  const persistStorage = {
    setItem: async (name: string, value: unknown) => {
      try {
        const serialized = JSON.stringify(value)
        localStorage.setItem(name, serialized)
      } catch (err) {
        console.error('Error saving state:', err)
      }
    },
    getItem: async (name: string) => {
      try {
        const serialized = localStorage.getItem(name)
        if (serialized === null) return undefined
        return JSON.parse(serialized)
      } catch (err) {
        console.error('Error loading state:', err)
        return undefined
      }
    },
    removeItem: async (name: string) => {
      try {
        localStorage.removeItem(name)
      } catch (err) {
        console.error('Error removing state:', err)
      }
    }
  }

  // 创建持久化方法
  const persistMethods = {
    persist: {
      setItem: persistStorage.setItem,
      getItem: persistStorage.getItem,
      removeItem: persistStorage.removeItem,
      rehydrate: async () => {
        const stored = await persistStorage.getItem(name)
        
        if (stored) {
          let state = stored
          
          if (whitelist) {
            state = whitelist.reduce((acc, key) => {
              if (key in stored) {
                acc[key] = stored[key]
              }
              return acc
            }, {} as Partial<T>)
          }
          
          if (blacklist) {
            state = Object.keys(stored).reduce((acc, key) => {
              if (!blacklist.includes(key)) {
                acc[key] = stored[key]
              }
              return acc
            }, {} as Partial<T>)
          }
          
          set({ ...state, _hasHydrated: true })
        } else {
          set({ _hasHydrated: true } as Partial<T>)
        }
      },
      save: async () => {
        const state = get()
        await persistStorage.setItem(name, state)
      },
      clear: async () => {
        await persistStorage.removeItem(name)
        set({} as T)
      }
    },
    _hasHydrated: false
  }

  // 创建包装后的 set 函数，在每次更新后自动保存
  const persistSet: typeof set = (...args) => {
    set(...args)
    const state = get()
    persistStorage.setItem(name, state)
  }

  return {
    ...f(persistSet, get, api),
    ...persistMethods
  }
}
