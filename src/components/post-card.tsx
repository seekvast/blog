import * as React from "react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { zhTW, zhCN } from "date-fns/locale"
import { usePathname } from "next/navigation"
import { MessageSquare, Heart, Eye, MoreVertical, PinIcon, Vote } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface PostCardProps {
  mode: "card" | "list"
  title: string
  content: string
  image?: string
  author: {
    name: string
    avatar?: string
  }
  board: {
    name: string
    icon?: string
  }
  stats: {
    likes: number
    comments: number
    views: number
  }
  isRead: boolean
  isPinned: boolean
  hasVote: boolean
  createdAt: string
}

export function PostCard({
  mode,
  title,
  content,
  image,
  author,
  board,
  stats,
  isRead,
  isPinned,
  hasVote,
  createdAt,
}: PostCardProps) {
  const pathname = usePathname()
  const locale = pathname.startsWith("/zh-Hans") ? "zh-Hans" : "zh-Hant-TW"
  const dateLocale = locale.startsWith("zh-Hans") ? zhCN : zhTW

  return (
    <article className={cn(
      "group relative rounded-lg border p-4 transition-colors hover:bg-accent",
      isRead && "opacity-60"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={board.icon} />
            <AvatarFallback>{board.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{board.name}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Avatar className="mr-1 h-4 w-4">
                <AvatarImage src={author.avatar} />
                <AvatarFallback>{author.name[0]}</AvatarFallback>
              </Avatar>
              {author.name} •{" "}
              {formatDistanceToNow(new Date(createdAt), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isPinned && <PinIcon className="h-4 w-4 text-blue-500" />}
          {hasVote && <Vote className="h-4 w-4" />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>收藏文章</DropdownMenuItem>
              <DropdownMenuItem>分享文章</DropdownMenuItem>
              <DropdownMenuItem>举报文章</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className={cn("mt-4", mode === "list" && "space-y-2")}>
        <h3 className={cn(
          "line-clamp-2 text-lg font-semibold",
          isRead ? "text-muted-foreground" : "text-foreground"
        )}>
          {title}
        </h3>
        {mode === "card" && image && (
          <div className="relative mt-2 aspect-video overflow-hidden rounded-lg">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <p className={cn(
          "line-clamp-2 text-sm",
          isRead ? "text-muted-foreground" : "text-foreground"
        )}>
          {content}
        </p>
      </div>

      <div className="mt-4 flex items-center space-x-4 text-sm text-muted-foreground">
        <div className="flex items-center">
          <Heart className="mr-1 h-4 w-4" />
          {stats.likes}
        </div>
        <div className="flex items-center">
          <MessageSquare className="mr-1 h-4 w-4" />
          {stats.comments}
        </div>
        <div className="flex items-center">
          <Eye className="mr-1 h-4 w-4" />
          {stats.views}
        </div>
      </div>
    </article>
  )
}
