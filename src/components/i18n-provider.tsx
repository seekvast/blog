'use client'

import { ReactNode, useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { createInstance, i18n as I18n } from 'i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { getOptions, defaultNS } from '@/i18n/settings'

const initI18nextClient = async (lng: string, ns?: string | string[]): Promise<I18n> => {
  const i18n = createInstance()
  await i18n
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`@/../public/locales/${language}/${namespace}.json`)
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
  const [i18n, setI18n] = useState<I18n | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const namespaces = ns || defaultNS;
        const i18nInstance = await initI18nextClient(lng, namespaces);
        setI18n(i18nInstance);
      } catch (error) {
        console.error("[i18n] Initialization failed:", error);
      }
    };

    initialize();
  }, [lng, ns]);

  if (!i18n) {
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}