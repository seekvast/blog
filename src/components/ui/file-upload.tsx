"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import Image from "next/image";
import { toast } from "@/components/ui/use-toast";

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  preview?: string;
  onFileSelect?: (file: File) => void;
}

export function FileUpload({
  preview,
  onFileSelect,
  ...props
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: "文件大小不能超过2MB",
          variant: "default",
        });
        return;
      }
      if (
        !["image/jpeg", "image/jpg", "image/gif", "image/png"].includes(
          file.type
        )
      ) {
        toast({
          title: "格式不支持",
          description: "只支持JPG、JPEG、GIF或PNG格式",
          variant: "default",
        });
        return;
      }
      onFileSelect?.(file);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full bg-muted hover:bg-muted/80"
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        onChange={handleChange}
        {...props}
      />
      {preview ? (
        <Image
          src={preview}
          alt="Preview"
          fill
          className="rounded-full object-cover"
        />
      ) : (
        <Plus className="h-8 w-8 text-muted-foreground" />
      )}
    </div>
  );
}
