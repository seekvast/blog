"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";
import type { Post } from "@/types/discussion";
import type { Attachment } from "@/types";
import { PostForm } from "@/validations/post";

interface ReplyEditorProps {
  comment: Post;
  onCancel: () => void;
  onSubmit: (replyForm: PostForm) => void;
  placeholder?: string;
}

export const ReplyEditor = ({
  comment,
  onCancel,
  onSubmit,
  placeholder,
}: ReplyEditorProps) => {
  const [replyForm, setReplyForm] = React.useState<PostForm>({
    slug: comment.discussion_slug,
    content: "",
    attachments: [],
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [imageUrl, setImageUrl] = React.useState<string | undefined>(undefined);

  const handleSubmit = async () => {
    if (!replyForm.content.trim() && !imageUrl) {
      toast({
        title: "内容不能为空",
        description: "请输入回复内容或上传图片",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let finalContent = replyForm.content;
      if (imageUrl) {
        finalContent = replyForm.content
          ? `${replyForm.content}\n\n![图片](${imageUrl})`
          : `![图片](${imageUrl})`;
      }
      onSubmit({
        ...replyForm,
        content: finalContent,
      });
      setReplyForm({
        slug: comment.discussion_slug,
        content: "",
        attachments: [],
      });
    } catch (error) {
      toast({
        title: "回复失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyForm({
      ...replyForm,
      content: e.target.value,
    });
  };

  const handleUploadSuccess = (attachment: Attachment) => {
    setImageUrl(`${attachment.url}`);
    const formattedAttachment = {
      id: attachment.id,
      file_name: attachment.file_name,
      file_type: attachment.mime_type,
      file_path: attachment.file_path,
    };

    setReplyForm({
      ...replyForm,
      attachments: [...(replyForm.attachments || []), formattedAttachment],
    });
  };

  const handleRemoveImage = () => {
    setReplyForm({
      ...replyForm,
      attachments: [],
    });
  };

  return (
    <div className="mt-3 bg-gray-50 p-3 rounded-md">
      <div className="flex items-start space-x-2">
        <Textarea
          placeholder={placeholder || `回复 @${comment.user.username}`}
          value={replyForm.content}
          onChange={handleContentChange}
          className="flex-1"
        />
      </div>

      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <ImageUpload
            previewUrl={imageUrl}
            onUploadSuccess={handleUploadSuccess}
            onRemove={handleRemoveImage}
            attachmentType="topics_images"
            maxSize={2}
            buttonText="图片"
            showPreview={true}
            previewSize="sm"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            size="sm"
            disabled={isSubmitting || (!replyForm.content.trim() && !imageUrl)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                发送中...
              </>
            ) : (
              "发送"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
