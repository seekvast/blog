"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, SunMoon, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  const themeOptions = [
    { value: "light", label: "日间模式", icon: Sun },
    { value: "dark", label: "夜间模式", icon: Moon },
    { value: "system", label: "自动", icon: SunMoon },
  ];

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[36px] cursor-pointer items-center gap-2 py-2 text-sm text-muted-foreground">
        {/* 图标占位符 */}
        <div className="h-4 w-4 animate-pulse rounded-full bg-muted-foreground/30" />
        {/* 文字占位符 */}
        <div className="h-4 w-16 animate-pulse rounded bg-muted-foreground/30" />
      </div>
    );
  }

  // 4. 只有在客户端挂载后，才渲染依赖主题的真实 UI
  const currentThemeDetails =
    themeOptions.find((opt) => opt.value === theme) || themeOptions[2]; // 默认为 "system"
  const CurrentIcon = currentThemeDetails.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex cursor-pointer items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground">
          <CurrentIcon className="h-4 w-4 leading-none" />
          <span className="truncate">{currentThemeDetails.label}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className="flex justify-between"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{option.label}</span>
              </div>
              {theme === option.value && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
