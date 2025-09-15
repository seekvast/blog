'use client'

import { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { getOptions } from '@/i18n/settings'

const initI18nextClient = (lng: string, ns: string | string[]) => {
  const i18n = createInstance()
  i18n
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) => {
          try {
            // 直接使用动态导入，确保在构建时正确解析
            return import(`@/../public/locales/${language}/${namespace}.json`);
          } catch (error) {
            console.error(`Failed to load translations for ${language}/${namespace}:`, error);
            // 返回空的翻译对象，避免应用崩溃
            return {};
          }
        }
      )
    )
    .init(getOptions(lng, ns))
  return i18n
}

interface I18nProviderProps {
  children: ReactNode
  lng: string
  ns?: string | string[]
}

export function I18nProvider({ children, lng, ns }: I18nProviderProps) {
  const i18n = initI18nextClient(lng, ns || [])
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}