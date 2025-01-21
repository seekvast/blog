import { z } from 'zod'

export const commentQuerySchema = z.object({
  discussion_id: z.string(),
  page: z.string().optional(),
  per_page: z.string().optional(),
  parent_id: z.string().optional()
})

export const createCommentSchema = z.object({
  content: z.string().min(1, '评论内容不能为空'),
  discussion_id: z.number(),
  parent_id: z.number().optional(),
  attachments: z
    .array(
      z.object({
        file_name: z.string(),
        file_path: z.string(),
        file_size: z.number(),
        file_type: z.string()
      })
    )
    .optional()
})

export const updateCommentSchema = z.object({
  content: z.string().min(1, '评论内容不能为空'),
  attachments: z
    .array(
      z.object({
        file_name: z.string(),
        file_path: z.string(),
        file_size: z.number(),
        file_type: z.string()
      })
    )
    .optional()
})
