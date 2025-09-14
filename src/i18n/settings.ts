// src/i18n/settings.ts

export const fallbackLng = "zh-Hant-TW";
export const languages = [fallbackLng, "zh"];
export const defaultNS = "common";
export const cookieName = 'i18next';

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}
