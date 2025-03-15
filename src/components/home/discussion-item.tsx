"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { ThumbsUp, MessageSquare, MoreHorizontal, Edit, Trash2, Flag, AlertTriangle, PinIcon, FolderEdit, Lock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscussionPreview } from "@/components/post/discussion-preview";
import type { Discussion } from "@/types/discussion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog } from "@/components/report/report-dialog";

interface DiscussionItemProps {
  discussion: Discussion;
  displayMode: "grid" | "list";
  isLastItem?: boolean;
}

export const DiscussionItem = React.forwardRef<
  HTMLElement,
  DiscussionItemProps
>(({ discussion, displayMode, isLastItem }, ref) => {
  const [reportToAdminOpen, setReportToAdminOpen] = useState(false);
  const [reportToKaterOpen, setReportToKaterOpen] = useState(false);

  const handleReportToAdmin = (reason: string) => {
    console.log("向管理员举报:", discussion.slug, reason);
    // 这里可以添加实际的举报API调用
  };

  const handleReportToKater = (reason: string) => {
    console.log("向Kater举报:", discussion.slug, reason);
    // 这里可以添加实际的举报API调用
  };

  return (
    <article ref={ref} className="py-4 w-full">
      <div className="flex space-x-3 w-full">
        {/* 作者头像 */}
        <Avatar className="h-10 w-10 lg:h-14 lg:w-14 flex-shrink-0">
          <AvatarImage
            src={discussion.user.avatar_url}
            alt={discussion.user.username}
          />
          <AvatarFallback>{discussion.user.username[0]}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <h2 className="min-w-0 flex-1 w-0">
                <Link
                  href={`/d/${discussion.slug}?board_id=${discussion.board_id}`}
                  className="text-xl font-medium text-foreground hover:text-primary line-clamp-1 block w-full overflow-hidden text-ellipsis"
                >
                  {discussion.title}
                </Link>
              </h2>
              {discussion.is_private === 1 && (
                <Badge variant="secondary">私密</Badge>
              )}
              {discussion.is_sticky === 1 && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-600">
                  置顶
                </Badge>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <MoreHorizontal className="flex-shrink-0 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  <span>編輯</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>刪除</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setReportToAdminOpen(true)}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  <span>向管理員檢舉</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setReportToKaterOpen(true)}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  <span>向Kater檢舉</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <PinIcon className="mr-2 h-4 w-4" />
                  <span>設為看板公告</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <FolderEdit className="mr-2 h-4 w-4" />
                  <span>更改子版</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Lock className="mr-2 h-4 w-4" />
                  <span>關閉回覆功能</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-1">
            <DiscussionPreview
              content={discussion.main_post.content}
              displayMode={displayMode}
            />
          </div>

          <div className="mt-3 flex items-center space-x-2 lg:space-x-4 text-sm text-center">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <ThumbsUp className="h-4 w-4 text-sm cursor-pointer" />
              <span>{discussion.up_votes}</span>
            </div>
            <Link
              href={`/d/${discussion.slug}#comment`}
              className="flex items-center space-x-1 text-muted-foreground"
            >
              <MessageSquare className="h-4 w-4 text-sm cursor-pointer" />
              <span>{discussion.comment_count}</span>
            </Link>

            <div className="flex items-center space-x-1 text-muted-foreground">
              <span>{discussion.diff_humans}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <span>
                来自
                <span className="inline-block max-w-[8ch] lg:max-w-[20ch] truncate align-bottom">
                  {discussion.board?.name}
                </span>
              </span>
              <span>#{discussion.board_child?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 向管理员举报对话框 */}
      <ReportDialog
        open={reportToAdminOpen}
        onOpenChange={setReportToAdminOpen}
        title="向看板管理員檢舉"
        onSubmit={handleReportToAdmin}
        reportType="admin"
      />

      {/* 向Kater举报对话框 */}
      <ReportDialog
        open={reportToKaterOpen}
        onOpenChange={setReportToKaterOpen}
        title="向Kater檢舉"
        onSubmit={handleReportToKater}
        reportType="kater"
      />
    </article>
  );
});
