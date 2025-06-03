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
  Unlock,
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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePostEditorStore } from "@/store/post-editor";
import { useLoginModal } from "@/components/providers/login-modal-provider";
interface DiscussionActionsProps {
  discussion: Discussion;
  onChange?: (deletedSlug: string) => void;
}

export function DiscussionActions({
  discussion,
  onChange,
}: DiscussionActionsProps) {
  const { isVisible, onClose, setIsVisible, setOpenFrom } =
    usePostEditorStore();
  const { openLoginModal } = useLoginModal();
  const [reportToAdminOpen, setReportToAdminOpen] = useState(false);
  const [reportToKaterOpen, setReportToKaterOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedBoardChildId, setSelectedBoardChildId] = useState<number>(
    discussion.board_child_id
  );
  const [confirmAction, setConfirmAction] = useState<
    "delete" | "setBoardStickied" | "closeReply" | null
  >(null);
  const { user } = useAuth();
  const isAuthor = user?.hashid === discussion.user.hashid;
  const isManager = user?.hashid === discussion.board.manager?.user_hashid;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const clearQueryCache = () => {
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
    // 更新用户文章列表
    queryClient.invalidateQueries({
      queryKey: ["userDiscussions"],
    });
    onChange?.(discussion.slug);
  };
  //获取看板子版列表
  const { data: boardChildren } = useQuery({
    queryKey: ["boardChildren", discussion.board_id],
    queryFn: () => api.boards.getChildren(discussion.board_id),
  });

  //通过useMutation删除评论
  const deleteMutation = useMutation({
    mutationFn: () => api.discussions.delete({ slug: discussion.slug }),
    onSuccess: () => {
      clearQueryCache();
    },
    onError: (error) => {
      toast({
        title: "刪除失敗",
        description: error.message,
      });
    },
  });

  // 更改子版
  const changeBoardMutation = useMutation({
    mutationFn: () =>
      api.discussions.setting({
        slug: discussion.slug,
        board_child_id: selectedBoardChildId,
        action: "board_child",
      }),
    onSuccess: () => {
      clearQueryCache();
      setShowDialog(false);
      setSelectedBoardChildId(discussion.board_child_id);
    },
    onError: (error) => {
      toast({
        title: "失敗",
        description: error.message,
      });
    },
  });

  const handleChangeBoardChild = () => {
    if (!selectedBoardChildId) {
      toast({
        title: "請選擇子版",
        description: "請選擇要移動到的子版",
      });
      return;
    }
    changeBoardMutation.mutate();
    clearQueryCache();
  };

  // 更改帖子类型
  const changePostTypeMutation = useMutation({
    mutationFn: () =>
      api.discussions.setting({
        slug: discussion.slug,
        post_type: "discussionBoardStickied",
        action: "stickied",
      }),
    onSuccess: () => {
      clearQueryCache();
    },
    onError: (error) => {
      toast({
        title: "失敗",
        description: error.message,
      });
    },
  });

  const closeReplyMutation = useMutation({
    mutationFn: () =>
      api.discussions.setting({
        slug: discussion.slug,
        action: "close_reply",
      }),
    onSuccess: () => {
      clearQueryCache();
    },
    onError: (error) => {
      toast({
        title: "失敗",
        description: error.message,
      });
    },
  });
  return (
    <>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <MoreHorizontal className="flex-shrink-0 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
          {isAuthor && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setOpenFrom("edit");
                  setIsVisible(true);
                  usePostEditorStore.setState({
                    discussion: discussion,
                  });
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>編輯</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive"
                onClick={() => {
                  setShowConfirm(true);
                  setConfirmAction("delete");
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>刪除</span>
              </DropdownMenuItem>
            </>
          )}
          {!isAuthor && (
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

          {discussion.board?.manager && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setConfirmAction("setBoardStickied");
                  setShowConfirm(true);
                }}
              >
                <PinIcon className="mr-2 h-4 w-4" />
                <span>設為看板公告</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setShowDialog(true);
                }}
              >
                <FolderEdit className="mr-2 h-4 w-4" />
                <span>更改子版</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setConfirmAction("closeReply");
                  setShowConfirm(true);
                }}
              >
                {discussion.is_locked === 0 ? (
                  <Lock className="mr-2 h-4 w-4" />
                ) : (
                  <Unlock className="mr-2 h-4 w-4" />
                )}
                <span>
                  {discussion.is_locked === 0 ? "關閉回覆功能" : "開啟回覆功能"}
                </span>
              </DropdownMenuItem>
            </>
          )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <MoreHorizontal 
          className="flex-shrink-0 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" 
          onClick={() => openLoginModal()}
        />
      )}

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={
          confirmAction === "delete"
            ? "刪除討論"
            : confirmAction === "setBoardStickied"
            ? "設為看板公告"
            : confirmAction === "closeReply"
            ? discussion.is_locked === 0
              ? "關閉回覆功能"
              : "開啟回覆功能"
            : "開啟回覆功能"
        }
        description={
          confirmAction === "delete"
            ? "確定要刪除這則討論嗎？"
            : confirmAction === "setBoardStickied"
            ? "確定要設為看板公告嗎？"
            : confirmAction === "closeReply"
            ? discussion.is_locked === 0
              ? "確定要關閉回覆功能嗎？"
              : "確定要開啟回覆功能嗎？"
            : "確定要開啟回覆功能嗎？"
        }
        confirmText="確定"
        cancelText="取消"
        onConfirm={() => {
          if (confirmAction === "delete") {
            deleteMutation.mutate();
          } else if (confirmAction === "setBoardStickied") {
            changePostTypeMutation.mutate();
          } else if (confirmAction === "closeReply") {
            closeReplyMutation.mutate();
          }
          setShowConfirm(false);
        }}
        variant={confirmAction === "delete" ? "destructive" : "default"}
        loading={
          confirmAction === "delete"
            ? deleteMutation.isPending
            : confirmAction === "setBoardStickied"
            ? changePostTypeMutation.isPending
            : closeReplyMutation.isPending
        }
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
          reported_to: "moderator",
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
          reported_to: "admin",
        }}
      />

      {/* 子版列表Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-h-[60vh] lg:max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg">更改子版</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1">
            <div className="space-y-2 ">
              {boardChildren?.items.map((child) => (
                <div
                  key={child.id}
                  className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedBoardChildId === child.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedBoardChildId(child.id)}
                >
                  <div className="flex-1">
                    <div
                      className={cn(
                        "font-medium",
                        selectedBoardChildId === child.id
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {child.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                setSelectedBoardChildId(discussion.board_child_id);
              }}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleChangeBoardChild}
              disabled={changeBoardMutation.isPending || !selectedBoardChildId}
            >
              {changeBoardMutation.isPending ? "處理中..." : "確認"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
