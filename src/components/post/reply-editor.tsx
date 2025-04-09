"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";
import type { Post } from "@/types/discussion";
import type { Attachment } from "@/types";

interface ReplyEditorProps {
  comment: Post;
  onCancel: () => void;
  onSubmit: (content: string, imageUrl?: string) => void;
  placeholder?: string;
}

export const ReplyEditor = ({
  comment,
  onCancel,
  onSubmit,
  placeholder,
}: ReplyEditorProps) => {
  const [content, setContent] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) {
      toast({
        title: "内容不能为空",
        description: "请输入回复内容或上传图片",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmit(content, imageUrl || undefined);
      setContent("");
      setImageUrl(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSuccess = (attachment: Attachment) => {
    setImageUrl(attachment.url);
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
  };

  return (
    <div className="mt-3 bg-gray-50 p-3 rounded-md">
      <div className="flex items-start space-x-2">
        <Textarea
          placeholder={placeholder || `回复 @${comment.user.username}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
            disabled={isSubmitting || (!content.trim() && !imageUrl)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                提交中
              </>
            ) : (
              "回复"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
