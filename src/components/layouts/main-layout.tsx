"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  LayoutGrid,
  Bookmark,
  PenSquare,
  Heart,
  SunMedium,
  Moon,
  Monitor,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const THEME_OPTIONS = [
  { value: "light", label: "theme.light", icon: SunMedium },
  { value: "dark", label: "theme.dark", icon: Moon },
  { value: "system", label: "theme.auto", icon: Monitor },
]

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Image
                src="/logo.svg"
                alt={t("site.name")}
                width={32}
                height={32}
              />
              <span className="hidden font-bold sm:inline-block">
                {t("site.name")}
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/followers">
                <Button variant="ghost" className="h-8">
                  <Heart className="mr-2 h-4 w-4" />
                  {t("nav.follow")}
                </Button>
              </Link>
              <Link href="/bookmarked">
                <Button variant="ghost" className="h-8">
                  <Bookmark className="mr-2 h-4 w-4" />
                  {t("nav.bookmark")}
                </Button>
              </Link>
              <Link href="/boards">
                <Button variant="ghost" className="h-8">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  {t("nav.boards")}
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <Link href="/discussions/new">
              <Button variant="default" className="h-8">
                <PenSquare className="mr-2 h-4 w-4" />
                {t("nav.newPost")}
              </Button>
            </Link>
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image} />
                      <AvatarFallback>
                        {session.user?.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    {t("user.profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    {t("user.settings")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" className="h-8">
                登入
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      {children}

      {/* 页脚 */}
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <a
              href="https://support.kater.me/docs/policy/terms-of-service"
              className="text-sm text-muted-foreground hover:underline"
            >
              {t("footer.terms")}
            </a>
            <a
              href="https://support.kater.me/docs/policy/privacy-policy"
              className="text-sm text-muted-foreground hover:underline"
            >
              {t("footer.privacy")}
            </a>
            <a
              href="https://support.kater.me/docs/help"
              className="text-sm text-muted-foreground hover:underline"
            >
              {t("footer.contact")}
            </a>
            <a
              href="https://support.kater.me/"
              className="text-sm text-muted-foreground hover:underline"
            >
              {t("footer.help")}
            </a>
          </div>

          <div className="flex items-center gap-4">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={theme === value ? "default" : "ghost"}
                size="icon"
                onClick={() => setTheme(value)}
                className="h-8 w-8"
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
