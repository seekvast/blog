"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { ToolbarButton } from "./create-post-modal";

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
        <ToolbarButton
          onClick={() => onAction("h1")}
          icon={<Icon name="format_h1" className="text-2xl" />}
        />
        <ToolbarButton
          onClick={() => onAction("h2")}
          icon={<Icon name="format_h2" className="text-2xl" />}
        />
        <ToolbarButton
          onClick={() => onAction("h3")}
          icon={<Icon name="format_h3" className="text-2xl" />}
        />
        <div className="mx-1 h-8 w-px bg-gray-200" />
        <ToolbarButton
          onClick={() => onAction("bold")}
          icon={<Icon name="format_bold" className="text-2xl" />}
        />
        <ToolbarButton
          onClick={() => onAction("italic")}
          icon={<Icon name="format_italic" className="text-2xl" />}
        />
        <div className="mx-1 h-8 w-px bg-gray-200" />
        <ToolbarButton
          onClick={() => onAction("list-ul")}
          icon={<Icon name="format_list_bulleted" className="text-2xl" />}
        />
        <ToolbarButton
          onClick={() => onAction("list-ol")}
          icon={<Icon name="format_list_numbered" className="text-2xl" />}
        />
        <ToolbarButton
          onClick={() => onAction("quote")}
          icon={<Icon name="format_quote" className="text-2xl" />}
        />
        <div className="mx-1 h-8 w-px bg-gray-200" />
        <ToolbarButton
          onClick={handleImageUpload}
          //@ts-ignore
          disabled={imageUploading}
          icon={<Icon name="image" className="text-2xl" />}
        />
        <ToolbarButton
          onClick={() => onAction("link")}
          icon={<Icon name="link" className="text-2xl" />}
        />
        <ToolbarButton
          onClick={() => onAction("code")}
          icon={<Icon name="code" className="text-2xl" />}
        />
        <div className="ml-auto flex items-center gap-0.5">
          <ToolbarButton
            onClick={onSplitViewToggle}
            icon={<Icon name="splitscreen" className="text-2xl" />}
          />
          {/* <button
            type="button"
            onClick={onPreviewToggle}
            className={cn(
              "rounded p-1.5 hover:bg-accent",
              previewMode && "bg-accent"
            )}
          >
            <Icon name="preview" className="text-2xl" />
          </button> */}
        </div>
      </div>
    </div>
  );
}
