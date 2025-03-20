"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  AlertTriangle,
  PinIcon,
  FolderEdit,
  Lock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog } from "@/components/report/report-dialog";
import { useState } from "react";
import type { Discussion } from "@/types/discussion";

interface DiscussionActionsProps {
  discussion: Discussion;
  isAuthor: boolean;
}

export function DiscussionActions({
  discussion,
  isAuthor,
}: DiscussionActionsProps) {
  const [reportToAdminOpen, setReportToAdminOpen] = useState(false);
  const [reportToKaterOpen, setReportToKaterOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <MoreHorizontal className="flex-shrink-0 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {isAuthor && (
            <>
              <DropdownMenuItem className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                <span>編輯</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>刪除</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
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
          {discussion.board?.manager && (
            <>
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
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 向管理员举报对话框 */}
      <ReportDialog
        open={reportToAdminOpen}
        onOpenChange={setReportToAdminOpen}
        title="向看板管理員檢舉"
        form={{
          user_hashid: discussion.user.hashid,
          board_id: discussion.board_id,
          discussion_slug: discussion.slug,
          target: 1,
          reported_to: "admin",
        }}
      />

      {/* 向Kater举报对话框 */}
      <ReportDialog
        open={reportToKaterOpen}
        onOpenChange={setReportToKaterOpen}
        title="向Kater檢舉"
        form={{
          user_hashid: discussion.user.hashid,
          board_id: discussion.board_id,
          discussion_slug: discussion.slug,
          target: 1,
          reported_to: "moderator",
        }}
      />
    </>
  );
}
