import { useEffect } from 'react'
import { useAuthStore, useUIStore, useTaxonomyStore } from '@/store'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { persist: authPersist } = useAuthStore()
  const { persist: uiPersist } = useUIStore()
  const { persist: taxonomyPersist } = useTaxonomyStore()
  
  useEffect(() => {
    // 重新加载持久化数据
    authPersist.rehydrate()
    uiPersist.rehydrate()
    taxonomyPersist.rehydrate()
    
    // 预加载分类和标签数据
    useTaxonomyStore.getState().fetchCategories()
    useTaxonomyStore.getState().fetchTags()
  }, [])

  return children
}
