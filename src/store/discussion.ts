import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Discussion } from '@/types'
import { discussionService } from '@/services/discussion'
import { api } from '@/lib/api'

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
  setDiscussion: (discussion: Discussion) => void
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
          const response = await api.discussions.list(params)
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
          const response = await api.discussions.get(slug)
          // 如果是分页数据，取第一个项
          const discussion = response
          set({ currentDiscussion: discussion })
        } catch (error: any) {
          set({ error: error.message })
        } finally {
          set({ loading: false })
        }
      },

      createDiscussion: async (data: Partial<Discussion>) => {
        try {
          set({ loading: true, error: null })
          const response = await api.discussions.create(data)
          set((state) => ({
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
          const response = await api.discussions.update({ slug, ...data })
          set((state) => ({
            discussions: state.discussions.map((d) =>
              d.slug === slug ? response : d
            ),
            currentDiscussion:
              state.currentDiscussion?.slug === slug
                ? response
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
          set((state) => ({
            discussions: state.discussions.filter((d) => d.slug !== slug),
            currentDiscussion:
              state.currentDiscussion?.slug === slug ? null : state.currentDiscussion
          }))
        } catch (error: any) {
          set({ error: error.message })
        } finally {
          set({ loading: false })
        }
      },

      setDiscussion: (discussion: Discussion) => {
        set({ currentDiscussion: discussion })
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'discussion-storage',
      partialize: (state) => ({
        discussions: state.discussions
      })
    }
  )
)
