"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { MessageSquare, Heart, Share2, MoreHorizontal, ChevronDown, Image as ImageIcon, Quote, Link as LinkIcon, AtSign, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// 示例数据
const POST = {
  id: "1",
  author: {
    name: "MAZDA @saasbas",
    avatar: "/avatar.jpg",
    role: "创建者"
  },
  title: "一人发一个百合图片奥,不要白票",
  createdAt: "2020/04/11",
  content: "我想看色图,我想看色图呀\n\n标準文章範例\n標準文章範例\n標準文章範例\n標準文章範例",
  boardInfo: {
    name: "来自 看板名称",
    icon: "🎭",
    type: "子看板"
  }
}

const COMMENTS = [
  {
    id: 1,
    author: {
      name: "李荣 @saassaa",
      avatar: "/avatar.jpg",
    },
    content: "收支是要平衡的，这个世界永远是自然法则在起作用，而不是你眼下什么最快就怎么来。",
    createdAt: "2小时前",
    stats: {
      likes: 99,
      dislikes: 99
    },
    replyTo: "@wangxx"
  }
]

export default function DiscussionDetailPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[808px] bg-white">
        {/* 主贴 */}
        <div className="border-b px-6 py-4">
          <div className="mb-3">
            <h1 className="text-lg font-medium">{POST.title}</h1>
          </div>
          
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage src={POST.author.avatar} alt={POST.author.name} />
              <AvatarFallback>{POST.author.name[0]}</AvatarFallback>
            </Avatar>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{POST.author.name}</span>
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-xs">
                  {POST.author.role}
                </Badge>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{POST.createdAt}</span>
              </div>
              
              <div className="mt-1 flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{POST.boardInfo.icon}</span>
                <span>{POST.boardInfo.name}</span>
                <Badge variant="secondary" className="bg-gray-100 text-xs">
                  {POST.boardInfo.type}
                </Badge>
              </div>
              
              <div className="mt-3 text-sm whitespace-pre-wrap">{POST.content}</div>

              <div className="mt-4">
                {/* 投票区域 */}
                <div className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center space-x-2">
                    <span className="text-xs">多选</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">允许用户查看投票人</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">截止日期2022/11/15 14:55:04</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">有XXX人参加</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 rounded-lg border p-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      <span className="text-sm">选项111</span>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border p-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      <span className="text-sm">选项111</span>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border p-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      <span className="text-sm">选项111</span>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border p-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      <span className="text-sm">选项111</span>
                    </div>
                  </div>
                  
                  <Button size="sm" className="mt-3 w-full text-sm">确认投票</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 评论列表 */}
        <div>
          {COMMENTS.map((comment) => (
            <div key={comment.id} className="border-b px-6 py-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                  <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{comment.author.name}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {comment.replyTo && (
                    <Link href="#" className="mt-1 inline-block text-xs text-blue-600">
                      回复 {comment.replyTo}
                    </Link>
                  )}
                  
                  <p className="mt-2 text-sm whitespace-pre-wrap">{comment.content}</p>
                  
                  <div className="mt-2 flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="h-6 space-x-1 text-xs">
                      <Heart className="h-3 w-3" />
                      <span>{comment.stats.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 space-x-1 text-xs">
                      <MessageSquare className="h-3 w-3" />
                      <span>{comment.stats.dislikes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                      回复
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* 评论编辑器 */}
          <div className="px-6 py-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage src="/avatar.jpg" alt="Current user" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="rounded-lg border">
                  <div className="border-b p-1.5">
                    <div className="flex items-center space-x-0.5">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <span className="font-bold text-xs">B</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <span className="underline text-xs">U</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <span className="italic text-xs">I</span>
                      </Button>
                      <div className="h-4 w-px bg-border" />
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ImageIcon className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Quote className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <LinkIcon className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <AtSign className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Clock className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <Textarea
                    placeholder="说两句吧~"
                    className="min-h-[80px] resize-none border-0 text-sm focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
