"use client"

import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Member {
  id: number
  name: string
  avatar: string
  role: 'admin' | 'moderator' | 'member'
  joinedAt: string
}

const members: Member[] = [
  {
    id: 1,
    name: "管理员",
    avatar: "/avatars/01.png",
    role: "admin",
    joinedAt: "2023-01-01"
  },
  {
    id: 2,
    name: "版主",
    avatar: "/avatars/02.png",
    role: "moderator",
    joinedAt: "2023-02-01"
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: i + 3,
    name: `用户${i + 1}`,
    avatar: `/avatars/0${(i % 4) + 1}.png`,
    role: "member",
    joinedAt: "2023-03-01"
  }))
]

export function BoardMembers() {
  const { t } = useTranslation()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 text-sm text-muted-foreground">
          查看全部成员
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>成员列表</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{member.name}</span>
                    {member.role === 'admin' && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">管理员</span>
                    )}
                    {member.role === 'moderator' && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600">版主</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    加入于 {member.joinedAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
