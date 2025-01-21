import type { User, Post, Comment, Category, Tag } from '@/types'

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: Error | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
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

export interface TaxonomyState {
  categories: Category[]
  tags: Tag[]
  isLoading: boolean
  error: Error | null
  fetchCategories: () => Promise<void>
  fetchTags: () => Promise<void>
  reset: () => void
}

export interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  notifications: Array<{
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    message: string
  }>
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  addNotification: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void
  removeNotification: (id: string) => void
  reset: () => void
}
