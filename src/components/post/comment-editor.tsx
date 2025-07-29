import * as React from "react";
import { Editor } from "@/components/editor/md-editor";
import { AttachmentType } from "@/constants/attachment-type";
import type { Post } from "@/types/discussion";
import type { User } from "@/types/user";
import type { Attachment } from "@/types";
import { PostForm } from "@/validations/post";
import { useEmailVerificationGuard } from "@/hooks/use-email-verification-guard";
import { EmailVerificationRequiredFeature } from "@/config/email-verification";
import { Reply } from "lucide-react";

interface CommentEditorProps {
  user: User | null;
  postForm: PostForm;
  onChange: (postForm: PostForm) => void;
  onSubmit: (postForm: PostForm) => void;
  isSubmitting: boolean;
  replyTo: Post | null;
  onCancelReply: () => void;
  editorRef: React.RefObject<any>;
  openLoginModal: () => void;
  boardId?: number;
  discussionId?: number;
  discussionTitle?: string;
  onClose?: () => void;
}

export const CommentEditor = React.memo(
  ({
    user,
    postForm,
    onChange,
    onSubmit,
    isSubmitting,
    replyTo,
    onCancelReply,
    editorRef,
    openLoginModal,
    boardId,
    discussionId,
    discussionTitle,
    onClose,
  }: CommentEditorProps) => {
    const { requireEmailVerification } = useEmailVerificationGuard();

    const handleSubmit = React.useCallback(() => {
      if (!postForm.content.trim() || isSubmitting) return;
      requireEmailVerification(() => {
        onSubmit(postForm);
      }, EmailVerificationRequiredFeature.COMMENT);
    }, [isSubmitting, onSubmit, postForm, requireEmailVerification]);

    const handleContentChange = React.useCallback(
      (content: string) => {
        onChange({
          ...postForm,
          content,
        });
      },
      [postForm, onChange]
    );

    const handleAttachmentUpload = React.useCallback(
      (attachment: Attachment) => {
        const formattedAttachment = {
          id: attachment.id,
          file_name: attachment.file_name,
          file_type: attachment.mime_type,
          file_path: attachment.file_path,
        };
        onChange({
          ...postForm,
          attachments: [...(postForm.attachments || []), formattedAttachment],
        });
      },
      [postForm, onChange]
    );

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
      <div
        id="comment"
        className="flex flex-col min-h-[260px] lg:min-h-[300px]"
      >
        <Editor
          ref={editorRef}
          className="flex-grow"
          attachmentType={AttachmentType.TOPIC}
          placeholder={
            replyTo ? `回复 @${replyTo.user.username}...` : "写下你的评论..."
          }
          initialContent={postForm.content}
          onChange={handleContentChange}
          onAttachmentUpload={handleAttachmentUpload}
          onPublish={handleSubmit}
          publishText="发布"
          publishLoading={isSubmitting}
          boardId={boardId}
          discussionId={discussionId}
          headerInfo={
            discussionTitle
              ? {
                  icon: <Reply className="h-4 w-4 text-muted-foreground" />,
                  title: discussionTitle,
                  onMaximize: () => {},
                  onClose: onClose,
                }
              : undefined
          }
        />
      </div>
    );
  }
);

CommentEditor.displayName = "CommentEditor";
