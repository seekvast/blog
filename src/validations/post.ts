import { z } from 'zod'
import { errorMessages, idSchema, slugSchema, querySchema } from './common'

const postStatusSchema = z.enum(['draft', 'published', 'archived'])

export const createPostSchema = z.object({
  title: z.string()
    .min(1, errorMessages.min('标题', 1))
    .max(200, errorMessages.max('标题', 200)),
  
  content: z.string()
    .min(1, errorMessages.min('内容', 1))
    .max(50000, errorMessages.max('内容', 50000)),
  
  excerpt: z.string()
    .max(500, errorMessages.max('摘要', 500))
    .optional(),
  
  categoryId: idSchema,
  
  tagIds: z.array(idSchema)
    .min(1, '至少需要选择一个标签')
    .max(5, '最多只能选择5个标签'),
  
  status: postStatusSchema.optional()
})

export const updatePostSchema = createPostSchema
  .partial()
  .extend({
    id: idSchema
  })

export const postQuerySchema = querySchema.extend({
  categoryId: idSchema.optional(),
  tagIds: z.array(idSchema).optional(),
  authorId: idSchema.optional(),
  status: postStatusSchema.optional(),
  sort: z.enum(['latest', 'popular', 'mostCommented']).optional()
})

// 评论验证
export const createCommentSchema = z.object({
  content: z.string()
    .min(1, errorMessages.min('评论内容', 1))
    .max(1000, errorMessages.max('评论内容', 1000)),
  
  postId: idSchema,
  
  parentId: idSchema.optional()
})

export const updateCommentSchema = z.object({
  id: idSchema,
  content: z.string()
    .min(1, errorMessages.min('评论内容', 1))
    .max(1000, errorMessages.max('评论内容', 1000))
})

// 类型导出
export type CreatePostDto = z.infer<typeof createPostSchema>
export type UpdatePostDto = z.infer<typeof updatePostSchema>
export type PostQueryParams = z.infer<typeof postQuerySchema>
export type CreateCommentDto = z.infer<typeof createCommentSchema>
export type UpdateCommentDto = z.infer<typeof updateCommentSchema>
