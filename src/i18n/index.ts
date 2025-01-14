"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhHansCN from './locales/zh-Hans-CN.json';
import zhHantTW from './locales/zh-Hant-TW.json';
import en from './locales/en.json';

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

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-Hans-CN',
    lng: 'zh-Hans-CN',
    debug: process.env.NODE_ENV === 'development',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
