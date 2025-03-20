"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import zhHansCN from "./locales/zh-Hans-CN.json";
import zhHantTW from "./locales/zh-Hant-TW.json";
import en from "./locales/en.json";

// 检查是否在浏览器环境
const isBrowser = typeof window !== "undefined";
const isDev = process.env.NODE_ENV === "development";

// 在生产环境禁用 i18next 警告
if (!isDev) {
  i18n.options = i18n.options || {};
  i18n.options.debug = false;
  i18n.options.saveMissing = false;
  // 禁用控制台警告
  //   i18n.options.silent = true;
}

const resources = {
  "zh-Hans-CN": {
    translation: zhHansCN,
  },
  "zh-Hant-TW": {
    translation: zhHantTW,
  },
  en: {
    translation: en,
  },
};

// 基础配置
const i18nConfig = {
  resources,
  fallbackLng: "zh-Hans-CN",
  lng: "zh-Hans-CN",
  // debug: isDev,
  debug: false,

  interpolation: {
    escapeValue: false,
  },
  // 禁用缺失键警告
  saveMissing: false,
};

// 客户端配置
const clientConfig = {
  ...i18nConfig,
  detection: {
    order: ["localStorage", "cookie", "navigator"],
    lookupCookie: "i18next",
    lookupLocalStorage: "i18nextLng",
    caches: ["localStorage", "cookie"],
    cookieMinutes: 525600, // 一年
    cookieDomain:
      typeof window !== "undefined" ? window.location.hostname : undefined,
  },
};

// 服务端配置
const serverConfig = {
  ...i18nConfig,
  preload: ["zh-Hans-CN", "zh-Hant-TW", "en"], // 预加载所有语言
  ns: ["translation"], // 命名空间
};

const instance = i18n.use(initReactI18next);

// 仅在浏览器环境下使用 LanguageDetector
if (isBrowser) {
  instance.use(LanguageDetector);
}

// 强制初始化，确保在所有环境下都正确初始化
instance.init(isBrowser ? clientConfig : serverConfig);

export default instance;
