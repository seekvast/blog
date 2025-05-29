"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Flag,
  AlertTriangle,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog } from "@/components/report/report-dialog";
import { useState } from "react";
import type { Post } from "@/types/discussion";
import { useAuth } from "@/components/providers/auth-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReportTarget } from "@/constants/report-target";

interface CommentActionsProps {
  comment: Post;
  onEdit?: (comment: Post) => void;
}

export function CommentActions({ comment, onEdit }: CommentActionsProps) {
  const [reportToAdminOpen, setReportToAdminOpen] = useState(false);
  const [reportToKaterOpen, setReportToKaterOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAuth();
  const isAuthor = user?.hashid === comment.user.hashid;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  //通过useMutation删除评论
  const deleteMutation = useMutation({
    mutationFn: () => api.posts.delete({ id: comment.id }),
    onSuccess: () => {
      toast({
        title: "刪除成功",
        description: "刪除成功",
      });
      queryClient.invalidateQueries({
        queryKey: [
          "discussion-posts",
          comment.discussion_slug,
          comment.board_id,
        ],
      });
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

  const handleEdit = () => {
    if (onEdit) {
      onEdit(comment);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <MoreHorizontal className="h-4 w-4 cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {isAuthor ? (
            <>
              <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                <span>編輯</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>{deleteMutation.isPending ? "删除中..." : "刪除"}</span>
              </DropdownMenuItem>
            </>
          ) : (
            <>
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
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="删除评论"
        description="确定要删除这条评论吗？"
        confirmText="删除"
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
          user_hashid: comment.user.hashid,
          board_id: comment.board_id,
          post_id: comment.id,
          target: ReportTarget.POST,
          reported_to: "moderator",
        }}
      />

      {/* 向Kater举报对话框 */}
      <ReportDialog
        open={reportToKaterOpen}
        onOpenChange={setReportToKaterOpen}
        title="向Kater檢舉"
        form={{
          user_hashid: comment.user.hashid,
          board_id: comment.board_id,
          post_id: comment.id,
          target: ReportTarget.POST,
          reported_to: "admin",
        }}
      />
    </>
  );
}
