import { create } from 'zustand'
import { logger } from './middleware'
import type { CommentState } from './types'
import { commentService } from '@/services'

const initialState = {
  comments: [],
  isLoading: false,
  error: null,
  total: 0
}

export const useCommentStore = create<CommentState>()(
  logger((set, get) => ({
    ...initialState,

    fetchComments: async (postId, params) => {
      set({ isLoading: true, error: null })
      
      try {
        const { items: comments, total } = await commentService.getComments(postId, params)
        set({ comments, total, isLoading: false })
      } catch (error) {
        set({ error: error as Error, isLoading: false })
        throw error
      }
    },

    addComment: async (data) => {
      set({ isLoading: true, error: null })
      
      try {
        const comment = await commentService.createComment(data)
        set(state => ({
          comments: [comment, ...state.comments],
          total: state.total + 1,
          isLoading: false
        }))
        return comment
      } catch (error) {
        set({ error: error as Error, isLoading: false })
        throw error
      }
    },

    updateComment: async (id, content) => {
      set({ isLoading: true, error: null })
      
      try {
        const comment = await commentService.updateComment({ id, content })
        set(state => ({
          comments: state.comments.map(c => 
            c.id === id ? { ...c, content } : c
          ),
          isLoading: false
        }))
        return comment
      } catch (error) {
        set({ error: error as Error, isLoading: false })
        throw error
      }
    },

    deleteComment: async (id) => {
      set({ isLoading: true, error: null })
      
      try {
        await commentService.deleteComment(id)
        set(state => ({
          comments: state.comments.filter(c => c.id !== id),
          total: state.total - 1,
          isLoading: false
        }))
      } catch (error) {
        set({ error: error as Error, isLoading: false })
        throw error
      }
    },

    reset: () => set(initialState)
  }))
)

// 选择器
export const selectComments = (state: CommentState) => state.comments
export const selectCommentsTotal = (state: CommentState) => state.total
export const selectCommentsLoading = (state: CommentState) => state.isLoading
export const selectCommentsError = (state: CommentState) => state.error
