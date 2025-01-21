import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { RouteProgress } from '@/components/router/route-progress'
import { useRouterEvents } from '@/lib/router/events'
import { checkRoutePermission } from '@/config/routes'
import { useAuthStore } from '@/store'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter()
  const user = useAuthStore(state => state.user)

  // 使用路由事件
  useRouterEvents()

  useEffect(() => {
    // 检查路由权限
    const hasPermission = checkRoutePermission(
      router.pathname,
      user?.role
    )

    if (!hasPermission) {
      router.replace('/403')
    }
  }, [router.pathname, user])

  return (
    <>
      <RouteProgress />
      {children}
    </>
  )
}
