import * as React from "react";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/editor/Editor";
import { AttachmentType } from "@/constants/attachment-type";
import type { Post } from "@/types/discussion";
import type { User } from "@/types/user";

interface CommentEditorProps {
  user: User | null;
  content: string;
  onChange: (content: string) => void;
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
  replyTo: Post | null;
  onCancelReply: () => void;
  editorRef: React.RefObject<any>;
  openLoginModal: () => void;
}

export const CommentEditor = React.memo(
  ({
    user,
    content,
    onChange,
    onSubmit,
    isSubmitting,
    replyTo,
    onCancelReply,
    editorRef,
    openLoginModal,
  }: CommentEditorProps) => {
    const handleSubmit = React.useCallback(() => {
      if (!content.trim() || isSubmitting) return;
      onSubmit(content);
    }, [content, isSubmitting, onSubmit]);

    React.useEffect(() => {
      if (content) {
        localStorage.setItem(`comment-draft-${replyTo?.id || "new"}`, content);
      }

      return () => {
        if (!content) {
          localStorage.removeItem(`comment-draft-${replyTo?.id || "new"}`);
        }
      };
    }, [content, replyTo?.id]);

    React.useEffect(() => {
      const savedDraft = localStorage.getItem(
        `comment-draft-${replyTo?.id || "new"}`
      );
      if (savedDraft && !content) {
        onChange(savedDraft);
      }
    }, [replyTo?.id, content, onChange]);

    if (!user) {
      return (
        <div className="mt-6 w-full flex justify-center p-8">
          <span>请</span>
          <span
            className="text-primary cursor-pointer"
            onClick={openLoginModal}
          >
            登录
          </span>
          <span>后发表评论</span>
        </div>
      );
    }

    return (
      <div id="comment" className="flex flex-col mt-6 min-h-[260px]">
        {replyTo && (
          <div className="mb-2 px-4 py-2 bg-muted/50 rounded-md flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              回复 @{replyTo.user.username}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={onCancelReply}
            >
              取消回复
            </Button>
          </div>
        )}
        <Editor
          ref={editorRef}
          className="flex-grow"
          attachmentType={AttachmentType.TOPIC}
          placeholder={
            replyTo ? `回复 @${replyTo.user.username}...` : "写下你的评论..."
          }
          initialContent={content}
          onChange={onChange}
        />
        <div className="mt-2 flex items-center justify-between">
          <div></div>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? "发送中..." : "发送"}
          </Button>
        </div>
      </div>
    );
  }
);

CommentEditor.displayName = "CommentEditor";
