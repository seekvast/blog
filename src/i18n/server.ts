import { createInstance } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";
import { getOptions } from "./settings";

const initI18next = async (lng: string, ns: string | string[]) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next) // 这里的 initReactI18next 不会引入 createContext
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`@/../public/locales/${language}/${namespace}.json`)
      )
    )
    .init(getOptions(lng, ns as string));
  return i18nInstance;
};

export async function useTranslation(lng: string, ns: string | string[] = 'common') {
  const i18nextInstance = await initI18next(lng, ns);
  return {
    t: i18nextInstance.getFixedT(lng, Array.isArray(ns) ? ns[0] : ns),
    i18n: i18nextInstance,
  };
}