import type { BaseModel, User, Category, Tag } from './common'

export interface Post extends BaseModel {
  title: string
  content: string
  excerpt: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  viewCount: number
  likeCount: number
  commentCount: number
  authorId: number
  author: User
  categoryId: number
  category: Category
  tags: Tag[]
}

export interface Comment extends BaseModel {
  content: string
  postId: number
  post: Post
  authorId: number
  author: User
  parentId?: number
  children?: Comment[]
  likeCount: number
}

export interface Like extends BaseModel {
  postId?: number
  commentId?: number
  userId: number
  user: User
}

export interface PostQueryParams {
  categoryId?: number
  tagIds?: number[]
  authorId?: number
  status?: Post['status']
  sort?: 'latest' | 'popular' | 'mostCommented'
  search?: string
  page?: number
  limit?: number
}

export interface CreatePostDto {
  title: string
  content: string
  excerpt?: string
  categoryId: number
  tagIds: number[]
  status?: Post['status']
}

export interface UpdatePostDto extends Partial<CreatePostDto> {
  id: number
}

export interface CreateCommentDto {
  content: string
  postId: number
  parentId?: number
}

export interface UpdateCommentDto {
  id: number
  content: string
}
