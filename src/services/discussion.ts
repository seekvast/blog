import { api } from '@/lib/api'
import type { 
  Discussion, 
  CreateDiscussionDto, 
  UpdateDiscussionDto,
  Paginate,
  QueryParams 
} from '@/types'

export const discussionService = {
  getDiscussions: (params?: QueryParams) => 
    api.get<Paginate<Discussion>>('/api/discussions', params),

  getDiscussion: (slug: string) => 
    api.get<Discussion>(`/api/discussions/${slug}`),

  createDiscussion: (data: CreateDiscussionDto) => 
    api.post<Discussion>('/api/discussion', data),

  updateDiscussion: ({ slug, ...data }: UpdateDiscussionDto) => 
    api.patch<Discussion>(`/api/discussions/${slug}`, data),

  deleteDiscussion: (slug: string) => 
    api.delete(`/api/discussions/${slug}`),

  likeDiscussion: (slug: string) => 
    api.post<void>(`/api/discussions/${slug}/like`),

  unlikeDiscussion: (slug: string) => 
    api.delete(`/api/discussions/${slug}/like`),
}
