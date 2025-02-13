"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ReplyItem {
  id: string;
  title: string;
  articleTitle: string;
  content: string;
  date: string;
  likes: number;
  dislikes: number;
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
      articleTitle: "收支是要平衡的，这个世界永远是自然法则在起作用，而不是你眼下什么最快就怎么来。",
      content: "收支是要平衡的，这个世界永远是自然法则在起作用，而不是你眼下什么最快就怎么来。",
      date: "2020/04/11",
      likes: 0,
      dislikes: 0
    },
    {
      id: "2",
      title: "《有没有色图》",
      articleTitle: "收支是要平衡的，这个世界永远是自然法则在起作用，而不是你眼下什么最快就怎么来。",
      content: "收支是要平衡的，这个世界永远是自然法则在起作用，而不是你眼下什么最快就怎么来。",
      date: "2020/04/11",
      likes: 0,
      dislikes: 0
    },
    {
      id: "3",
      title: "《有没有色图》",
      articleTitle: "收支是要平衡的，这个世界永远是自然法则在起作用，而不是你眼下什么最快就怎么来。",
      content: "收支是要平衡的，这个世界永远是自然法则在起作用，而不是你眼下什么最快就怎么来。",
      date: "2020/04/11",
      likes: 0,
      dislikes: 0
    }
  ];

  const replyList = replies.length > 0 ? replies : mockReplies;

  return (
    <div className="space-y-4">
      {replyList.map((reply) => (
        <div key={reply.id} className="bg-white rounded-lg">
          <div className="p-4 space-y-3">
            {/* 回复的文章标题 */}
            <div className="text-sm text-gray-500">
              于{" "}
              <Link href="#" className="text-blue-600 hover:text-blue-700">
                《{reply.title}》
              </Link>
            </div>

            {/* 引用的内容 */}
            <div className="flex gap-2">
              <div className="flex-shrink-0 pt-1">
                <div className="w-4 h-4 rounded-full bg-gray-200" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  {reply.articleTitle}
                </div>
              </div>
            </div>

            {/* 回复内容 */}
            <div className="text-sm text-gray-900">
              {reply.content}
            </div>

            {/* 底部操作栏 */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <button className="hover:text-gray-900">推</button>
                <button className="hover:text-gray-900">踩</button>
              </div>
              <span>{reply.date}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
