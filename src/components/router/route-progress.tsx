import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置 NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
  showSpinner: false
})

export function RouteProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [prevPath, setPrevPath] = useState('')

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    
    // 避免同一路由重复触发
    if (url !== prevPath) {
      NProgress.start()
      setPrevPath(url)
      // 使用 requestAnimationFrame 确保动画流畅
      requestAnimationFrame(() => {
        NProgress.done()
      })
    }
  }, [pathname, searchParams, prevPath])

  return null
}
