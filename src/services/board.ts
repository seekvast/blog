import { api } from '@/lib/api'
import type { Board, Discussion, PaginatedResponse, QueryParams } from '@/types'

export const boardService = {
  getBoard: (slug: string) => 
    api.get<Board>(`/api/boards/${slug}`),
    
  getBoardDiscussions: (slug: string, params?: QueryParams) => 
    api.get<PaginatedResponse<Discussion>>(`/api/boards/${slug}/discussions`, { params }),

  getBoardChildren: (slug: string) =>
    api.get<Board[]>(`/api/boards/${slug}/children`),
}
