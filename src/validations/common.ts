import { z } from 'zod'

export const idSchema = z.number().int().positive()

export const slugSchema = z.string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, '只能包含小写字母、数字和连字符')

export const paginationSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional()
})

export const sortSchema = z.object({
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional()
})

export const searchSchema = z.object({
  search: z.string().min(1).max(100).optional()
})

export const querySchema = paginationSchema
  .merge(sortSchema)
  .merge(searchSchema)

// 通用的错误消息
export const errorMessages = {
  required: '此字段为必填项',
  email: '请输入有效的电子邮件地址',
  min: (field: string, length: number) => 
    `${field}至少需要${length}个字符`,
  max: (field: string, length: number) => 
    `${field}不能超过${length}个字符`,
  integer: '请输入整数',
  positive: '请输入正数',
  enum: (values: string[]) => 
    `只能是以下值之一: ${values.join(', ')}`,
  regex: (pattern: string) => 
    `格式不正确，需要匹配模式: ${pattern}`,
  date: '请输入有效的日期',
  url: '请输入有效的URL地址'
}

// 创建一个辅助函数来添加错误消息
export function withErrorMessage<T extends z.ZodType>(
  schema: T,
  message: string
): T {
  return schema.superRefine((val, ctx) => {
    if (!schema.safeParse(val).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message
      })
    }
  })
}
