import { z } from 'zod'
import { errorMessages, idSchema, slugSchema, querySchema } from './common'

// 分类验证
export const createCategorySchema = z.object({
  name: z.string()
    .min(1, errorMessages.min('分类名称', 1))
    .max(50, errorMessages.max('分类名称', 50)),
  
  description: z.string()
    .max(200, errorMessages.max('描述', 200))
    .optional(),
  
  parentId: idSchema.optional()
}).refine(
  data => !data.parentId || data.parentId > 0,
  {
    message: '父分类ID必须是正整数',
    path: ['parentId']
  }
)

export const updateCategorySchema = createCategorySchema
  .partial()
  .extend({
    id: idSchema
  })

// 标签验证
export const createTagSchema = z.object({
  name: z.string()
    .min(1, errorMessages.min('标签名称', 1))
    .max(30, errorMessages.max('标签名称', 30)),
  
  description: z.string()
    .max(100, errorMessages.max('描述', 100))
    .optional()
})

export const updateTagSchema = createTagSchema
  .partial()
  .extend({
    id: idSchema
  })

export const taxonomyQuerySchema = querySchema.extend({
  parentId: idSchema.optional()
})

// 类型导出
export type CreateCategoryDto = z.infer<typeof createCategorySchema>
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>
export type CreateTagDto = z.infer<typeof createTagSchema>
export type UpdateTagDto = z.infer<typeof updateTagSchema>
export type TaxonomyQueryParams = z.infer<typeof taxonomyQuerySchema>
