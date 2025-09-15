'use client'

import dynamic from 'next/dynamic'

// 使用 next/dynamic 强制让 LanguageSwitcher 只在客户端加载和渲染。
// ssr: false 是这里的关键。
export const DynamicLanguageSwitcher = dynamic(
  () => import('@/components/language-switcher').then((mod) => mod.LanguageSwitcher),
  { ssr: false }
)