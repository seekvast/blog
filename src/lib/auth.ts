import { getServerSession } from "next-auth/next"
import { NextAuthOptions } from "next-auth"

export async function getSession() {
  return await getServerSession()
}

// 创建一个带有认证token的fetch函数
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const session = await getSession()

  if (!session?.accessToken) {
    throw new Error("No access token found")
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${session.accessToken}`,
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

// 用于检查用户是否已认证的中间件
export async function authMiddleware(request: Request) {
  const session = await getSession()

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  return null // 继续处理请求
}
