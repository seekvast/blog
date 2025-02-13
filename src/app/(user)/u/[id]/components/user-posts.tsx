"use client";

import React from "react";
import { MoreHorizontal, MessageSquare, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostItem {
  id: string;
  title: string;
  content: string;
  date: string;
  commentCount: number;
  likeCount: number;
  author: {
    name: string;
    avatar?: string;
  };
  board: {
    name: string;
    icon?: string;
  };
  isNsfw?: boolean;
}

interface UserPostsProps {
  posts?: PostItem[];
}

export function UserPosts({ posts = [] }: UserPostsProps) {
  // 模拟数据
  const mockPosts: PostItem[] = [
    {
      id: "1",
      title: "那些喜歡小女生的根本人渣===",
      content: "那些喜歡小女生的根本人渣===,rt那些喜歡小女生的根本人渣===,rt那些喜歡小女生的根本人渣===,rt",
      date: "今天14:15",
      commentCount: 123,
      likeCount: 123,
      author: {
        name: "用户名",
        avatar: "/avatar.jpg"
      },
      board: {
        name: "看板名称",
        icon: "/board-icon.jpg"
      },
      isNsfw: true
    },
    {
      id: "2",
      title: "那些喜歡小女生的根本人渣===",
      content: "想弄個手照集中串 大家願意分享自己的手照嗎想弄個手照集中串 大家願意分享自己的手照嗎想弄個手照集中串 大家願意分享自己的手照嗎",
      date: "今天14:15",
      commentCount: 123,
      likeCount: 123,
      author: {
        name: "用户名",
        avatar: "/avatar.jpg"
      },
      board: {
        name: "看板名称",
        icon: "/board-icon.jpg"
      }
    }
  ];

  const postList = posts.length > 0 ? posts : mockPosts;

  return (
    <div className="space-y-4">
      {postList.map((post) => (
        <div key={post.id} className="bg-white rounded-lg">
          {/* 文章头部 */}
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium hover:text-blue-600">
                    <Link href="#">{post.title}</Link>
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{post.date}</span>
                    {post.isNsfw && (
                      <span className="px-1.5 py-0.5 text-xs text-red-600 bg-red-50 rounded">
                        成人
                      </span>
                    )}
                    <span>来自</span>
                    <Link href="#" className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                      {post.board.icon && (
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={post.board.icon} />
                          <AvatarFallback>{post.board.name[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      {post.board.name}
                    </Link>
                    <Link href="#" className="text-blue-600 hover:text-blue-700">
                      子看板
                    </Link>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>编辑</DropdownMenuItem>
                  <DropdownMenuItem>删除</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* 文章内容 */}
            <p className="text-sm text-gray-900">{post.content}</p>

            {/* 底部操作栏 */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <button className="flex items-center gap-1 hover:text-gray-900">
                <ThumbsUp className="w-4 h-4" />
                <span>{post.likeCount}</span>
              </button>
              <button className="flex items-center gap-1 hover:text-gray-900">
                <MessageSquare className="w-4 h-4" />
                <span>{post.commentCount}</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
