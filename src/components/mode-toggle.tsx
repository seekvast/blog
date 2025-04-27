"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, SunMoon, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "react-i18next"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const { t } = useTranslation()

  // 主题选项
  const themeOptions = [
    { value: "light", label: "日间模式", icon: Sun },
    { value: "dark", label: "夜间模式", icon: Moon },
    { value: "system", label: "自动", icon: SunMoon },
  ]

  const getCurrentThemeIcon = () => {
    const currentTheme = theme || "system"
    const option = themeOptions.find((opt) => opt.value === currentTheme)
    const Icon = option?.icon || SunMoon
    return <Icon className="leading-none" suppressHydrationWarning />
  }

  const getCurrentThemeName = () => {
    const currentTheme = theme || "system"
    const option = themeOptions.find((opt) => opt.value === currentTheme)
    return option?.label || "自动"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className="flex cursor-pointer items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          {getCurrentThemeIcon()}
          <span className="truncate" suppressHydrationWarning>
            {getCurrentThemeName()}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themeOptions.map((option) => {
          const Icon = option.icon
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className="flex justify-between"
            >
              <div className="flex items-center gap-2">
                <Icon />
                <span>{option.label}</span>
              </div>
              {theme === option.value && <Check />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
