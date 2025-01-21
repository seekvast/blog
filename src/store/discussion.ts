import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Discussion } from '@/types'
import { discussionService } from '@/services/discussion'

interface DiscussionState {
  discussions: Discussion[]
  currentDiscussion: Discussion | null
  loading: boolean
  error: string | null
  fetchDiscussions: (params?: Record<string, any>) => Promise<void>
  fetchDiscussion: (slug: string) => Promise<void>
  createDiscussion: (data: Partial<Discussion>) => Promise<void>
  updateDiscussion: (slug: string, data: Partial<Discussion>) => Promise<void>
  deleteDiscussion: (slug: string) => Promise<void>
  clearError: () => void
}

export const useDiscussionStore = create<DiscussionState>()(
  persist(
    (set, get) => ({
      discussions: [],
      currentDiscussion: null,
      loading: false,
      error: null,

      fetchDiscussions: async (params = {}) => {
        try {
          set({ loading: true, error: null })
          const response = await discussionService.getDiscussions(params)
          set({ discussions: response.data.items })
        } catch (error: any) {
          set({ error: error.message })
        } finally {
          set({ loading: false })
        }
      },

      fetchDiscussion: async (slug: string) => {
        try {
          set({ loading: true, error: null })
          const response = await discussionService.getDiscussion(slug)
          set({ currentDiscussion: response.data })
        } catch (error: any) {
          set({ error: error.message })
        } finally {
          set({ loading: false })
        }
      },

      createDiscussion: async (data: Partial<Discussion>) => {
        try {
          set({ loading: true, error: null })
          const response = await discussionService.createDiscussion(data)
          set(state => ({
            discussions: [response.data, ...state.discussions]
          }))
        } catch (error: any) {
          set({ error: error.message })
        } finally {
          set({ loading: false })
        }
      },

      updateDiscussion: async (slug: string, data: Partial<Discussion>) => {
        try {
          set({ loading: true, error: null })
          const response = await discussionService.updateDiscussion({ slug, ...data })
          set(state => ({
            discussions: state.discussions.map(d => 
              d.slug === slug ? { ...d, ...response.data } : d
            ),
            currentDiscussion: state.currentDiscussion?.slug === slug
              ? { ...state.currentDiscussion, ...response.data }
              : state.currentDiscussion
          }))
        } catch (error: any) {
          set({ error: error.message })
        } finally {
          set({ loading: false })
        }
      },

      deleteDiscussion: async (slug: string) => {
        try {
          set({ loading: true, error: null })
          await discussionService.deleteDiscussion(slug)
          set(state => ({
            discussions: state.discussions.filter(d => d.slug !== slug),
            currentDiscussion: null
          }))
        } catch (error: any) {
          set({ error: error.message })
        } finally {
          set({ loading: false })
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'discussion-storage'
    }
  )
)
