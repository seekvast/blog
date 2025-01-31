import React from "react";
import { useMarkdownEditor } from "@/store/md-editor";
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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/lib/utils/upload";

interface ToolbarProps {
  className?: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onImageUpload: (file: File) => Promise<void>;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
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
}: ToolbarProps) {
  const {
    content,
    setContent,
    selection,
    setSelection,
    previewMode,
    setPreviewMode,
    undo,
    redo,
  } = useMarkdownEditor();

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

        setContent(newText);

        // 设置新的光标位置
        const newSelection = {
          start: formatStart,
          end: formatEnd - (before.length + after.length),
        };

        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(newSelection.start, newSelection.end);
          setSelection(newSelection);
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

        setContent(newText);
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(newSelection.start, newSelection.end);
          setSelection(newSelection);
        });
      }
    },
    [content, setContent, setSelection, textareaRef]
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

      setContent(newContent);

      if (textareaRef?.current) {
        requestAnimationFrame(() => {
          textareaRef.current?.focus();
          textareaRef.current?.setSelectionRange(
            newCursorPos.start,
            newCursorPos.end
          );
          setSelection(newCursorPos);
        });
      }
    },
    [content, selection, setContent, setSelection, textareaRef]
  );

  // 添加图片上传处理函数
  const handleImageUpload = React.useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      await onImageUpload(file);
    };

    input.click();
  }, [onImageUpload]);

  const tools = [
    {
      icon: Heading,
      tooltip: "标题 1",
      onClick: () => toggleLineFormat("# "),
    },
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
      icon: Strikethrough,
      tooltip: "删除线",
      onClick: () => wrapText("~~", "~~"),
    },
    {
      icon: Link,
      tooltip: "链接 (Ctrl+K)",
      onClick: () => wrapText("[", "](url)"),
    },
    {
      icon: Image,
      tooltip: "上传图片",
      onClick: handleImageUpload,
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
  ];

  return (
    <div className={cn("flex items-center gap-0.5 p-1", className)}>
      {tools.map((tool, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={tool.onClick}
                className="h-8 w-8 p-0"
              >
                <tool.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tool.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      <div className="flex items-center gap-0.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="px-2"
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
      </div>
      <div className="flex items-center gap-0.5 ml-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFullscreen}
                className="px-2"
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
        </TooltipProvider>
      </div>
    </div>
  );
}
