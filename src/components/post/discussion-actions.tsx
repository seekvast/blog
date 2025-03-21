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
import { useAuth } from "@/components/providers/auth-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
interface DiscussionActionsProps {
  discussion: Discussion;
  onDelete?: (deletedSlug: string) => void;
}

export function DiscussionActions({
  discussion,
  onDelete,
}: DiscussionActionsProps) {
  const [reportToAdminOpen, setReportToAdminOpen] = useState(false);
  const [reportToKaterOpen, setReportToKaterOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAuth();
  const isAuthor = user?.hashid === discussion.user.hashid;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  //通过useMutation删除评论
  const deleteMutation = useMutation({
    mutationFn: () => api.discussions.delete({ slug: discussion.slug }),
    onSuccess: () => {
      toast({
        title: "刪除成功",
        description: "刪除成功",
      });
      // 更新所有相关的查询缓存
      queryClient.invalidateQueries({
        queryKey: ["discussions", discussion.slug, discussion.board_id],
      });
      // 更新推荐列表
      queryClient.invalidateQueries({
        queryKey: ["discussions", "recommend"],
      });
      // 更新追踪列表
      queryClient.invalidateQueries({
        queryKey: ["discussions", "trace"],
      });
      onDelete?.(discussion.slug);
    },
    onError: (error) => {
      toast({
        title: "刪除失敗",
        description: error.message,
      });
    },
  });
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };
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
              <DropdownMenuItem
                className="cursor-pointer text-destructive"
                onClick={handleDelete}
              >
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

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="刪除討論"
        description="確定要刪除這則討論嗎？"
        confirmText="刪除"
        cancelText="取消"
        onConfirm={() => {
          deleteMutation.mutate();
          setShowDeleteConfirm(false);
        }}
        variant="destructive"
        loading={deleteMutation.isPending}
      />
      {/* 向管理员举报对话框 */}
      <ReportDialog
        open={reportToAdminOpen}
        onOpenChange={setReportToAdminOpen}
        title="向看板管理員檢舉"
        form={{
          user_hashid: discussion.user.hashid,
          board_id: discussion.board_id,
          discussion_slug: discussion.slug,
          post_id: discussion.main_post.id,
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
          post_id: discussion.main_post.id,
          target: 1,
          reported_to: "moderator",
        }}
      />
    </>
  );
}
