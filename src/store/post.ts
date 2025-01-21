import { create } from 'zustand'
import { logger } from './middleware'
import type { PostState } from './types'
import { postService } from '@/services'

const initialState = {
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  total: 0
}

export const usePostStore = create<PostState>()(
  logger((set, get) => ({
    ...initialState,

    fetchPosts: async (params) => {
      set({ isLoading: true, error: null })
      
      try {
        const { items: posts, total } = await postService.getPosts(params)
        set({ posts, total, isLoading: false })
      } catch (error) {
        set({ error: error as Error, isLoading: false })
        throw error
      }
    },

    fetchPost: async (id) => {
      set({ isLoading: true, error: null })
      
      try {
        const post = await postService.getPost(id)
        set({ currentPost: post, isLoading: false })
      } catch (error) {
        set({ error: error as Error, isLoading: false })
        throw error
      }
    },

    createPost: async (data) => {
      set({ isLoading: true, error: null })
      
      try {
        const post = await postService.createPost(data)
        set(state => ({
          posts: [post, ...state.posts],
          currentPost: post,
          isLoading: false
        }))
      } catch (error) {
        set({ error: error as Error, isLoading: false })
        throw error
      }
    },

    updatePost: async (id, data) => {
      set({ isLoading: true, error: null })
      
      try {
        const post = await postService.updatePost({ id, ...data })
        set(state => ({
          posts: state.posts.map(p => p.id === id ? post : p),
          currentPost: state.currentPost?.id === id ? post : state.currentPost,
          isLoading: false
        }))
      } catch (error) {
        set({ error: error as Error, isLoading: false })
        throw error
      }
    },

    deletePost: async (id) => {
      set({ isLoading: true, error: null })
      
      try {
        await postService.deletePost(id)
        set(state => ({
          posts: state.posts.filter(p => p.id !== id),
          currentPost: state.currentPost?.id === id ? null : state.currentPost,
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
export const selectPosts = (state: PostState) => state.posts
export const selectCurrentPost = (state: PostState) => state.currentPost
export const selectIsLoading = (state: PostState) => state.isLoading
export const selectError = (state: PostState) => state.error
export const selectTotal = (state: PostState) => state.total
