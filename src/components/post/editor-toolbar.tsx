"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { ToolbarButton } from "./create-post-modal";

interface EditorToolbarProps {
  onAction: (action: string) => void;
  onImageUpload?: () => void;
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
  return (
    <div className="relative">
      {imageUploading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Icon
              name="refresh"
              className="text-2xl text-primary animate-spin"
            />
            <span className="text-sm text-gray-500">正在上传图片...</span>
          </div>
        </div>
      )}
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
          onClick={() => onAction("image")}
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
          {/* <button
            type="button"
            onClick={onSplitViewToggle}
            className={cn(
              "rounded p-1.5 hover:bg-accent",
              splitView && "bg-accent"
            )}
          > */}
          <Icon
            onClick={onSplitViewToggle}
            name="splitscreen"
            className="text-2xl cursor-pointer"
          />
          {/* </button> */}
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
