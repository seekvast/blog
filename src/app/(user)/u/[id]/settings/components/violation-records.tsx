"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface ViolationRecord {
  id: string;
  date: string;
  content: string;
  type: string;
  status: "pending" | "resolved" | "rejected";
}

const mockRecords: ViolationRecord[] = [
  {
    id: "1",
    date: "2020/04/11",
    content: "您所發表的「帖子標題」違反了《內容政策》中的「舉報原因」，因此我們已進行刪除。",
    type: "帖子標題",
    status: "resolved",
  },
  {
    id: "2",
    date: "2020/04/11",
    content: "您於「帖子標題」中發表的回覆違反了《內容政策》中的「舉報原因」，因此我們已進行刪除。",
    type: "回覆",
    status: "resolved",
  },
  {
    id: "3",
    date: "2020/04/11",
    content: "我們發現您頻繁違反了我們的《內容政策》，如果您繼續這樣做，我們可能不得不考慮採取進一步的行動。",
    type: "警告",
    status: "pending",
  },
  {
    id: "4",
    date: "2020/04/11",
    content: "您因重次或嚴重違反了我們的《內容政策》，已將您的帳號永久停用。",
    type: "帳號停用",
    status: "resolved",
  },
  {
    id: "5",
    date: "2020/04/11",
    content: "您因「舉報原因」屢次或嚴重違反了我們的《內容政策》，已將您的帳號暫時停用，於 2023年X月X日 15:30 解除。",
    type: "帳號停用",
    status: "rejected",
  },
];

export default function ViolationRecords() {
  return (
    <div className="space-y-4">
      {mockRecords.map((record) => (
        <div
          key={record.id}
          className="flex items-start justify-between py-4 border-b last:border-b-0"
        >
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm text-gray-500">{record.date}</span>
              <span className="text-sm text-gray-500">·</span>
              <span className="text-sm text-gray-500">{record.type}</span>
              {/* <span
                className={cn(
                  "text-sm px-2 py-0.5 rounded-full",
                  {
                    "bg-yellow-50 text-yellow-600": record.status === "pending",
                    "bg-red-50 text-red-600": record.status === "resolved",
                    "bg-gray-50 text-gray-600": record.status === "rejected",
                  }
                )}
              >
                {record.status === "pending" && "處理中"}
                {record.status === "resolved" && "已處理"}
                {record.status === "rejected" && "已駁回"}
              </span> */}
            </div>
            <div className="text-sm">{record.content}</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                查看詳情
              </DropdownMenuItem>
              <DropdownMenuItem>
                申訴
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
