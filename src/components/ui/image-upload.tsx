"use client";

import * as React from "react";
import { ImageIcon, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { uploadFile, AttachmentType } from "@/lib/utils/upload";
import { useToast } from "@/components/ui/use-toast";
import { Attachment } from "@/types";

export interface ImageUploadProps {
  onUploadSuccess?: (attachment: Attachment) => void;
  onUploadError?: (error: Error) => void;
  onRemove?: () => void;
  previewUrl?: string | null;
  attachmentType?: AttachmentType;
  maxSize?: number; // 单位：MB
  className?: string;
  buttonVariant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonText?: string;
  buttonIcon?: boolean;
  showPreview?: boolean;
  previewSize?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const previewSizeMap = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

export function ImageUpload({
  onUploadSuccess,
  onUploadError,
  onRemove,
  previewUrl: externalPreviewUrl,
  attachmentType = "topics_images",
  maxSize = 2, // 默认2MB
  className,
  buttonVariant = "outline",
  buttonSize = "sm",
  buttonText = "图片",
  buttonIcon = true,
  showPreview = true,
  previewSize = "md",
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    externalPreviewUrl || null
  );

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // 当外部previewUrl变化时更新内部状态
  React.useEffect(() => {
    setPreviewUrl(externalPreviewUrl || null);
  }, [externalPreviewUrl]);

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "文件过大",
        description: `文件大小不能超过${maxSize}MB`,
      });
      return;
    }

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "格式不支持",
        description: "只支持图片格式",
      });
      return;
    }

    // 创建本地预览
    if (showPreview) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    // 上传文件
    setIsUploading(true);
    try {
      const data = await uploadFile(file, attachmentType);
        onUploadSuccess?.(data);
      toast({
        description: "图片上传成功",
      });
    } catch (error) {
      onUploadError?.(error as Error);
      if (!externalPreviewUrl) {
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove?.();
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {showPreview && previewUrl && (
        <div className="mb-2 relative inline-block">
          <div
            className={cn(
              "relative rounded-md overflow-hidden",
              previewSizeMap[previewSize]
            )}
          >
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {(!previewUrl || !showPreview) && (
        <Button
          type="button"
          variant={buttonVariant}
          size={buttonSize}
          onClick={handleClick}
          disabled={disabled || isUploading}
          className={cn(isUploading && "pointer-events-none")}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              上传中
            </>
          ) : (
            <>
              {buttonIcon && <ImageIcon className="h-4 w-4 mr-1" />}
              {buttonText}
            </>
          )}
        </Button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
      />
    </div>
  );
}
