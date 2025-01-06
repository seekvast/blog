import * as React from "react";
import { cn } from "@/lib/utils";
import { ToolbarButton } from "./create-post-modal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Icon } from "@/components/icons";

interface PostEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<void>;
  className?: string;
  previewMode?: boolean;
  onPreviewModeChange?: (mode: boolean) => void;
}

export function PostEditor({
  content,
  onChange,
  onImageUpload,
  className,
  previewMode = false,
  onPreviewModeChange,
}: PostEditorProps) {
  const handleToolbarAction = (action: string) => {
    const textArea = document.querySelector("textarea");
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = "";

    switch (action) {
      case "bold":
        newText = `**${selectedText || "粗体文字"}**`;
        break;
      case "italic":
        newText = `*${selectedText || "斜体文字"}*`;
        break;
      case "link":
        newText = `[${selectedText || "链接文字"}](链接地址)`;
        break;
      case "image":
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file && onImageUpload) {
            await onImageUpload(file);
          }
        };
        input.click();
        return;
      case "code":
        newText = selectedText.includes("\n")
          ? "```\n" + (selectedText || "代码块") + "\n```"
          : "`" + (selectedText || "代码") + "`";
        break;
      case "quote":
        newText = `> ${selectedText || "引用文字"}`;
        break;
      case "list-ul":
        newText = `- ${selectedText || "列表项"}`;
        break;
      case "list-ol":
        newText = `1. ${selectedText || "列表项"}`;
        break;
      case "at":
        newText = "@用户";
        break;
      case "h1":
        newText = `# ${selectedText || "标题"}`;
        break;
      case "h2":
        newText = `## ${selectedText || "标题"}`;
        break;
      case "h3":
        newText = `### ${selectedText || "标题"}`;
        break;
      default:
        return;
    }

    const newContent =
      content.substring(0, start) + newText + content.substring(end);
    onChange(newContent);

    // 恢复光标位置
    setTimeout(() => {
      textArea.focus();
      const newCursorPos = start + newText.length;
      textArea.selectionStart = textArea.selectionEnd = newCursorPos;
    });
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items || !onImageUpload) return;

    for (const item of Array.from(items)) {
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await onImageUpload(file);
        }
        break;
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const items = e.dataTransfer?.files;
    if (!items || !onImageUpload) return;

    for (const file of Array.from(items)) {
      if (file.type.indexOf("image") !== -1) {
        await onImageUpload(file);
        break;
      }
    }
  };

  return (
    <div className={cn("relative", className)}>
      {previewMode ? (
        <div className="min-h-[300px] rounded-lg border p-4 bg-gray-50">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            className="prose prose-sm max-w-none dark:prose-invert [&_img]:!my-0"
            components={{
              img: ({ src, alt, ...props }) => {
                const isLargeImage = props.title?.includes("large");
                const isMediumImage = props.title?.includes("medium");
                const isSmallImage = props.title?.includes("small");

                let sizeClass = "max-w-2xl"; // 默认尺寸
                if (isLargeImage) sizeClass = "max-w-4xl";
                if (isMediumImage) sizeClass = "max-w-xl";
                if (isSmallImage) sizeClass = "max-w-sm";

                return (
                  <img
                    src={src}
                    alt={alt || "图片"}
                    className={`${sizeClass} h-auto rounded-lg mx-auto`}
                    loading="lazy"
                    {...props}
                  />
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="rounded-lg border">
          <div className="flex items-center gap-1 border-b bg-gray-50/50 px-2">
            <div className="flex items-center">
              <ToolbarButton onClick={() => handleToolbarAction("h1")}>
                <Icon name="format_h1" />
              </ToolbarButton>
              <ToolbarButton onClick={() => handleToolbarAction("h2")}>
                <Icon name="format_h2" />
              </ToolbarButton>
              <ToolbarButton onClick={() => handleToolbarAction("h3")}>
                <Icon name="format_h3" />
              </ToolbarButton>
            </div>
            <div className="h-5 w-px bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => handleToolbarAction("bold")}>
              <Icon name="format_bold" />
            </ToolbarButton>
            <ToolbarButton onClick={() => handleToolbarAction("italic")}>
              <Icon name="format_italic" />
            </ToolbarButton>
            <ToolbarButton onClick={() => handleToolbarAction("underline")}>
              <Icon name="format_underlined" />
            </ToolbarButton>
            <div className="h-5 w-px bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => handleToolbarAction("list-ul")}>
              <Icon name="format_list_bulleted" />
            </ToolbarButton>
            <ToolbarButton onClick={() => handleToolbarAction("list-ol")}>
              <Icon name="format_list_numbered" />
            </ToolbarButton>
            <ToolbarButton onClick={() => handleToolbarAction("quote")}>
              <Icon name="format_quote" />
            </ToolbarButton>
            <div className="h-5 w-px bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => handleToolbarAction("image")}>
              <Icon name="image" />
            </ToolbarButton>
            <ToolbarButton onClick={() => handleToolbarAction("link")}>
              <Icon name="link" />
            </ToolbarButton>
            <ToolbarButton onClick={() => handleToolbarAction("code")}>
              <Icon name="code" />
            </ToolbarButton>
            <ToolbarButton onClick={() => handleToolbarAction("at")}>
              <Icon name="alternate_email" />
            </ToolbarButton>
          </div>
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            placeholder="说说你的想法..."
            className="min-h-[300px] w-full resize-none p-4 font-mono focus:outline-none focus:ring-0"
          />
        </div>
      )}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={() => onPreviewModeChange?.(!previewMode)}
          className="inline-flex h-8 items-center justify-center rounded-md border bg-background px-3 text-xs font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-1"
        >
          <Icon name={previewMode ? "edit" : "preview"} className="text-base" />
          {previewMode ? "编辑" : "预览"}
        </button>
      </div>
    </div>
  );
}
