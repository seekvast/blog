"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EditorToolbarProps {
  onAction: (action: string) => void;
  onImageUpload?: (file: File) => Promise<void>;
  imageUploading?: boolean;
  onPreviewToggle: () => void;
  previewMode: boolean;
  splitView: boolean;
  onSplitViewToggle: () => void;
}

export function EditorToolbar({
  onAction,
  onImageUpload,
  imageUploading,
  onPreviewToggle,
  previewMode,
  splitView,
  onSplitViewToggle,
}: EditorToolbarProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      await onImageUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="flex items-center gap-0.5 border-b bg-gray-50/50 p-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 py-1"
          onClick={() => onAction("h1")}
        >
          <Icon name="format_h1" className="text-2xl" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 py-1"
          onClick={() => onAction("h2")}
        >
          <Icon name="format_h2" className="text-2xl" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 py-1"
          onClick={() => onAction("h3")}
        >
          <Icon name="format_h3" className="text-2xl" />
        </Button>
        <div className="mx-1 h-8 w-px bg-gray-200" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 py-1"
          onClick={() => onAction("bold")}
        >
          <Icon name="format_bold" className="text-2xl" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 py-1"
          onClick={() => onAction("italic")}
        >
          <Icon name="format_italic" className="text-2xl" />
        </Button>
        <div className="mx-1 h-8 w-px bg-gray-200" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 py-1"
          onClick={() => onAction("list-ul")}
        >
          <Icon name="format_list_bulleted" className="text-2xl" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 py-1"
          onClick={() => onAction("list-ol")}
        >
          <Icon name="format_list_numbered" className="text-2xl" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 py-1"
          onClick={() => onAction("quote")}
        >
          <Icon name="format_quote" className="text-2xl" />
        </Button>
        <div className="mx-1 h-8 w-px bg-gray-200" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 py-1"
          onClick={handleImageUpload}
          disabled={imageUploading}
        >
          <Icon name="image" className="text-2xl" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 py-1"
          onClick={() => onAction("link")}
        >
          <Icon name="link" className="text-2xl" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 py-1"
          onClick={() => onAction("code")}
        >
          <Icon name="code" className="text-2xl" />
        </Button>
        <div className="ml-auto flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2 py-1",
              previewMode && !splitView && "bg-accent"
            )}
            onClick={onPreviewToggle}
          >
            <Icon name="eye" className="mr-1 h-4 w-4" />
            预览
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 px-2 py-1", splitView && "bg-accent")}
            onClick={onSplitViewToggle}
          >
            <Icon name="columns" className="mr-1 h-4 w-4" />
            分栏
          </Button>
        </div>
      </div>
    </div>
  );
}
