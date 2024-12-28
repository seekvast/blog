"use client"

import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Editor } from "@/components/editor"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, MoreHorizontal, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function PostDetail() {
  const { t } = useTranslation()

  return (
    <div className="flex">
      {/* 左侧边栏 */}
      <div className="hidden w-64 flex-shrink-0 border-r p-4 lg:block">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/board-avatar.png" alt="Board avatar" />
              <AvatarFallback>BD</AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <h2 className="truncate text-sm font-medium">色图交流</h2>
              <p className="text-xs text-muted-foreground">99位成员</p>
            </div>
            <Button variant="outline" size="sm">已加入</Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent">
              <span className="text-sm font-medium">置顶</span>
              <ChevronDown className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent">
              <span className="text-sm font-medium">最新</span>
              <ChevronDown className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent">
              <span className="text-sm font-medium">热门</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {/* 文章内容 */}
          <article className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src="/avatars/01.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">用户名</span>
                    <Badge variant="outline" className="rounded-sm">管理员</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>2小时前</span>
                    <span>·</span>
                    <span>142次浏览</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">关注</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>编辑</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">删除</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div>
              <h1 className="text-xl font-bold">一人一张二次元图片月末不能断更</h1>
            </div>

            <div className="prose max-w-none">
              <p>每天更新每天更新每天更新每天更新每天更新每天更新每天更新每天更新每天更新每天更新每天更新每天更新</p>
              <img src="/post-image.jpg" alt="Post image" className="rounded-lg" />
            </div>

            <div className="flex items-center gap-4 border-t pt-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <Heart className="h-4 w-4" />
                <span>32</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>24</span>
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </article>

          {/* 评论区 */}
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">24条评论</h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Editor />
                  <div className="mt-2 flex justify-end">
                    <Button size="sm">发表评论</Button>
                  </div>
                </div>
              </div>

              {/* 评论列表 */}
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`/avatars/0${i + 1}.png`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">用户名</span>
                          <span className="text-sm text-muted-foreground">2小时前</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-1 text-sm">
                        这是评论内容这是评论内容这是评论内容这是评论内容这是评论内容
                      </div>
                      <div className="mt-2 flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="h-auto p-0">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>12</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-auto p-0">
                          回复
                        </Button>
                      </div>

                      {/* 回复列表 */}
                      <div className="mt-3 space-y-3 border-l-2 pl-4">
                        {Array.from({ length: 2 }).map((_, j) => (
                          <div key={j} className="flex gap-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={`/avatars/0${j + 1}.png`} />
                              <AvatarFallback>U{j}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">用户名</span>
                                  <span className="text-sm text-muted-foreground">1小时前</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="mt-1 text-sm">
                                这是回复内容这是回复内容这是回复内容这是回复内容
                              </div>
                              <div className="mt-2 flex items-center gap-4">
                                <Button variant="ghost" size="sm" className="h-auto p-0">
                                  <Heart className="mr-2 h-3 w-3" />
                                  <span>6</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-auto p-0">
                                  回复
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧边栏 */}
      <div className="hidden w-64 flex-shrink-0 border-l p-4 xl:block">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">作者信息</h3>
            <div className="mt-2 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/avatars/01.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">用户名</div>
                  <p className="text-sm text-muted-foreground">这是用户简介</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="font-medium">142</div>
                  <div className="text-muted-foreground">文章</div>
                </div>
                <div>
                  <div className="font-medium">1.2k</div>
                  <div className="text-muted-foreground">关注者</div>
                </div>
                <div>
                  <div className="font-medium">328</div>
                  <div className="text-muted-foreground">点赞</div>
                </div>
              </div>
              <Button className="mt-3 w-full" size="sm">
                关注
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
