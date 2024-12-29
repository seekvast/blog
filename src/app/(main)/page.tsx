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
  Share,
  Bookmark,
  ChevronDown,
  LayoutGrid,
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

// 示例数据
const SAMPLE_POSTS = [
  {
    id: "1",
    author: {
      name: "那些喜欢小女生的根本人渣==",
      avatar: "/avatar.jpg",
    },
    content:
      "那些喜欢小女生的根本人渣==,rt那些喜欢小女生的根本人渣==,rt那些喜欢小女生的根本人渣==,rt",
    image: "/post-image-1.jpg",
    stats: {
      likes: 123,
      comments: 123,
    },
    createdAt: "今天14:15",
    source: "看板名称",
    type: "成人",
    boardType: "子看板",
  },
  {
    id: "2",
    author: {
      name: "那些喜欢小女生的根本人渣==",
      avatar: "/avatar.jpg",
    },
    content:
      "想弄個手照集中串 大家願意分享自己的手照嗎想弄個手照集中串 大家願意分享自己的手照嗎想弄個手照集中串 大家願意分享自己的手照嗎",
    stats: {
      likes: 123,
      comments: 123,
    },
    createdAt: "今天14:15",
    source: "看板名称",
    boardType: "子看板",
  },
];

// 相关文章
const RELATED_POSTS = [
  "求番號或是女優的名字",
  "26天=1個月",
  "這部有無修的嗎?",
  "文哲大ㄟ真屌",
  "加入收藏貼文",
  "把累積起來的本本分享...",
  "「郭家軍」被禁黨籍",
  "敏感羅莉娘性感精油按...",
  "這才是我想看分利可麗絲",
  "好餓乜",
];

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      {/* 顶部导航 */}
      <div className="bg-white">
        <div className="mx-auto w-[808px] px-8">
          <div className="flex h-[60px] items-center justify-between border-b border-[#EAEAEA]">
            <div className="flex items-center space-x-8">
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-primary hover:bg-transparent hover:text-primary"
              >
                推荐
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                追踪
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                标签
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                标签
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
                className="h-8 text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="mx-auto w-[808px] px-8">
        <div className="divide-y">
          {SAMPLE_POSTS.map((post) => (
            <article key={post.id} className="p-4">
              <div className="flex space-x-3">
                {/* 作者头像 */}
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  {/* 作者信息 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{post.author.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {post.createdAt}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        來自 {post.source}
                      </span>
                      {post.type && (
                        <Badge
                          variant="secondary"
                          className="bg-red-50 text-red-600"
                        >
                          {post.type}
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary"
                      >
                        {post.boardType}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Share className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            {t("post.report")}
                          </DropdownMenuItem>
                          <DropdownMenuItem>{t("post.block")}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* 帖子内容 */}
                  <div className="space-y-3">
                    <p className="text-sm">{post.content}</p>
                    {post.image && (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                        <Image
                          src={post.image}
                          alt="Post image"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.stats.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.stats.comments}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
