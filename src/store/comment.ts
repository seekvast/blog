import { create } from 'zustand'
import type { Comment } from '@/types'
import { commentService } from '@/services/comment'

interface CommentState {
  comments: Comment[]
  currentComment: Comment | null
  loading: boolean
  error: string | null
  fetchComments: (postId: number, params?: Record<string, any>) => Promise<void>
  fetchComment: (id: number) => Promise<void>
  createComment: (data: Partial<Comment>) => Promise<void>
  updateComment: (id: number, data: Partial<Comment>) => Promise<void>
  deleteComment: (id: number) => Promise<void>
  clearError: () => void
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  currentComment: null,
  loading: false,
  error: null,

  fetchComments: async (postId: number, params = {}) => {
    try {
      set({ loading: true, error: null })
      const response = await commentService.getComments(postId, params)
      set({ comments: response.data.items })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  fetchComment: async (id: number) => {
    try {
      set({ loading: true, error: null })
      const response = await commentService.getComment(id)
      set({ currentComment: response.data })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  createComment: async (data: Partial<Comment>) => {
    try {
      set({ loading: true, error: null })
      const response = await commentService.createComment(data)
      set(state => ({
        comments: [...state.comments, response.data]
      }))
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  updateComment: async (id: number, data: Partial<Comment>) => {
    try {
      set({ loading: true, error: null })
      const response = await commentService.updateComment({ id, ...data })
      set(state => ({
        comments: state.comments.map(c => 
          c.id === id ? { ...c, ...response.data } : c
        ),
        currentComment: state.currentComment?.id === id
          ? { ...state.currentComment, ...response.data }
          : state.currentComment
      }))
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  deleteComment: async (id: number) => {
    try {
      set({ loading: true, error: null })
      await commentService.deleteComment(id)
      set(state => ({
        comments: state.comments.filter(c => c.id !== id),
        currentComment: state.currentComment?.id === id ? null : state.currentComment
      }))
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  clearError: () => set({ error: null })
}))
