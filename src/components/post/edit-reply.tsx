"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";
import type { Post } from "@/types/discussion";
import type { Attachment } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface EditReplyProps {
  comment: Post;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const EditReply = ({
  comment,
  onCancel,
  onSuccess,
}: EditReplyProps) => {
  const [editContent, setEditContent] = React.useState(comment.raw_content || "");
  const [imageUrl, setImageUrl] = React.useState<string | undefined>(undefined);
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const queryClient = useQueryClient();

  // 编辑评论的 mutation
  const editMutation = useMutation({
    mutationFn: (data: { id: number; content: string }) =>
      api.posts.update({ id: data.id, content: data.content }),
    onSuccess: () => {
      toast({
        title: "编辑成功",
        description: "评论已更新",
      });
      queryClient.invalidateQueries({
        queryKey: [
          "discussion-posts",
          comment.discussion_slug,
          comment.board_id,
        ],
      });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "编辑失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (!editContent.trim() && !imageUrl) {
      toast({
        title: "内容不能为空",
        description: "请输入评论内容或上传图片",
        variant: "destructive",
      });
      return;
    }

    try {
      let finalContent = editContent;
      if (imageUrl) {
        finalContent = editContent
          ? `${editContent}\n\n![图片](${imageUrl})`
          : `![图片](${imageUrl})`;
      }
      
      editMutation.mutate({
        id: comment.id,
        content: finalContent,
      });
    } catch (error) {
      toast({
        title: "编辑失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
  };

  const handleUploadSuccess = (attachment: Attachment) => {
    setImageUrl(`${attachment.url}`);
    const formattedAttachment = {
      id: attachment.id,
      file_name: attachment.file_name,
      file_type: attachment.mime_type,
      file_path: attachment.file_path,
    };

    setAttachments([...attachments, formattedAttachment]);
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
    setAttachments([]);
  };

  return (
    <div className="mt-3 bg-subtle p-3 rounded-md">
      <div className="flex items-start space-x-2">
        <Textarea
          placeholder="编辑你的评论..."
          value={editContent}
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
            disabled={editMutation.isPending}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={editMutation.isPending}
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            size="sm"
            disabled={editMutation.isPending || (!editContent.trim() && !imageUrl)}
          >
            {editMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                保存中...
              </>
            ) : (
              "保存"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
