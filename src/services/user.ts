import { api } from '@/lib/api'
import { validate } from '@/lib/validation'
import type { User, Pagination, QueryParams } from '@/types/common'
import {
  updateProfileSchema,
  changePasswordSchema,
  userQuerySchema,
  type UpdateProfileDto,
  type ChangePasswordDto
} from '@/validations/user'

export interface UpdateProfileDto {
  username?: string
  avatar?: string
}

export interface ChangePasswordDto {
  oldPassword: string
  newPassword: string
}

export const userService = {
  getCurrentUser: () => 
    api.get<User>('/users/me', undefined, { useCache: true }),

  getUser: (id: number) => 
    api.get<User>(`/users/${id}`),

  getUsers: (params?: QueryParams) => {
    const validatedParams = params ? validate(userQuerySchema, params) : undefined
    return api.get<Pagination<User>>('/users', validatedParams)
  },

  updateProfile: (data: UpdateProfileDto) => {
    const validatedData = validate(updateProfileSchema, data)
    return api.patch<User>('/users/me', validatedData)
  },

  changePassword: (data: ChangePasswordDto) => {
    const validatedData = validate(changePasswordSchema, data)
    return api.post<void>('/users/me/password', validatedData)
  },

  uploadAvatar: async (file: File) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('只能上传图片文件')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('图片大小不能超过5MB')
    }

    const formData = new FormData()
    formData.append('avatar', file)
    
    return api.post<{ url: string }>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': undefined
      }
    })
  }
}
