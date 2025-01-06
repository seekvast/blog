"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Icon } from "@/components/icons"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <div
      className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Icon
        name={theme === "dark" ? "dark_mode" : "light_mode"}
        className="text-[20px] leading-none"
      />
      <span className="truncate">{theme === "dark" ? "深色模式" : "浅色模式"}</span>
    </div>
  )
}
