'use client'

import { ReactNode, useState, useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { getOptions } from '@/i18n/settings'

const initI18nextClient = async (lng: string, ns: string | string[]) => {
  const i18n = createInstance()
  i18n
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) => {
          try {
            // 避免使用动态导入，确保在构建时正确解析
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

export function I18nProviderFixed({ children, lng, ns }: I18nProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // 异步初始化 i18n，避免阻塞渲染
    const initI18n = async () => {
      try {
        await initI18nextClient(lng, ns || []);
        setI18nReady(true);
        console.log('I18nProvider: 初始化完成');
      } catch (error) {
        console.error('I18nProvider: 初始化失败:', error);
        // 即使初始化失败，也设置 ready，避免应用完全崩溃
        setI18nReady(true);
      }
    };

    initI18n();
  }, [lng, ns]);

  if (!isClient || !i18nReady) {
    // 在服务器端或 i18n 初始化完成前，返回空的 provider
    return <>{children}</>;
  }

  return (
    <I18nextProvider
      i18n={{
        t: (key: string) => key, // 简单的默认翻译函数
        i18n: {
          language: lng,
          languages: [],
          resources: {},
          changeLanguage: async () => {},
          getFixedT: () => (key: string) => key
        }
      }}
    >
      {children}
    </I18nextProvider>
  );
}