// "use client";

// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import {
//   SUPPORTED_LANGUAGES,
//   languages as supportedLanguageCodes,
//   cookieName,
// } from "@/i18n/settings";

// export const languages = SUPPORTED_LANGUAGES;

// export function useLanguageSwitcher() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const getCurrentLanguageCode = () => {
//     const pathSegments = pathname.split("/").filter(Boolean);
//     const firstSegment = pathSegments[0];
//     if (supportedLanguageCodes.includes(firstSegment)) {
//       return firstSegment;
//     }
//     return "zh-TW";
//   };

//   const getCurrentLanguageName = () => {
//     const currentLangCode = getCurrentLanguageCode();
//     const currentLang = languages.find(
//       (lang) => lang.code === currentLangCode
//     );
//     return currentLang ? currentLang.name : "繁體中文";
//   };

//   const changeLanguage = (newLng: string) => {
//     if (!pathname) return;

//     const pathSegments = pathname.split("/").filter(Boolean);
//     const currentLngInPath = supportedLanguageCodes.find(
//       (l) => l === pathSegments[0]
//     );

//     const actualPath = currentLngInPath
//       ? pathSegments.slice(1).join("/")
//       : pathSegments.join("/");

//     const newPath = `/${newLng}/${actualPath}`;
//     const currentQueryString = searchParams.toString();

//     const finalUrl = currentQueryString
//       ? `${newPath}?${currentQueryString}`
//       : newPath;

//     const oneYear = 365 * 24 * 60 * 60;
//     document.cookie = `${cookieName}=${newLng};path=/;max-age=${oneYear}`;

//     router.push(finalUrl);
//   };

//   return {
//     currentLanguage: getCurrentLanguageCode(),
//     currentLanguageName: getCurrentLanguageName(),
//     changeLanguage,
//     languages,
//   };
// }

// src/hooks/use-language-switcher.tsx

"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { cookieName, SUPPORTED_LANGUAGES } from "@/i18n/settings";
import Cookies from "js-cookie";

export function useLanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const router = useRouter();

  const currentLanguageName =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === currentLanguage)?.name ||
    SUPPORTED_LANGUAGES[0].name;

  const changeLanguage = (newLang: string) => {
    if (newLang === currentLanguage) return;

    // 1. 在客户端设置 cookie
    Cookies.set(cookieName, newLang, { expires: 365, path: "/" });

    // 2. 强制刷新，让服务器用新的 cookie 来重新渲染页面
    // router.refresh() 会重新获取服务端数据，但会尽量保持客户端状态，体验比 window.location.reload() 好
    router.refresh();
  };

  return {
    currentLanguage,
    currentLanguageName,
    changeLanguage,
    languages: SUPPORTED_LANGUAGES,
  };
}
