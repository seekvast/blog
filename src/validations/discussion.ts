import { z } from 'zod'

export const discussionQuerySchema = z.object({
  page: z.string().optional(),
  per_page: z.string().optional(),
  board_id: z.string().optional(),
  board_child_id: z.string().optional(),
  type: z.string().optional(),
  keyword: z.string().optional(),
  order: z.enum(['latest', 'hottest']).optional()
})

export const createDiscussionSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符'),
  content: z.string().min(1, '内容不能为空'),
  board_id: z.number(),
  board_child_id: z.number().optional(),
  type: z.string().optional(),
  is_private: z.boolean().optional(),
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

export const updateDiscussionSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符').optional(),
  content: z.string().min(1, '内容不能为空').optional(),
  board_id: z.number().optional(),
  board_child_id: z.number().optional(),
  type: z.string().optional(),
  is_private: z.boolean().optional(),
  is_locked: z.boolean().optional(),
  is_sticky: z.boolean().optional(),
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
