"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhHansCN from './locales/zh-Hans-CN.json';
import zhHantTW from './locales/zh-Hant-TW.json';
import en from './locales/en.json';

// 检查是否在浏览器环境
const isBrowser = typeof window !== 'undefined';

const resources = {
  'zh-Hans-CN': {
    translation: zhHansCN,
  },
  'zh-Hant-TW': {
    translation: zhHantTW,
  },
  en: {
    translation: en,
  },
};

// 基础配置
const i18nConfig = {
  resources,
  fallbackLng: 'zh-Hans-CN',
  lng: 'zh-Hans-CN',
  debug: process.env.NODE_ENV === 'development',
  interpolation: {
    escapeValue: false,
  },
};

// 初始化 i18next
i18n.use(initReactI18next);

// 仅在浏览器环境添加语言检测
if (isBrowser) {
  i18n.use(LanguageDetector);
}

// 确保只初始化一次
if (!i18n.isInitialized) {
  i18n.init(isBrowser ? {
    ...i18nConfig,
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['cookie', 'localStorage'],
    },
  } : i18nConfig);
}

export default i18n;
