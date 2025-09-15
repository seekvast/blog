"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  SUPPORTED_LANGUAGES,
  languages as supportedLanguageCodes,
} from "@/i18n/settings";

export const languages = SUPPORTED_LANGUAGES;

export function useLanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentLanguageCode = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const firstSegment = pathSegments[0];

    if (supportedLanguageCodes.includes(firstSegment)) {
      return firstSegment;
    }

    return "zh-TW"; //默认语言
  };

  const getCurrentLanguageName = () => {
    const currentLangCode = getCurrentLanguageCode();
    const currentLang = languages.find((lang) => lang.code === currentLangCode);
    return currentLang ? currentLang.name : "繁體中文";
  };

  const changeLanguage = (newLng: string) => {
    if (!pathname) return;

    const pathSegments = pathname.split("/").filter(Boolean);
    const currentLngInPath = supportedLanguageCodes.find(
      (l) => l === pathSegments[0]
    );

    const actualPath = currentLngInPath
      ? pathSegments.slice(1).join("/")
      : pathSegments.join("/");

    const newPath = `/${newLng}/${actualPath}`;

    router.push(newPath);
  };

  return {
    currentLanguage: getCurrentLanguageCode(),
    currentLanguageName: getCurrentLanguageName(),
    changeLanguage,
    languages,
  };
}
