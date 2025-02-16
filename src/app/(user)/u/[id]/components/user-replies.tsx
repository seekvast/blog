"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, Reply } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ReplyItem {
  id: string;
  title: string;
  articleTitle: string;
  content: string;
  date: string;
  likes: number;
  dislikes: number;
  user: {
    name: string;
    avatar?: string;
  };
}

interface UserRepliesProps {
  replies?: ReplyItem[];
}

export function UserReplies({ replies = [] }: UserRepliesProps) {
  // 模拟数据
  const mockReplies: ReplyItem[] = [
    {
      id: "1",
      title: "《有没有色图》",
      articleTitle:
        "收支是要平衡的，这个世界永远是自然法则在起作用，而不是你眼下什么最快就怎么来。",
      content:
        "收支是要平衡的，这个世界永远是自然法则在起作用，而不是你眼下什么最快就怎么来。",
      date: "2020/04/11",
      likes: 0,
      dislikes: 0,
      user: {
        name: "用户1",
        avatar: "/avatars/default.png",
      },
    },
    {
      id: "2",
      title: "《有没有色图》",
      articleTitle:
        "收支是要平衡的，这个世界永远是自然法则在起作用，而不是你眼下什么最快就怎么来。",
      content:
        "收支是要平衡的，这个世界永远是自然法则在起作用，而不是你眼下什么最快就怎么来。",
      date: "2020/04/11",
      likes: 0,
      dislikes: 0,
      user: {
        name: "用户2",
        avatar: "/avatars/default.png",
      },
    },
    {
      id: "3",
      title: "《有没有色图》",
      articleTitle:
        "收支是要平衡的，这个世界永远是自然法则在起作用，而不是你眼下什么最快就怎么来。",
      content:
        "收支是要平衡的，这个世界永远是自然法则在起作用，而不是你眼下什么最快就怎么来。",
      date: "2020/04/11",
      likes: 0,
      dislikes: 0,
      user: {
        name: "用户3",
        avatar: "/avatars/default.png",
      },
    },
  ];

  const replyList = replies.length > 0 ? replies : mockReplies;

  return (
    <div>
      <h3 className="pb-3 text-md font-semibold mb-6 border-b">我的回复</h3>
      <div className="space-y-4">
        {replyList.map((reply) => (
          <div key={reply.id} className="bg-white rounded-lg py-4">
            <div className="flex gap-4">
              {/* 左侧头像 */}
              <div className="flex-shrink-0">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={reply.user.avatar} alt={reply.user.name} />
                  <AvatarFallback>{reply.user.name[0]}</AvatarFallback>
                </Avatar>
              </div>

              {/* 右侧内容区 */}
              <div className="flex-1 space-y-3">
                {/* 回复的文章标题 */}
                <div>
                  <Link
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {reply.title}
                  </Link>
                </div>

                {/* 引用的内容 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Reply className="w-4 h-4 flex-shrink-0" />
                    <span>{reply.articleTitle}</span>
                  </div>
                </div>

                {/* 回复内容 */}
                <div className="text-sm text-gray-900">{reply.content}</div>

                {/* 底部操作栏 */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <button className="hover:text-gray-900 p-1">
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button className="hover:text-gray-900 p-1">
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                  <span>{reply.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
