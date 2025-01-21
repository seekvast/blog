import { z } from 'zod'
import { errorMessages, querySchema } from './common'

export const userSchema = z.object({
  username: z.string()
    .min(2, errorMessages.min('用户名', 2))
    .max(30, errorMessages.max('用户名', 30))
    .regex(/^[a-zA-Z0-9_-]+$/, '用户名只能包含字母、数字、下划线和连字符'),
  
  email: z.string()
    .email(errorMessages.email)
    .max(100, errorMessages.max('邮箱', 100)),
  
  avatar: z.string()
    .url(errorMessages.url)
    .optional(),
  
  role: z.enum(['user', 'admin'])
})

export const updateProfileSchema = z.object({
  username: userSchema.shape.username.optional(),
  avatar: userSchema.shape.avatar
})

export const changePasswordSchema = z.object({
  oldPassword: z.string()
    .min(6, errorMessages.min('密码', 6))
    .max(100, errorMessages.max('密码', 100)),
  
  newPassword: z.string()
    .min(6, errorMessages.min('新密码', 6))
    .max(100, errorMessages.max('新密码', 100))
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
      '密码必须包含至少一个大写字母、一个小写字母和一个数字'
    )
}).refine(
  data => data.oldPassword !== data.newPassword,
  {
    message: '新密码不能与旧密码相同',
    path: ['newPassword']
  }
)

export const userQuerySchema = querySchema.extend({
  role: z.enum(['user', 'admin']).optional()
})

// 类型导出
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>
export type UserQueryParams = z.infer<typeof userQuerySchema>
