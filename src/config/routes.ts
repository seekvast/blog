export interface Route {
  path: string
  roles?: string[]
  children?: Route[]
}

export const routes: Route[] = [
  {
    path: '/',
    children: [
      {
        path: 'posts',
        children: [
          {
            path: 'create',
            roles: ['user', 'admin']
          },
          {
            path: 'edit/:id',
            roles: ['user', 'admin']
          }
        ]
      },
      {
        path: 'settings',
        roles: ['user', 'admin']
      },
      {
        path: 'profile',
        roles: ['user', 'admin']
      },
      {
        path: 'admin',
        roles: ['admin'],
        children: [
          {
            path: 'users'
          },
          {
            path: 'posts'
          },
          {
            path: 'categories'
          }
        ]
      }
    ]
  }
]

// 扁平化路由配置
export function flattenRoutes(routes: Route[], parentPath = ''): Route[] {
  return routes.reduce<Route[]>((acc, route) => {
    const path = `${parentPath}/${route.path}`.replace(/\/+/g, '/')
    const flatRoute = { ...route, path }
    
    return route.children
      ? [...acc, flatRoute, ...flattenRoutes(route.children, path)]
      : [...acc, flatRoute]
  }, [])
}

// 检查路由权限
export function checkRoutePermission(
  path: string,
  role?: string
): boolean {
  const flatRoutes = flattenRoutes(routes)
  const route = flatRoutes.find(r => 
    new RegExp(`^${r.path.replace(/:\w+/g, '[^/]+')}$`).test(path)
  )
  
  if (!route) return true
  if (!route.roles) return true
  if (!role) return false
  
  return route.roles.includes(role)
}
