"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageIcon } from "lucide-react";
import { uploadFile, AttachmentType } from "@/lib/utils/upload";
import { useToast } from "@/components/ui/use-toast";

interface AvatarUploadProps {
  url: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  attachmentType: AttachmentType;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
}

const sizeMap = {
  sm: {
    container: "w-16 h-16",
    overlay: "w-6 h-6",
    icon: "w-3 h-3",
  },
  md: {
    container: "w-20 h-20 sm:w-24 sm:h-24",
    overlay: "w-8 h-8 sm:w-10 sm:h-10",
    icon: "w-4 h-4 sm:w-5 sm:h-5",
  },
  lg: {
    container: "w-32 h-32",
    overlay: "w-12 h-12",
    icon: "w-6 h-6",
  },
};

export function AvatarUpload({
  url,
  name,
  attachmentType,
  size = "md",
  onUploadSuccess,
  onUploadError,
  className,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(url);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);

    try {
      const data = await uploadFile(file, attachmentType);
      setAvatarUrl(data.url);
      onUploadSuccess?.(data.url);
      toast({
        description: "头像上传成功",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      onUploadError?.(error as Error);
      toast({
        variant: "destructive",
        title: "上传失败",
        description: "头像上传失败，请重试",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Avatar
        onClick={handleClick}
        className={`cursor-pointer shadow-md group ${
          isUploading && "pointer-events-none relative"
        } ${sizeMap[size].container} ${className}`}
      >
        <AvatarImage
          src={avatarUrl ?? ""}
          alt={`${name}'s avatar`}
          className="object-cover"
        />
        <AvatarFallback className="bg-gray-100">
          {name[0].toUpperCase()}
        </AvatarFallback>
        {/* 上传图标悬浮层 */}
        <div
          className={`absolute rounded-full bg-black/30 transition-colors shadow-sm left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${sizeMap[size].overlay}`}
        >
          <ImageIcon className={`text-white ${sizeMap[size].icon}`} />
        </div>
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
            <div className="animate-spin rounded-full h-8 w-8 border-4"></div>
          </div>
        )}
      </Avatar>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
      />
    </div>
  );
}
