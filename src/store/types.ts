import type { User, Post, Category, Tag } from '@/types'

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: Error | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  persist: {
    rehydrate: () => void
    hasHydrated: () => boolean
    onHydrate: (cb: () => void) => () => void
    onFinishHydration: (cb: () => void) => () => void
  }
}

export interface PostState {
  posts: Post[]
  currentPost: Post | null
  isLoading: boolean
  error: Error | null
  total: number
  fetchPosts: (params?: Record<string, any>) => Promise<void>
  fetchPost: (id: number) => Promise<void>
  createPost: (data: Partial<Post>) => Promise<void>
  updatePost: (id: number, data: Partial<Post>) => Promise<void>
  deletePost: (id: number) => Promise<void>
  reset: () => void
}

export interface CommentState {
  comments: Comment[]
  isLoading: boolean
  error: Error | null
  total: number
  fetchComments: (postId: number) => Promise<void>
  addComment: (data: Partial<Comment>) => Promise<void>
  updateComment: (id: number, content: string) => Promise<void>
  deleteComment: (id: number) => Promise<void>
  reset: () => void
}
