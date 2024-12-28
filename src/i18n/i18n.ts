"use client"

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

// 导入翻译文件
import zhTranslation from '../../public/locales/zh/common.json'
import enTranslation from '../../public/locales/en/common.json'

const resources = {
  zh: {
    common: zhTranslation
  },
  en: {
    common: enTranslation
  }
}

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'zh',
    lng: 'zh', // 默认语言
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    defaultNS: 'common',
    ns: ['common'],
  })

export default i18n
