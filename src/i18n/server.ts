
import { createInstance, i18n as I18n } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { getOptions } from './settings';
export const initI18next = async (lng: string, ns: string | string[]): Promise<I18n> => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(
      resourcesToBackend(
        (language: string, namespace: string) => {
          try {
            return import(`@/../public/locales/${language}/${namespace}.json`);
          } catch (error) {
            console.error(`Server: Failed to load translations for ${language}/${namespace}:`, error);
            return Promise.resolve({});
          }
        }
      )
    )
    .init(getOptions(lng, ns));
  return i18nInstance;
};

export async function useTranslation(
  lng: string,
  ns: string | string[] = 'common',
  options: { keyPrefix?: string } = {}
) {
  const i18nextInstance = await initI18next(lng, ns);
  return {
    t: i18nextInstance.getFixedT(
      lng,
      Array.isArray(ns) ? ns[0] : ns,
      options.keyPrefix
    ),
    i18n: i18nextInstance,
  };
}