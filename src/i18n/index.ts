// src/i18n/index.ts

"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from 'i18next-browser-languagedetector';
import { getOptions } from "./settings";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) => {
        console.log(`Loading ${namespace} for ${language}`);
        return import(`./locales/${language}/${namespace}.json`);
      }
        // import(`./locales/${language}/${namespace}.json`)
    )
  )
  .init({
    ...getOptions(),
    lng: undefined,
    detection: {
      order: ["path", "cookie", "htmlTag"],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;