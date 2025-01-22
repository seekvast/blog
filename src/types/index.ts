export * from './discussion'
export * from './Paginate'
export * from './common'
export * from './board'
export * from './forum'
export * from './user'

export interface QueryParams {
  page?: number
  per_page?: number
  [key: string]: any
}

export interface CreateDiscussionDto {
  title: string
  content: string
  board_id: number
  board_child_id?: number
  attachments?: string[]
  poll?: string
}

export interface UpdateDiscussionDto extends Partial<CreateDiscussionDto> {
  slug: string
}
