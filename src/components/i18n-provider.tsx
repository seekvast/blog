"use client"

import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import '@/lib/dayjs'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // 确保客户端初始化时使用正确的语言
    i18n.changeLanguage('zh-Hans-CN')
  }, [])

  // 在服务器端渲染时不渲染内容
  if (!isClient) {
    return null
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  )
}
