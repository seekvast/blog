import * as React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Portal } from "@radix-ui/react-portal";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { BoardSelect } from "@/components/board-select";
import { useBoardChildrenStore } from "@/store/board-children";
import { toast } from "@/components/ui/use-toast";
import { BoardChild } from "@/types/board";
import { useMarkdownEditor } from "@/store/md-editor";
import { Editor } from "@/components/editor/Editor";
import { discussionService } from "@/services/discussion";
import { AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { PollEditor } from "./poll-editor";
import { PollPreview } from "./poll-preview";
import { PollData } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreatePostModal({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<(() => void) | null>(
    null
  );
  const {
    content,
    setContent,
    hasUnsavedContent,
    setHasUnsavedContent,
    setIsOpen,
    setOnClose,
  } = useMarkdownEditor();

  React.useEffect(() => {
    setIsOpen(open);
    setOnClose((confirmed?: boolean) => {
      if (hasUnsavedContent && !confirmed) {
        setShowConfirmDialog(true);
        setPendingAction(() => () => {
          setShowConfirmDialog(false);
          onOpenChange(false);
        });
      } else {
        onOpenChange(false);
      }
    });
    return () => {
      setIsOpen(false);
      setOnClose(null);
    };
  }, [open, hasUnsavedContent, onOpenChange, setIsOpen, setOnClose]);

  const [title, setTitle] = React.useState("");
  const [selectedBoard, setSelectedBoard] = React.useState<number | undefined>(
    0
  );
  const [selectedChildBoard, setSelectedChildBoard] = React.useState<
    number | undefined
  >();
  const [loadingChildren, setLoadingChildren] = React.useState(false);
  const [attachments, setAttachments] = React.useState<
    { id: number; file_name: string; file_type: string }[]
  >([]);
  const [isPollEditing, setIsPollEditing] = React.useState(false);
  const [pollOptions, setPollOptions] = React.useState<string[]>(["", ""]);
  const [isMultipleChoice, setIsMultipleChoice] = React.useState(false);
  const [showVoters, setShowVoters] = React.useState(false);
  const [hasDeadline, setHasDeadline] = React.useState(false);
  const [pollStartTime, setPollStartTime] = React.useState("");
  const [pollEndTime, setPollEndTime] = React.useState("");
  const [pollData, setPollData] = React.useState<PollData | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { boardChildren, setBoardChildren: setBoardChildren } =
    useBoardChildrenStore();

  const loadBoardChildren = React.useCallback(
    async (boardId: number) => {
      try {
        setLoadingChildren(true);

        // 如果 store 中没有，则请求 API
        const data = await api.boards.getChildren(boardId);
        // 缓存到 store 中
        setBoardChildren(data);
      } catch (error) {
        console.error("Failed to load board children:", error);
      } finally {
        setLoadingChildren(false);
      }
    },
    [setBoardChildren]
  );

  React.useEffect(() => {
    if (selectedBoard) {
      loadBoardChildren(selectedBoard);
    } else {
      setBoardChildren({
        code: 0,
        items: [],
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
        message: "",
      });
    }
  }, [selectedBoard, loadBoardChildren]);

  React.useEffect(() => {
    const hasUnsaved =
      title.trim() !== "" ||
      content.trim() !== "" ||
      attachments.length > 0 ||
      pollData !== null ||
      isPollEditing;
    setHasUnsavedContent(hasUnsaved);
    return () => {
      setHasUnsavedContent(false);
    };
  }, [
    title,
    content,
    attachments,
    pollData,
    isPollEditing,
    setHasUnsavedContent,
  ]);

  React.useEffect(() => {
    if (open) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (hasUnsavedContent) {
          e.preventDefault();
          e.returnValue = "";
          return "";
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () =>
        window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [open, hasUnsavedContent]);

  const handlePollConfirm = () => {
    setPollData({
      options: pollOptions,
      isMultipleChoice,
      showVoters,
      hasDeadline,
      startTime: pollStartTime,
      endTime: pollEndTime,
    });
    setIsPollEditing(false);
  };

  const handleDeletePoll = () => {
    setPollData(null);
    setPollOptions(["", ""]);
    setIsMultipleChoice(false);
    setShowVoters(false);
    setHasDeadline(false);
    setPollStartTime("");
    setPollEndTime("");
    setIsPollEditing(false);
  };

  const handlePollEdit = () => {
    if (!pollData) return;

    setPollOptions(pollData.options);
    setIsMultipleChoice(pollData.isMultipleChoice);
    setShowVoters(pollData.showVoters);
    setHasDeadline(pollData.hasDeadline);
    if (pollData.startTime) {
      setPollStartTime(pollData.startTime);
    }
    if (pollData.endTime) {
      setPollEndTime(pollData.endTime);
    }
    setIsPollEditing(true);
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      console.error("请输入标题");
      return;
    }

    if (!selectedBoard) {
      console.error("请选择板块");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        title: title.trim(),
        content: content.trim(),
        board_id: selectedBoard,
        board_child_id: selectedChildBoard || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        poll: pollData,
      };

      await api.discussions.create(data);
      console.log("发布成功");
      onOpenChange(false);
      if (window.location.pathname !== "/") {
        router.push("/");
      }
      router.refresh();
    } catch (error) {
      console.error("发布失败", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = React.useCallback(() => {
    // 处理保存草稿逻辑
    console.log("Save draft", { title, content });
  }, [title, content]);

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("attachment_type", "topics_images");

    try {
      const response = await api.upload.image(formData);

      if (response.code === 0) {
        const imageUrl = `${response.data.host}${response.data.file_path}`;
        const newAttachment = {
          id: response.data.id,
          file_name: response.data.file_name,
          file_type: "image",
        };
        setAttachments((prev) => [...prev, newAttachment]);
        return imageUrl;
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "图片上传失败",
      });
      return null;
    }
  };

  const resetAllStates = React.useCallback(() => {
    setTitle("");
    setContent("");
    setSelectedBoard(0);
    setSelectedChildBoard(undefined);
    setAttachments([]);
    setPollData(null);
    setPollOptions(["", ""]);
    setIsMultipleChoice(false);
    setShowVoters(false);
    setHasDeadline(false);
    setPollStartTime("");
    setPollEndTime("");
    setIsPollEditing(false);
  }, []);

  const handleClose = React.useCallback(() => {
    resetAllStates();
    onOpenChange(false);
  }, [onOpenChange, resetAllStates]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, handleClose]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // 当模态框关闭时重置状态
  React.useEffect(() => {
    if (!open) {
      resetAllStates();
    }
  }, [open, resetAllStates]);

  return (
    <Portal>
      <div
        className={cn(
          "fixed inset-0 top-14 z-40 transform bg-background transition-transform duration-500 ease-out overflow-y-auto",
          open ? "translate-y-0" : "translate-y-full"
        )}
        style={{ height: "calc(100% - 56px)" }}
      >
        <div className="bg-theme-background h-full flex flex-col mx-auto w-[1360px] mt-8 px-4">
          <div className="sticky-header">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-medium leading-none">发布文章</h1>
              <BoardSelect value={selectedBoard} onChange={setSelectedBoard} />
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={handleClose}
              >
                取消
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  if (!pollData && !isPollEditing) {
                    setIsPollEditing(true);
                  }
                }}
                disabled={!!pollData || isPollEditing}
              >
                投票
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={handleSaveDraft}
              >
                保存草稿箱
              </Button>
              <Button
                size="sm"
                className="rounded-full"
                onClick={handlePublish}
                disabled={isSubmitting}
              >
                {isSubmitting ? "发布中..." : "发布"}
              </Button>
            </div>
          </div>

          <div className="border-t py-4">
            <h3 className="text-sm font-medium mb-2">子版</h3>
            <div className="flex flex-wrap gap-2">
              {loadingChildren ? (
                <div className="text-sm text-muted-foreground">加载中...</div>
              ) : boardChildren.items.length > 0 ? (
                boardChildren.items.map((child) => (
                  <Badge
                    key={child.id}
                    variant={
                      selectedChildBoard === child.id ? "default" : "secondary"
                    }
                    className="cursor-pointer"
                    onClick={() => setSelectedChildBoard(child.id)}
                  >
                    {child.name}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">暂无子版</div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="py-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl p-2 rounded-lg border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary"
                placeholder="输入标题..."
              />
              <div className="mt-4">
                {isPollEditing ? (
                  <PollEditor
                    pollOptions={pollOptions}
                    setPollOptions={setPollOptions}
                    isMultipleChoice={isMultipleChoice}
                    setIsMultipleChoice={setIsMultipleChoice}
                    showVoters={showVoters}
                    setShowVoters={setShowVoters}
                    hasDeadline={hasDeadline}
                    setHasDeadline={setHasDeadline}
                    pollStartTime={pollStartTime}
                    setPollStartTime={setPollStartTime}
                    pollEndTime={pollEndTime}
                    setPollEndTime={setPollEndTime}
                    onCancel={() => setIsPollEditing(false)}
                    onConfirm={handlePollConfirm}
                  />
                ) : (
                  <PollPreview
                    pollData={pollData}
                    onDelete={handleDeletePoll}
                    onEdit={handlePollEdit}
                  />
                )}
              </div>

              <Editor
                placeholder="开始编写正文..."
                className="min-h-[400px] mt-4"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 确认离开对话框 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-white">
          <DialogHeader className="border-b border-destructive/10 pb-4">
            <DialogTitle className="text-destructive flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>确认离开？</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="flex flex-col gap-2">
              <p className="text-base text-foreground">
                你有未保存的内容，确定要离开吗？
              </p>
              <p className="text-sm font-medium text-destructive">
                离开后未保存的内容将会丢失
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
            >
              取消
            </Button>
            <Button variant="destructive" onClick={() => pendingAction?.()}>
              确认离开
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Portal>
  );
}
