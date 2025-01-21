"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <div
      className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "dark" ? (
        <Moon className="leading-none" suppressHydrationWarning />
      ) : (
        <Sun className="leading-none" suppressHydrationWarning />
      )}
      <span className="truncate" suppressHydrationWarning>{theme === "dark" ? "深色模式" : "浅色模式"}</span>
    </div>
  )
}
