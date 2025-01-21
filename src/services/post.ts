import { api } from '@/lib/api'
import type { 
  Post, 
  PostQueryParams, 
  CreatePostDto, 
  UpdatePostDto,
  PaginatedResponse 
} from '@/types'

export const postService = {
  getPosts: (params?: PostQueryParams) => 
    api.get<PaginatedResponse<Post>>('/posts', params),

  getPost: (id: number) => 
    api.get<Post>(`/posts/${id}`),

  getPostBySlug: (slug: string) => 
    api.get<Post>(`/posts/slug/${slug}`),

  createPost: (data: CreatePostDto) => 
    api.post<Post>('/posts', data),

  updatePost: ({ id, ...data }: UpdatePostDto) => 
    api.patch<Post>(`/posts/${id}`, data),

  deletePost: (id: number) => 
    api.delete(`/posts/${id}`),

  likePost: (id: number) => 
    api.post<void>(`/posts/${id}/like`),

  unlikePost: (id: number) => 
    api.delete(`/posts/${id}/like`),

  getUserPosts: (userId: number, params?: PostQueryParams) => 
    api.get<PaginatedResponse<Post>>(`/users/${userId}/posts`, params),

  getDrafts: (params?: PostQueryParams) => 
    api.get<PaginatedResponse<Post>>('/posts/drafts', params),

  uploadImage: async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    
    return api.post<{ url: string }>('/posts/images', formData, {
      headers: {
        'Content-Type': undefined
      }
    })
  }
}
