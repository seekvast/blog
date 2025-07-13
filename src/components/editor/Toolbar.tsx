import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Link,
  Image,
  List,
  ListOrdered,
  Quote,
  Code,
  Eye,
  EyeOff,
  Undo,
  Redo,
  Heading,
  Strikethrough,
  Maximize2,
  Minimize2,
  Loader,
  Loader2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  className?: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onImageUpload: (file: File) => Promise<void>;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  content: string;
  selection: { start: number; end: number };
  previewMode: boolean;
  onContentChange: (content: string) => void;
  onSelectionChange: (selection: { start: number; end: number }) => void;
  onPreviewModeChange: (mode: boolean) => void;
  showPublishButton?: boolean;
  onPublish?: () => void;
  publishLoading?: boolean;
  publishText?: string;
}

function wordSelectionStart(text: string, i: number): number {
  let index = i;
  while (
    text[index] &&
    text[index - 1] != null &&
    !text[index - 1].match(/\s/)
  ) {
    index--;
  }
  return index;
}

function wordSelectionEnd(text: string, i: number, multiline: boolean): number {
  let index = i;
  const breakpoint = multiline ? /\n/ : /\s/;
  while (text[index] && !text[index].match(breakpoint)) {
    index++;
  }
  return index;
}

export function Toolbar({
  className,
  textareaRef,
  onImageUpload,
  isFullscreen,
  onToggleFullscreen,
  content,
  selection,
  previewMode,
  onContentChange,
  onSelectionChange,
  onPreviewModeChange,
  showPublishButton = false,
  onPublish,
  publishLoading = false,
  publishText = "Post Reply",
}: ToolbarProps) {
  const wrapText = React.useCallback(
    (before: string, after: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      let selectionStart = textarea.selectionStart;
      let selectionEnd = textarea.selectionEnd;

      // 检查光标前后的文本来判断是否在格式标记内
      const textBeforeCursor = content.slice(0, selectionStart);
      const textAfterCursor = content.slice(selectionEnd);

      // 查找最近的格式标记
      const lastBeforeIndex = textBeforeCursor.lastIndexOf(before);
      const nextAfterIndex = textAfterCursor.indexOf(after);

      if (lastBeforeIndex !== -1 && nextAfterIndex !== -1) {
        // 找到了完整的格式标记，计算实际范围
        const formatStart = lastBeforeIndex;
        const formatEnd = selectionEnd + nextAfterIndex + after.length;

        // 移除格式
        const newText =
          content.slice(0, formatStart) +
          content.slice(formatStart + before.length, formatEnd - after.length) +
          content.slice(formatEnd);

        onContentChange(newText);

        // 设置新的光标位置
        const newSelection = {
          start: formatStart,
          end: formatEnd - (before.length + after.length),
        };

        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(newSelection.start, newSelection.end);
          onSelectionChange(newSelection);
        });
      } else {
        // 没有找到格式标记，添加新格式
        if (selectionStart === selectionEnd) {
          // 如果没有选中文本，扩展选区到单词
          selectionStart = wordSelectionStart(content, selectionStart);
          selectionEnd = wordSelectionEnd(content, selectionEnd, false);
        }

        const newText =
          content.slice(0, selectionStart) +
          before +
          content.slice(selectionStart, selectionEnd) +
          after +
          content.slice(selectionEnd);

        const newSelection = {
          start: selectionStart + before.length,
          end: selectionEnd + before.length,
        };

        onContentChange(newText);
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(newSelection.start, newSelection.end);
          onSelectionChange(newSelection);
        });
      }
    },
    [content, onContentChange, onSelectionChange, textareaRef]
  );

  // 特殊处理单行格式（如列表、引用）
  const toggleLineFormat = React.useCallback(
    (prefix: string) => {
      const start = selection.start;
      const end = selection.end;
      const lineStart = content.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = content.indexOf("\n", start);
      const currentLine = content.slice(
        lineStart,
        lineEnd === -1 ? content.length : lineEnd
      );

      let newContent: string;
      let newCursorPos: { start: number; end: number };

      if (currentLine.startsWith(prefix)) {
        // 移除格式
        newContent =
          content.slice(0, lineStart) +
          currentLine.slice(prefix.length) +
          content.slice(lineEnd === -1 ? content.length : lineEnd);

        newCursorPos = {
          start: start - prefix.length,
          end: end - prefix.length,
        };
      } else {
        // 添加格式
        newContent =
          content.slice(0, lineStart) +
          prefix +
          currentLine +
          content.slice(lineEnd === -1 ? content.length : lineEnd);

        newCursorPos = {
          start: start + prefix.length,
          end: end + prefix.length,
        };
      }

      onContentChange(newContent);

      if (textareaRef?.current) {
        requestAnimationFrame(() => {
          textareaRef.current?.focus();
          textareaRef.current?.setSelectionRange(
            newCursorPos.start,
            newCursorPos.end
          );
          onSelectionChange(newCursorPos);
        });
      }
    },
    [content, selection, onContentChange, onSelectionChange, textareaRef]
  );

  const [isImageUploading, setIsImageUploading] = useState(false);

  const handleImageUpload = React.useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImageUploading(true);
      try {
        await onImageUpload(file);
      } finally {
        setIsImageUploading(false);
      }
    };

    input.click();
  }, [onImageUpload]);

  const tools = [
    {
      icon: Bold,
      tooltip: "粗体 (Ctrl+B)",
      onClick: () => wrapText("**", "**"),
    },
    {
      icon: Italic,
      tooltip: "斜体 (Ctrl+I)",
      onClick: () => wrapText("*", "*"),
    },
    {
      icon: Heading,
      tooltip: "标题",
      onClick: () => toggleLineFormat("### "),
    },
    {
      icon: Strikethrough,
      tooltip: "删除线",
      onClick: () => wrapText("~~", "~~"),
    },
    {
      icon: Quote,
      tooltip: "引用",
      onClick: () => toggleLineFormat("> "),
    },
    {
      icon: Code,
      tooltip: "代码块",
      onClick: () => wrapText("```\n", "\n```"),
    },
    {
      icon: Link,
      tooltip: "链接 (Ctrl+K)",
      onClick: () => wrapText("[", "](url)"),
    },
    {
      icon: isImageUploading ? Loader2 : Image,
      tooltip: isImageUploading ? "图片上传中..." : "上传图片",
      onClick: handleImageUpload,
      disabled: isImageUploading,
    },
    {
      icon: List,
      tooltip: "无序列表",
      onClick: () => toggleLineFormat("- "),
    },
    {
      icon: ListOrdered,
      tooltip: "有序列表",
      onClick: () => toggleLineFormat("1. "),
    },
  ];

  return (
    <div
      className={cn(
        "flex items-center  gap-2 p-2 border-t bg-background",
        className
      )}
    >
      {showPublishButton && (
        <Button
          onClick={onPublish}
          disabled={publishLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          {publishLoading ? "发布中..." : publishText}
        </Button>
      )}

      <div className="flex items-center gap-0.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPreviewModeChange(!previewMode)}
                className="h-8 w-8 p-0"
              >
                {previewMode ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{previewMode ? "编辑模式" : "预览模式"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {tools.map((tool, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={tool.onClick}
                  disabled={tool.disabled}
                  className="h-8 w-8 p-0"
                >
                  <tool.icon
                    className={cn(
                      "h-4 w-4",
                      tool.icon === Loader2 && "animate-spin"
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tool.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        {/* <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFullscreen}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFullscreen ? "退出全屏" : "全屏编辑"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}
      </div>
    </div>
  );
}
