import * as React from "react";
import { cn } from "@/lib/utils";
import { ToolbarButton } from "./create-post-modal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

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
              <ToolbarButton onClick={() => handleToolbarAction("h1")}>H1</ToolbarButton>
              <ToolbarButton onClick={() => handleToolbarAction("h2")}>H2</ToolbarButton>
              <ToolbarButton onClick={() => handleToolbarAction("h3")}>H3</ToolbarButton>
            </div>
            <div className="h-5 w-px bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => handleToolbarAction("bold")}>B</ToolbarButton>
            <ToolbarButton onClick={() => handleToolbarAction("italic")}>I</ToolbarButton>
            <ToolbarButton onClick={() => handleToolbarAction("underline")}>S</ToolbarButton>
            <div className="h-5 w-px bg-gray-200 mx-1" />
            <ToolbarButton 
              onClick={() => handleToolbarAction("list-ul")}
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h7" />
                </svg>
              }
            />
            <ToolbarButton 
              onClick={() => handleToolbarAction("list-ol")}
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              }
            />
            <ToolbarButton 
              onClick={() => handleToolbarAction("quote")}
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8h.01M3 8h.01M3 16h18M3 12h18" />
                </svg>
              }
            />
            <div className="h-5 w-px bg-gray-200 mx-1" />
            <ToolbarButton 
              onClick={() => handleToolbarAction("image")}
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <ToolbarButton 
              onClick={() => handleToolbarAction("link")}
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              }
            />
            <ToolbarButton 
              onClick={() => handleToolbarAction("code")}
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              }
            />
            <ToolbarButton onClick={() => handleToolbarAction("at")}>@</ToolbarButton>
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
          className="inline-flex h-8 items-center justify-center rounded-md border bg-background px-3 text-xs font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {previewMode ? "编辑" : "预览"}
        </button>
      </div>
    </div>
  );
}
