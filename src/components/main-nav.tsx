"use client"

import Link from "next/link"
import { useTranslations } from 'next-intl'
import { cn } from "@/lib/utils"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations()

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        {t('navigation.home')}
      </Link>
      <Link
        href="/topics"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        {t('navigation.topics')}
      </Link>
      <Link
        href="/following"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        {t('navigation.following')}
      </Link>
      <Link
        href="/boards"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        {t('navigation.boards')}
      </Link>
    </nav>
  )
}
