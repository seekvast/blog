import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuthStore, selectIsAuthenticated } from '@/store'

interface RequireAuthProps {
  children: React.ReactNode
  roles?: string[]
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
  const router = useRouter()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const user = useAuthStore(state => state.user)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace({
        pathname: '/login',
        query: { from: router.asPath }
      })
      return
    }

    if (roles && user && !roles.includes(user.role)) {
      router.replace('/')
    }
  }, [isAuthenticated, router, roles, user])

  if (!isAuthenticated) {
    return null
  }

  if (roles && user && !roles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}

interface RequireGuestProps {
  children: React.ReactNode
}

export function RequireGuest({ children }: RequireGuestProps) {
  const router = useRouter()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return null
  }

  return <>{children}</>
}
