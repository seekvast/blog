import { useTranslation } from "react-i18next";

// 语言代码到语言名称的映射
export const languageNames: Record<string, string> = {
  "zh-TW": "繁體中文",
  zh: "简体中文",
  en: "English",
};

// 语言列表
export const languages = Object.entries(languageNames).map(([code, name]) => ({
  code,
  name,
}));

/**
 * 获取当前语言的显示名称的 hook
 * @returns 当前语言的显示名称和语言切换函数
 */
export function useLanguageName() {
  const { i18n } = useTranslation();

  // 获取当前语言的显示名称
  const getCurrentLanguageName = () => {
    const currentLang = i18n.language;
    return languageNames[currentLang as keyof typeof languageNames] || "语言";
  };

  // 获取当前语言代码
  const getCurrentLanguageCode = () => {
    return i18n.language;
  };

  // 切换到指定语言
  const changeLanguage = (langCode: string) => {
    if (languageNames[langCode]) {
      i18n.changeLanguage(langCode);
    }
  };

  return {
    getCurrentLanguageName,
    getCurrentLanguageCode,
    changeLanguage,
    languages,
  };
}
