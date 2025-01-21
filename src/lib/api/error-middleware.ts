import { signOut } from 'next-auth/react'
import type { ApiError } from './types'
import { useNotificationStore } from '@/store/notification'
import { toast } from '@/components/ui/toast'

type ErrorHandler = (error: ApiError) => void | Promise<void>

const errorHandlers: ErrorHandler[] = []

export const errorMiddleware = {
  use: (handler: ErrorHandler) => {
    errorHandlers.push(handler)
    return () => {
      const index = errorHandlers.indexOf(handler)
      if (index !== -1) errorHandlers.splice(index, 1)
    }
  }
}

export async function handleApiError(error: unknown): Promise<void> {
  const { addNotification } = useNotificationStore.getState()
  
  if (error instanceof Error) {
    const apiError = error as ApiError

    // 处理 HTTP 状态错误
    if (apiError.status) {
      switch (apiError.status) {
        case 401:
          await signOut({ redirect: true })
          addNotification('error', '登录已过期，请重新登录')
          break
        case 403:
          addNotification('error', '没有权限执行此操作')
          break
        case 404:
          addNotification('error', '请求的资源不存在')
          break
        case 429:
          addNotification('error', '请求过于频繁，请稍后再试')
          break
        case 500:
          addNotification('error', '服务器错误，请稍后再试')
          break
        default:
          if (apiError.status >= 500) {
            addNotification('error', '服务器错误，请稍后再试')
          } else {
            addNotification('error', apiError.message || '请求失败')
          }
      }
      return
    }

    // 处理业务错误码
    if (apiError.code) {
      switch (apiError.code) {
        case 1001:
          addNotification('error', '用户名或密码错误')
          break
        case 1002:
          addNotification('error', '账号已被禁用')
          break
        case 1003:
          addNotification('error', '验证码错误')
          break
        default:
          addNotification('error', apiError.message || '操作失败')
      }
      return
    }

    // 处理其他错误
    addNotification('error', apiError.message || '未知错误')
  } else {
    // 处理非 Error 类型的错误
    addNotification('error', '发生未知错误')
  }

  // 运行自定义错误处理器
  for (const handler of errorHandlers) {
    await handler(error as ApiError)
  }
}
