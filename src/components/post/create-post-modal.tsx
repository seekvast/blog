import * as React from "react";
import { Portal } from "@radix-ui/react-portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BoardSelect } from "@/components/board-select";
import { Editor } from "@/components/editor/md-editor";
import { AlertTriangle, Reply } from "lucide-react";
import { PollEditor } from "./poll-editor";
import { PollPreview } from "./poll-preview";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCreatePost } from "@/hooks/use-create-post";
import { AttachmentType } from "@/constants/attachment-type";
import { PollForm } from "@/validations/discussion";

export default function CreatePostModal() {
  const {
    state,
    dispatch,
    isVisible,
    openFrom,
    boardChildren,
    isLoadingChildren,
    mutations,
    handlers,
    computed,
  } = useCreatePost();

  const {
    discussionForm,
    pollForm,
    pollData,
    isPollEditing,
    selectedBoard,
    errors,
  } = state;
  const { createDiscussionMutation, saveDraftMutation } = mutations;
  const { handlePublish, handleSaveDraft, handleClose, handleBoardChange } =
    handlers;
  const { isPollButtonDisabled, modalTitle } = computed;

  const [isEditorFullscreen, setIsEditorFullscreen] = React.useState(false);

  const renderBoardChildren = () => {
    if (isLoadingChildren) {
      return <div className="text-sm text-muted-foreground">加载中...</div>;
    }
    if (!boardChildren || boardChildren.items.length === 0) {
      return <div className="text-sm text-muted-foreground">暂无子版</div>;
    }
    return boardChildren.items.map((child) => (
      <Badge
        key={child.id}
        variant={
          discussionForm.board_child_id === child.id ? "default" : "secondary"
        }
        className="cursor-pointer"
        onClick={() =>
          dispatch({
            type: "SET_DISCUSSION_FIELD",
            payload: { field: "board_child_id", value: child.id },
          })
        }
      >
        {child.name}
      </Badge>
    ));
  };

  return (
    <Portal>
      <div
        className={cn(
          "fixed inset-0 top-14 z-40 transform bg-background transition-transform duration-500 ease-out overflow-y-auto pb-14 lg:pb-0",
          isVisible ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="bg-theme-background min-h-[calc(100vh-3.5rem)] flex flex-col mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4 pb-2 z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h1 className="text-lg font-medium leading-none whitespace-nowrap">
                  {modalTitle}
                </h1>
                <div className="w-full min-w-[260px] sm:w-auto">
                  <BoardSelect
                    value={discussionForm.board_id}
                    board={selectedBoard}
                    onChange={handleBoardChange}
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
                  onClick={() => dispatch({ type: "START_POLL_EDIT" })}
                  disabled={isPollButtonDisabled}
                  title={
                    isPollButtonDisabled ? "您没有在当前看板发起投票的权限" : ""
                  }
                >
                  投票
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full w-full sm:w-auto"
                  onClick={handleSaveDraft}
                  disabled={saveDraftMutation.isPending}
                >
                  {saveDraftMutation.isPending ? "保存中..." : "保存草稿箱"}
                </Button>
                <Button
                  size="sm"
                  className="rounded-full w-full sm:w-auto"
                  onClick={handlePublish}
                  disabled={createDiscussionMutation.isPending}
                >
                  {createDiscussionMutation.isPending ? "发布中..." : "发布"}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t py-4">
            <h3 className="text-sm font-medium mb-2">子版</h3>
            <div className="flex flex-wrap gap-2">{renderBoardChildren()}</div>
          </div>

          <div className="flex-1">
            <div className="py-4">
              <Input
                className="text-xl py-4"
                value={discussionForm.title}
                onChange={(e) =>
                  dispatch({
                    type: "SET_DISCUSSION_FIELD",
                    payload: { field: "title", value: e.target.value },
                  })
                }
                placeholder="输入标题..."
              />
              {errors && (
                <div className="mt-2 text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{errors}</span>
                </div>
              )}
              <div className="mt-4">
                {isPollEditing && !isEditorFullscreen ? (
                  <PollEditor
                    values={pollForm}
                    onChange={(field: keyof PollForm, value: any) =>
                      dispatch({
                        type: "SET_POLL_FORM_FIELD",
                        payload: { field, value },
                      })
                    }
                    error={errors}
                    onCancel={() => dispatch({ type: "CANCEL_POLL_EDIT" })}
                    onConfirm={() => dispatch({ type: "CONFIRM_POLL" })}
                  />
                ) : !isPollEditing && pollData && !isEditorFullscreen ? (
                  <PollPreview
                    pollData={pollData}
                    onDelete={() => dispatch({ type: "DELETE_POLL" })}
                    onEdit={() => dispatch({ type: "START_POLL_EDIT" })}
                  />
                ) : null}
              </div>

              <Editor
                placeholder="说点什么吧..."
                className={cn(
                  "min-h-[300px] sm:min-h-[400px]",
                  isEditorFullscreen && "z-50"
                )}
                attachmentType={AttachmentType.TOPIC}
                initialContent={discussionForm.content}
                onChange={(value) =>
                  dispatch({ type: "SET_CONTENT", payload: value })
                }
                onFullscreenChange={setIsEditorFullscreen} // 更新全屏状态
                onPublish={handlePublish}
                publishLoading={createDiscussionMutation.isPending}
                publishText="发布"
                headerInfo={{
                  // 确保 headerInfo 也被传递
                  icon: <Reply className="h-4 w-4 text-muted-foreground" />,
                  title: discussionForm.title,
                  onMaximize: () => {},
                  onClose: handleClose,
                }}
                boardId={discussionForm.board_id || undefined}
                onAttachmentUpload={(attachment) => {
                  const formattedAttachment = {
                    id: attachment.id,
                    file_name: attachment.file_name,
                    file_type: attachment.mime_type,
                    file_path: attachment.file_path,
                  };
                  const newAttachments = [
                    ...(discussionForm.attachments || []),
                    formattedAttachment,
                  ];
                  dispatch({
                    type: "SET_DISCUSSION_FIELD",
                    payload: { field: "attachments", value: newAttachments },
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
