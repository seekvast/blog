import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'
import { API_ROUTES } from '@/constants/api'

interface Discussion {
  id: number
  title: string
  content: string
  board_id: number
  board_child_id?: number
  type?: string
  is_private?: boolean
  is_locked?: boolean
  is_sticky?: boolean
  created_at: string
  updated_at: string
  user: {
    hashid: string
    username: string
    nickname: string
    avatar_url: string
  }
}

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
        set({ loading: true, error: null })
        try {
          const response = await api.get(API_ROUTES.DISCUSSIONS, { params })
          set({ discussions: response.data.items, loading: false })
        } catch (error) {
          set({ error: '获取讨论列表失败', loading: false })
        }
      },

      fetchDiscussion: async (slug: string) => {
        set({ loading: true, error: null })
        try {
          const response = await api.get(`${API_ROUTES.DISCUSSIONS}/${slug}`)
          set({ currentDiscussion: response.data, loading: false })
        } catch (error) {
          set({ error: '获取讨论详情失败', loading: false })
        }
      },

      createDiscussion: async (data: Partial<Discussion>) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post(API_ROUTES.DISCUSSIONS, data)
          set(state => ({
            discussions: [response.data, ...state.discussions],
            loading: false
          }))
        } catch (error) {
          set({ error: '创建讨论失败', loading: false })
        }
      },

      updateDiscussion: async (slug: string, data: Partial<Discussion>) => {
        set({ loading: true, error: null })
        try {
          const response = await api.patch(
            `${API_ROUTES.DISCUSSIONS}/${slug}`,
            data
          )
          set(state => ({
            discussions: state.discussions.map(d =>
              d.id === response.data.id ? response.data : d
            ),
            currentDiscussion:
              state.currentDiscussion?.id === response.data.id
                ? response.data
                : state.currentDiscussion,
            loading: false
          }))
        } catch (error) {
          set({ error: '更新讨论失败', loading: false })
        }
      },

      deleteDiscussion: async (slug: string) => {
        set({ loading: true, error: null })
        try {
          await api.delete(`${API_ROUTES.DISCUSSIONS}/${slug}`)
          set(state => ({
            discussions: state.discussions.filter(
              d => d.id !== state.currentDiscussion?.id
            ),
            currentDiscussion: null,
            loading: false
          }))
        } catch (error) {
          set({ error: '删除讨论失败', loading: false })
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'discussion-storage'
    }
  )
)
