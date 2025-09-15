"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  SUPPORTED_LANGUAGES,
  languages as supportedLanguageCodes,
  cookieName,
} from "@/i18n/settings";

export const languages = SUPPORTED_LANGUAGES;

export function useLanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentLanguageCode = () => {
    // 从当前路径解析语言代码
    const pathSegments = pathname.split("/").filter(Boolean);
    const firstSegment = pathSegments[0];

    if (["zh-TW", "zh", "en"].includes(firstSegment)) {
      return firstSegment;
    }

    // 默认返回繁体中文
    return "zh-TW";
  };

  const getCurrentLanguageName = () => {
    const currentLangCode = getCurrentLanguageCode();
    const currentLang = languages.find((lang) => lang.code === currentLangCode);
    return currentLang ? currentLang.name : "繁體中文";
  };

  const changeLanguage = (newLng: string) => {
    console.log("useLanguageSwitcher: Changing language to:", newLng);

    if (!pathname) return;

    try {
      // 解析当前路径，正确提取语言代码和实际路径
      const pathSegments = pathname.split("/").filter(Boolean);

      // 检查第一个路径段是否是支持的语言代码
      const currentLngInPath = ["zh-TW", "zh", "en"].find(
        (l) => l === pathSegments[0]
      );

      let actualPath;
      if (currentLngInPath) {
        // 如果已有语言前缀，移除它
        actualPath = pathSegments.slice(1).join("/");
      } else {
        // 如果没有语言前缀，保持完整路径
        actualPath = pathSegments.join("/");
      }

      // 构建新路径
      const newPath = actualPath ? `/${newLng}/${actualPath}` : `/${newLng}`;

      // 路由跳转
      router.push(newPath);

      // 显示成功消息
      alert(`语言已切换到: ${languages.find((l) => l.code === newLng)?.name}`);
    } catch (error) {
      console.error("Language switch error:", error);
      alert("切换语言时出错");
    }
  };

  return {
    currentLanguage: getCurrentLanguageCode(),
    currentLanguageName: getCurrentLanguageName(),
    changeLanguage,
    languages,
  };
}