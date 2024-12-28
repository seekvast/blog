"use client"

import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostCard } from "@/components/post-card"
import { BoardMembers } from "@/components/board-members"
import { posts } from "@/data/mock"

export default function BoardDetail() {
  const { t } = useTranslation()

  return (
    <div className="container py-6">
      {/* 看板头部信息 */}
      <div className="flex items-start gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src="/board-avatar.png" alt="Board name" />
          <AvatarFallback>BD</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">色图交流</h1>
            <Button variant="outline" size="sm">已加入</Button>
          </div>
          <p className="text-muted-foreground">私密 · 总99成员 · 电影</p>
          <p className="text-sm text-muted-foreground">这是一个介绍一个介绍一个介绍一个介绍一个介绍一个介绍一个介绍一个介绍一个？</p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <Avatar key={i} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={`/avatars/0${i}.png`} />
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <BoardMembers />
          </div>
        </div>
      </div>

      {/* 内容标签页 */}
      <Tabs defaultValue="posts" className="mt-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger 
            value="posts"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            文章
            <span className="ml-2 text-xs text-muted-foreground">142篇文章</span>
          </TabsTrigger>
          <TabsTrigger 
            value="rules"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            规则
          </TabsTrigger>
          <TabsTrigger 
            value="subboards"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            子版
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
          <div className="flex justify-between mb-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-primary">
                热门
              </Button>
              <Button variant="ghost" size="sm">
                最新
              </Button>
            </div>
            <Button size="sm">发布文章</Button>
          </div>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="rules">
          <div className="prose max-w-none">
            <h2>社区规则</h2>
            <ol>
              <li>禁止发布违法内容</li>
              <li>禁止发布广告、垃圾信息</li>
              <li>尊重原创，转载需注明出处</li>
              <li>友善交流，互相尊重</li>
            </ol>
          </div>
        </TabsContent>
        <TabsContent value="subboards">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={`/board-${i}.png`} />
                    <AvatarFallback>SB{i}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">子版块 {i}</h3>
                    <p className="text-sm text-muted-foreground">221篇文章</p>
                  </div>
                  <Button variant="outline" size="sm">加入</Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
