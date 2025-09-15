export const SUPPORTED_LANGUAGES = [
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'zh', name: '简体中文' },
  { code: 'en', name: 'English' },
];

export const fallbackLng = SUPPORTED_LANGUAGES[0].code;
export const languages = SUPPORTED_LANGUAGES.map(lang => lang.code);

export const defaultNS = 'common';
export const cookieName = 'i18next';

export function getOptions(lng = fallbackLng, ns: string | string[] = defaultNS) {
  return {
    // debug: process.env.NODE_ENV === 'development',
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}
