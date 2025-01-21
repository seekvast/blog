import { api } from '@/lib/api'
import type { 
  Comment, 
  CreateCommentDto, 
  UpdateCommentDto,
  PaginatedResponse,
  QueryParams 
} from '@/types'

export const commentService = {
  getComments: (postId: number, params?: QueryParams) => 
    api.get<PaginatedResponse<Comment>>(`/posts/${postId}/comments`, params),

  getComment: (id: number) => 
    api.get<Comment>(`/comments/${id}`),

  createComment: (data: CreateCommentDto) => 
    api.post<Comment>('/comments', data),

  updateComment: ({ id, ...data }: UpdateCommentDto) => 
    api.patch<Comment>(`/comments/${id}`, data),

  deleteComment: (id: number) => 
    api.delete(`/comments/${id}`),

  likeComment: (id: number) => 
    api.post<void>(`/comments/${id}/like`),

  unlikeComment: (id: number) => 
    api.delete(`/comments/${id}/like`),

  getUserComments: (userId: number, params?: QueryParams) => 
    api.get<PaginatedResponse<Comment>>(`/users/${userId}/comments`, params),

  getReplies: (commentId: number, params?: QueryParams) => 
    api.get<PaginatedResponse<Comment>>(`/comments/${commentId}/replies`, params)
}
