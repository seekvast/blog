"use client"

import * as React from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EditorHeaderProps extends React.HTMLAttributes<HTMLElement> {
  onPublish?: () => void
  onSaveDraft?: () => void
}

export function EditorHeader({
  className,
  onPublish,
  onSaveDraft,
  ...props
}: EditorHeaderProps) {
  const { data: session } = useSession()

  return (
    <header className={cn("sticky top-0 z-50 border-b bg-white", className)} {...props}>
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold">
          Logo
        </Link>

        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            投票
          </Button>
          <Button variant="outline" size="sm" onClick={onSaveDraft}>
            保存草稿箱
          </Button>
          <Button size="sm" onClick={onPublish}>
            发布
          </Button>
          {session && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user?.image || ""} />
              <AvatarFallback>{session.user?.username?.[0]}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </header>
  )
}
