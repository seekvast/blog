"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ImageIcon,
  Upload as UploadIcon,
  Trash as TrashIcon,
} from "lucide-react";
import { uploadFile, AttachmentType } from "@/lib/utils/upload";
import { useToast } from "@/components/ui/use-toast";
import AvatarCropDialog from "./avatar-crop-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AvatarUploadProps {
  url: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  attachmentType: AttachmentType;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: Error) => void;
  onRemove?: () => void;
  showDropdownMenu?: boolean;
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
  onRemove,
  showDropdownMenu = false,
  className,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(url || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [rawImg, setRawImg] = useState<string | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImg(ev.target?.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async (croppedBlob: Blob) => {
    setCropDialogOpen(false);
    setIsUploading(true);
    try {
      const file = new File([croppedBlob], "avatar.jpg", {
        type: "image/jpeg",
      });
      const data = await uploadFile(file, attachmentType);
      setAvatarUrl(data.url);
      onUploadSuccess?.(data.url);
    } catch (error) {
      onUploadError?.(error as Error);
    } finally {
      setIsUploading(false);
      setRawImg(null);
    }
  };

  const handleRemove = () => {
    setAvatarUrl(null);
    onRemove?.();
  };

  // 渲染头像组件
  const renderAvatar = () => (
    <Avatar
      onClick={showDropdownMenu ? undefined : handleClick}
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
        className={`absolute rounded-full bg-white/30 transition-colors shadow-sm left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${sizeMap[size].overlay}`}
      >
        <ImageIcon className={`text-white ${sizeMap[size].icon}`} />
      </div>
      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500"></div>
        </div>
      )}
    </Avatar>
  );

  return (
    <div>
      {showDropdownMenu ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer">{renderAvatar()}</div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="cursor-pointer" onClick={handleClick}>
              <UploadIcon className="mr-2 h-4 w-4" />
              <span>上传</span>
            </DropdownMenuItem>
            {avatarUrl && (
              <DropdownMenuItem onClick={handleRemove}>
                <TrashIcon className="mr-2 h-4 w-4" />
                <span>移除</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        renderAvatar()
      )}

      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
      />
      {rawImg && (
        <AvatarCropDialog
          open={cropDialogOpen}
          src={rawImg}
          onClose={() => setCropDialogOpen(false)}
          onCropConfirm={handleCropConfirm}
          onReselect={() => {
            setCropDialogOpen(false);
            setTimeout(() => {
              inputRef.current?.click();
            }, 100);
          }}
        />
      )}
    </div>
  );
}
