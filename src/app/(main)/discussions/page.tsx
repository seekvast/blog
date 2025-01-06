"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  MessageSquare,
  Heart,
  Share2,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

// 示例数据
const SAMPLE_POSTS = [
  {
    id: "1",
    author: {
      name: "那些喜欢小女生的根本人渣==",
      avatar: "/avatar.jpg",
    },
    title: "那些喜欢小女生的根本人渣==",
    content:
      "那些喜欢小女生的根本人渣==,rt那些喜欢小女生的根本人渣==,rt那些喜欢小女生的根本人渣==,rt",
    image: "/post-image-1.jpg",
    stats: {
      likes: 123,
      comments: 123,
    },
    createdAt: "今天14:15",
    type: "成人",
    boardInfo: "私密 · 99成员 · 电影",
  },
  {
    id: "2",
    author: {
      name: "那些喜欢小女生的根本人渣==",
      avatar: "/avatar.jpg",
    },
    title: "那些喜欢小女生的根本人渣==",
    content:
      "想弄個手照集中串 大家願意分享自己的手照嗎想弄個手照集中串 大家願意分享自己的手照嗎想弄個手照集中串 大家願意分享自己的手照嗎",
    stats: {
      likes: 123,
      comments: 123,
    },
    createdAt: "今天14:15",
    type: "成人",
    boardInfo: "私密 · 99成员 · 电影",
  },
];

const DISCUSSIONS = [
  {
    id: 1,
    title: "讨论标题",
    content: "讨论内容预览...",
    author: {
      name: "作者名",
      avatar: "/avatar.jpg",
    },
    stats: {
      likes: 123,
      comments: 45,
      shares: 67,
    },
    createdAt: "2小时前",
  },
  // Add more discussions as needed
];

export default function DiscussionsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      {/* 看板信息 */}
      <div className="bg-background">
        <div className="mx-auto w-[808px] px-8">
          <div className="flex items-start space-x-3 pb-4">
            <Avatar className="h-12 w-12 rounded-lg">
              <AvatarImage src="/avatar.jpg" alt="色图交流" />
              <AvatarFallback>色</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-medium">色图交流</h1>
                  <Badge variant="secondary" className="bg-red-50 text-red-600">
                    成人
                  </Badge>
                </div>
                <Button variant="outline" size="sm" className="space-x-1">
                  已加入
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                私密 · 99成员 · 电影
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                这是一简介这是一简介这是一简介这是一简介这是一简介这是一简介这是一简介这是一简介这是一简介
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 顶部导航 */}
      <div className="bg-background">
        <div className="mx-auto w-[808px] px-8">
          <div className="flex h-[60px] items-center justify-between border-b border-[#EAEAEA]">
            <div className="flex items-center space-x-8">
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-primary hover:bg-transparent hover:text-primary"
              >
                文章
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                规则
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                子版
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                讨论
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 space-x-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                热门
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 space-x-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-list"
                >
                  <line x1="8" x2="21" y1="6" y2="6" />
                  <line x1="8" x2="21" y1="12" y2="12" />
                  <line x1="8" x2="21" y1="18" y2="18" />
                  <line x1="3" x2="3.01" y1="6" y2="6" />
                  <line x1="3" x2="3.01" y1="12" y2="12" />
                  <line x1="3" x2="3.01" y1="18" y2="18" />
                </svg>
              </Button>
            </div>
          </div>

          {/* 子导航 */}
          <div className="flex items-center space-x-4 py-3 text-sm">
            <Button variant="default" size="sm" className="rounded-full">
              全部
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground"
            >
              综合
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground"
            >
              討論
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground"
            >
              漫畫
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground"
            >
              小說
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground"
            >
              繪畫
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground"
            >
              開期
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground"
            >
              八卦
            </Button>
          </div>
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="mx-auto w-[808px] px-8">
        <div className="divide-y">
          {SAMPLE_POSTS.map((post) => (
            <div key={post.id} className="py-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage
                    src={post.author.avatar}
                    alt={post.author.name}
                  />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="mb-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{post.author.name}</span>
                        {post.type && (
                          <Badge
                            variant="secondary"
                            className="bg-red-50 text-red-600"
                          >
                            {post.type}
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {post.boardInfo}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-base font-medium">{post.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {post.content}
                    </p>
                    {post.image && (
                      <div className="mt-3">
                        <Image
                          src={post.image}
                          alt="Post image"
                          width={200}
                          height={150}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{post.stats.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">{post.stats.comments}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <span className="text-sm">{post.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 讨论列表 */}
      <div className="mx-auto w-[808px] px-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">讨论</h1>
            <Button>发起讨论</Button>
          </div>

          <div className="grid gap-4">
            {DISCUSSIONS.map((discussion) => (
              <Card key={discussion.id} className="p-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={discussion.author.avatar} />
                    <AvatarFallback>{discussion.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{discussion.author.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {discussion.createdAt}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold">{discussion.title}</h3>
                    <p className="text-muted-foreground">{discussion.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <button className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{discussion.stats.likes}</span>
                      </button>
                      <button className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{discussion.stats.comments}</span>
                      </button>
                      <button className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        <span>{discussion.stats.shares}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
