import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useUIStore } from '@/store'

// 滚动到顶部的选项
const scrollOptions: ScrollToOptions = {
  top: 0,
  behavior: 'smooth'
}

// 路由事件处理
export function useRouterEvents() {
  const router = useRouter()
  const addNotification = useUIStore(state => state.addNotification)

  useEffect(() => {
    // 路由开始变化
    const handleStart = () => {
      // 关闭所有弹出层
      document.body.click()
      
      // 禁用表单提交
      const forms = document.getElementsByTagName('form')
      for (const form of forms) {
        const submitButton = form.querySelector('button[type="submit"]')
        if (submitButton) {
          submitButton.setAttribute('disabled', 'true')
        }
      }
    }

    // 路由变化完成
    const handleComplete = (url: string) => {
      // 滚动到顶部
      window.scrollTo(scrollOptions)
      
      // 启用表单提交
      const forms = document.getElementsByTagName('form')
      for (const form of forms) {
        const submitButton = form.querySelector('button[type="submit"]')
        if (submitButton) {
          submitButton.removeAttribute('disabled')
        }
      }

      // 发送页面访问统计
      if (process.env.NODE_ENV === 'production') {
        try {
          window.gtag?.('config', process.env.NEXT_PUBLIC_GA_ID, {
            page_path: url
          })
        } catch (error) {
          console.error('Error sending analytics:', error)
        }
      }
    }

    // 路由变化失败
    const handleError = (error: Error) => {
      // 显示错误通知
      addNotification('error', '页面加载失败，请稍后重试')
      console.error('Router error:', error)
      
      // 启用表单提交
      const forms = document.getElementsByTagName('form')
      for (const form of forms) {
        const submitButton = form.querySelector('button[type="submit"]')
        if (submitButton) {
          submitButton.removeAttribute('disabled')
        }
      }
    }

    // 注册事件监听
    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleError)

    // 清理事件监听
    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleError)
    }
  }, [router, addNotification])
}
