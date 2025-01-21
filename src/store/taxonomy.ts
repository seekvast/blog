import { create } from 'zustand'
import { logger, persist } from './middleware'
import type { TaxonomyState } from './types'
import { categoryService, tagService } from '@/services'

const initialState = {
  categories: [],
  tags: [],
  isLoading: false,
  error: null
}

export const useTaxonomyStore = create<TaxonomyState>()(
  logger(
    persist({
      name: 'taxonomy',
      whitelist: ['categories', 'tags']
    })((set, get) => ({
      ...initialState,

      fetchCategories: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const categories = await categoryService.getAllCategories()
          set({ categories, isLoading: false })
        } catch (error) {
          set({ error: error as Error, isLoading: false })
          throw error
        }
      },

      fetchTags: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const tags = await tagService.getAllTags()
          set({ tags, isLoading: false })
        } catch (error) {
          set({ error: error as Error, isLoading: false })
          throw error
        }
      },

      reset: () => set(initialState)
    }))
  )
)

// 选择器
export const selectCategories = (state: TaxonomyState) => state.categories
export const selectTags = (state: TaxonomyState) => state.tags
export const selectTaxonomyLoading = (state: TaxonomyState) => state.isLoading
export const selectTaxonomyError = (state: TaxonomyState) => state.error

// 辅助选择器
export const selectCategoryById = (id: number) => 
  (state: TaxonomyState) => 
    state.categories.find(c => c.id === id)

export const selectTagById = (id: number) => 
  (state: TaxonomyState) => 
    state.tags.find(t => t.id === id)

export const selectCategoriesByParentId = (parentId: number | null = null) =>
  (state: TaxonomyState) =>
    state.categories.filter(c => c.parentId === parentId)

export const selectTagsByIds = (ids: number[]) =>
  (state: TaxonomyState) =>
    state.tags.filter(t => ids.includes(t.id))
