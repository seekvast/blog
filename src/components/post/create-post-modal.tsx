import * as React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Portal } from "@radix-ui/react-portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { BoardSelect } from "@/components/board-select";
import { useBoardChildrenStore } from "@/store/board-children";
import { useMarkdownEditor } from "@/store/md-editor";
import { Editor } from "@/components/editor/Editor";
import { AlertTriangle } from "lucide-react";
import { AttachmentType } from "@/constants/attachment-type";
import { usePostEditorStore } from "@/store/post-editor";

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

export default function CreatePostModal() {
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
  const { isVisible, setIsVisible } = usePostEditorStore();
  const editorRef = React.useRef<{ reset: () => void; isFullscreen: boolean }>(null);
  const boardSelectRef = React.useRef<{ reset: () => void }>(null);
  const [isEditorFullscreen, setIsEditorFullscreen] = React.useState(false);

  // 监听编辑器全屏状态变化
  const handleFullscreenChange = React.useCallback((fullscreen: boolean) => {
    setIsEditorFullscreen(fullscreen);
  }, []);

  React.useEffect(() => {
    setIsOpen(isVisible);
    setOnClose((confirmed?: boolean) => {
      if (hasUnsavedContent && !confirmed) {
        setShowConfirmDialog(true);
        setPendingAction(() => () => {
          setShowConfirmDialog(false);
          setIsVisible(false);
        });
      } else {
        setIsVisible(false);
      }
    });
    return () => {
      setIsOpen(false);
      setOnClose(null);
    };
  }, [isVisible, hasUnsavedContent, setIsVisible, setIsOpen, setOnClose]);

  const [title, setTitle] = React.useState("");
  const [selectedBoard, setSelectedBoard] = React.useState<number | undefined>(
    undefined
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
    if (isVisible) {
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
  }, [isVisible, hasUnsavedContent]);

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

  const resetAllStates = React.useCallback(() => {
    setTitle("");
    setContent("");
    editorRef.current?.reset?.();
    setSelectedBoard(undefined); // 确保重置 selectedBoard
    boardSelectRef.current?.reset?.(); // 重置 BoardSelect 组件内部状态
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
    setIsSubmitting(false);
    setShowConfirmDialog(false);
    setPendingAction(null);
    setHasUnsavedContent(false);
  }, [
    setContent,
    setHasUnsavedContent,
    setTitle,
    setSelectedBoard,
    setSelectedChildBoard,
    setAttachments,
    setPollData,
    setPollOptions,
    setIsMultipleChoice,
    setShowVoters,
    setHasDeadline,
    setPollStartTime,
    setPollEndTime,
    setIsPollEditing,
    setIsSubmitting,
    setShowConfirmDialog,
    setPendingAction,
  ]);

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
      
      // 先重置 selectedBoard
      setSelectedBoard(undefined);
      
      // 使用 setTimeout 确保状态更新后再重置 BoardSelect 组件
      setTimeout(() => {
        // 重置 BoardSelect 组件内部状态
        boardSelectRef.current?.reset?.();
        
        // 重置其他状态，但不包括 selectedBoard (已经重置过了)
        setTitle("");
        setContent("");
        editorRef.current?.reset?.();
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
        setIsSubmitting(false);
        setShowConfirmDialog(false);
        setPendingAction(null);
        setHasUnsavedContent(false);
      }, 0);
      
      setIsVisible(false);
      if (window.location.pathname !== "/") {
        router.push("/");
      }
      router.refresh();
    } catch (error) {
      console.error("发布失败", error);
      setIsSubmitting(false);
    }
  };

  const handleClose = React.useCallback(() => {
    resetAllStates();
    setIsVisible(false);
  }, [resetAllStates, setIsVisible]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isVisible, handleClose]);

  React.useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  // 当模态框关闭时重置状态
  React.useEffect(() => {
    if (!isVisible) {
      resetAllStates();
    }
  }, [isVisible, resetAllStates]);

  return (
    <Portal>
      <div
        className={cn(
          "fixed inset-0 top-14 z-40 transform bg-background transition-transform duration-500 ease-out overflow-y-auto",
          isVisible ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="bg-theme-background min-h-[calc(100vh-3.5rem)] flex flex-col mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4 pb-2 z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h1 className="text-lg font-medium leading-none whitespace-nowrap">发布文章</h1>
                <div className="w-full sm:w-auto">
                  <BoardSelect 
                    ref={boardSelectRef}
                    value={selectedBoard} 
                    onChange={setSelectedBoard} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full w-full sm:w-auto"
                  onClick={handleClose}
                >
                  取消
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full w-full sm:w-auto"
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
                  className="rounded-full w-full sm:w-auto"
                  onClick={() => {}}
                >
                  保存草稿箱
                </Button>
                <Button
                  size="sm"
                  className="rounded-full w-full sm:w-auto"
                  onClick={handlePublish}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "发布中..." : "发布"}
                </Button>
              </div>
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
              <Input
                className="text-xl py-4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入标题..."
              />
              <div className="mt-4">
                {isPollEditing && !isEditorFullscreen ? (
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
                ) : !isPollEditing && pollData && !isEditorFullscreen ? (
                  <PollPreview
                    pollData={pollData}
                    onDelete={handleDeletePoll}
                    onEdit={handlePollEdit}
                  />
                ) : null}
              </div>

              <Editor
                ref={editorRef}
                placeholder="开始编写正文..."
                className={cn(
                  "min-h-[300px] sm:min-h-[400px]",
                  isEditorFullscreen && "z-50"
                )}
                attachmentType={AttachmentType.TOPIC}
                initialContent={content}
                onChange={setContent}
                onFullscreenChange={handleFullscreenChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 确认离开对话框 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-white sm:max-w-md">
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
