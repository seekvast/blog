"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";


export function LanguageSwitcher() {

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const languages = [
    { code: "zh", label: "简体中文" },
    { code: "zh-TW", label: "繁體中文" },
    { code: "en", label: "English" },
  ];

  const changeLanguage = (newLng: string) => {
    // 检查 pathname 是否存在
    if (!pathname) {
      console.error("LanguageSwitcher: pathname is not available yet.");
      return;
    }

    const pathSegments = pathname.split("/").filter(Boolean);

    // 检查路径的第一部分是否是语言代码
    const currentLng = languages.some((l) => l.code === pathSegments[0])
      ? pathSegments[0]
      : null;

    // 如果是，则移除语言代码部分，得到基础路径
    const basePathSegments = currentLng ? pathSegments.slice(1) : pathSegments;
    const basePath = "/" + basePathSegments.join("/");

    // 基于当前 searchParams 创建一个新的可修改的实例
    const newSearchParams = new URLSearchParams(searchParams?.toString());

    // 设置新的语言参数
    newSearchParams.set("lang", newLng);

    // 构造最终的 URL
    const finalUrl = `${basePath}?${newSearchParams.toString()}`;

    console.log("LanguageSwitcher: Navigating to:", finalUrl);

    // router.push 会触发中间件，中间件看到 lang 参数后会进行重定向并设置 cookie
    router.push(finalUrl);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
