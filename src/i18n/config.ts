export const defaultLocale = 'zh-Hant-TW'
export const locales = ['en', 'zh-Hans', 'zh-Hant-TW'] as const

export type Locale = typeof locales[number]

export const i18n = {
  defaultLocale,
  locales,
  // 这些页面不需要翻译
  nonTranslatedPaths: [
    '/api',
    '/static',
    '/_next',
  ]
} as const
