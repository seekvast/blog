import * as React from "react";
import { cn } from "@/lib/utils";
import { ToolbarButton } from "./create-post-modal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Icon } from "@/components/icons";
import { http } from "@/lib/request";
import { Portal } from "@/components/ui/portal";
import { UserLink } from "@/components/markdown/user-link";

interface User {
  hashid: string;
  username: string;
  nickname: string;
  avatar_url: string;
}

interface PostEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<void>;
  className?: string;
  previewMode?: boolean;
  onPreviewModeChange?: (mode: boolean) => void;
  imageUploading?: boolean;
}

export function PostEditor({
  content,
  onChange,
  onImageUpload,
  previewMode = false,
  onPreviewModeChange,
  imageUploading = false,
  className,
}: PostEditorProps) {
  const [splitView, setSplitView] = React.useState(false);
  const [showUserList, setShowUserList] = React.useState(false);
  const [userSearchQuery, setUserSearchQuery] = React.useState("");
  const [users, setUsers] = React.useState<User[]>([]);
  const [cursorPosition, setCursorPosition] = React.useState({
    start: 0,
    end: 0,
  });
  const [mentionPosition, setMentionPosition] = React.useState({
    top: 0,
    left: 0,
  });
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const processUrlDebounceRef = React.useRef<NodeJS.Timeout>();
  const userSearchDebounceRef = React.useRef<NodeJS.Timeout>();

  // 处理特殊内容（链接、YouTube等）
  const processSpecialContent = React.useCallback(
    (text: string, cursorPos: number) => {
      const lines = text.split("\n");
      let currentPos = 0;
      const processedLines = lines.map((line) => {
        const lineLength = line.length + 1; // +1 for newline
        if (currentPos + lineLength < cursorPos) {
          currentPos += lineLength;
          return line;
        }

        // 处理 YouTube 链接
        const youtubeMatch = line.match(
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:&\S*)?/
        );
        if (youtubeMatch) {
          return `\n<iframe width="560" height="315" src="https://www.youtube.com/embed/${youtubeMatch[1]}" frameborder="0" allowfullscreen></iframe>\n`;
        }

        // 处理图片链接
        const imageMatch = line.match(
          /https?:\/\/[^\s<]+\.(?:jpg|jpeg|png|gif)(?:\?[^\s<]+)?/i
        );
        if (imageMatch) {
          return `![](${imageMatch[0]})`;
        }

        // 处理普通链接
        const urlMatch = line.match(/https?:\/\/[^\s<]+[^<.,:;"')\]\s]/);
        if (urlMatch && !line.includes("[") && !line.includes("]")) {
          return line.replace(urlMatch[0], `[${urlMatch[0]}](${urlMatch[0]})`);
        }

        currentPos += lineLength;
        return line;
      });

      return processedLines.join("\n");
    },
    []
  );

  // 处理用户搜索
  const searchUsers = React.useCallback(async (query: string) => {
    try {
      const response = await http.get(
        `/api/users?keyword=${encodeURIComponent(query)}`
      );
      if (response.code === 0) {
        setUsers(response.data);
      } else {
        console.error("Error searching users:", response.message);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
    }
  }, []);

  // 处理输入
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const currentPosition = e.target.selectionStart || 0;
    onChange(value);

    // 清除之前的定时器
    if (processUrlDebounceRef.current) {
      clearTimeout(processUrlDebounceRef.current);
    }
    if (userSearchDebounceRef.current) {
      clearTimeout(userSearchDebounceRef.current);
    }

    // 检查是否在@提及上下文中
    const lastAtPos = value.lastIndexOf("@", currentPosition);
    if (lastAtPos !== -1) {
      const textAfterAt = value.slice(lastAtPos + 1, currentPosition);
      // 如果@后面有空格或换行，或者光标不在@后面，则不显示搜索结果
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setShowUserList(true);
        setCursorPosition({ start: currentPosition, end: currentPosition });
        setUserSearchQuery(textAfterAt);
        calculateMentionPosition(lastAtPos);
        if (textAfterAt) {
          userSearchDebounceRef.current = setTimeout(() => {
            searchUsers(textAfterAt);
          }, 300);
        }
        return;
      }
    }

    setShowUserList(false);

    // 处理特殊内容（链接、YouTube等）
    if (
      value[currentPosition - 1] === " " ||
      value[currentPosition - 1] === "\n"
    ) {
      processUrlDebounceRef.current = setTimeout(() => {
        const processedText = processSpecialContent(value, currentPosition);
        if (processedText !== value) {
          onChange(processedText);
        }
      }, 100);
    }
  };

  // 计算@符号的位置
  const calculateMentionPosition = React.useCallback((atPosition: number) => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const text = textarea.value;

    // 创建一个临时的 span 元素来计算文本宽度
    const span = document.createElement("span");
    // 复制 textarea 的样式
    const computedStyle = window.getComputedStyle(textarea);
    span.style.font = computedStyle.font;
    span.style.fontSize = computedStyle.fontSize;
    span.style.padding = computedStyle.padding;
    span.style.whiteSpace = "pre-wrap";
    span.style.position = "absolute";
    span.style.visibility = "hidden";
    document.body.appendChild(span);

    // 获取@符号之前的文本
    const textBeforeAt = text.substring(0, atPosition);
    const lines = textBeforeAt.split("\n");
    const currentLine = lines[lines.length - 1];

    // 计算@符号之前文本的宽度
    span.textContent = currentLine + "@";
    const textWidth = span.offsetWidth;

    // 清理临时元素
    document.body.removeChild(span);

    // 获取 textarea 的位置信息
    const paddingLeft = parseInt(computedStyle.paddingLeft);
    const paddingTop = parseInt(computedStyle.paddingTop);
    const lineHeight = parseInt(computedStyle.lineHeight);

    // 计算@符号的位置
    const top = paddingTop + (lines.length - 1) * lineHeight;
    const left = paddingLeft + textWidth;

    setMentionPosition({ top, left });
  }, []);

  // 处理按键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showUserList) {
      // 按 ESC 关闭用户列表
      if (e.key === "Escape") {
        setShowUserList(false);
        return;
      }
      // 按空格或回车关闭用户列表
      if (e.key === "Enter" || e.key === " ") {
        setShowUserList(false);
      }
    }
  };

  // 处理粘贴
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // 处理图片粘贴
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith("image/"));

    if (imageItem && onImageUpload) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        await onImageUpload(file);
      }
      return;
    }

    // 处理文本粘贴
    const text = e.clipboardData.getData("text");
    if (text && textAreaRef.current) {
      e.preventDefault();
      const selectionStart = textAreaRef.current.selectionStart || 0;
      const selectionEnd = textAreaRef.current.selectionEnd || 0;
      const beforeSelection = content.substring(0, selectionStart);
      const afterSelection = content.substring(selectionEnd);

      // 处理粘贴的文本
      const processedText = processSpecialContent(text, text.length);
      const newContent = beforeSelection + processedText + afterSelection;

      onChange(newContent);

      // 设置光标位置
      const newPosition = selectionStart + processedText.length;
      requestAnimationFrame(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          textAreaRef.current.setSelectionRange(newPosition, newPosition);
        }
      });
    }
  };

  // 处理拖拽
  const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const items = e.dataTransfer.files;

    for (const file of Array.from(items)) {
      if (file.type.startsWith("image/") && onImageUpload) {
        await onImageUpload(file);
        break;
      }
    }
  };

  // 处理快捷键
  const handleToolbarAction = (action: string) => {
    if (!textAreaRef.current) return;

    const start = textAreaRef.current.selectionStart;
    const end = textAreaRef.current.selectionEnd;
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
        input.style.display = "none";
        document.body.appendChild(input);

        input.onchange = async (e) => {
          try {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file && onImageUpload) {
              await onImageUpload(file);
            }
          } finally {
            document.body.removeChild(input);
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
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        const newCursorPos = start + newText.length;
        textAreaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  };

  // 处理用户选择
  const handleUserSelect = (user: User) => {
    if (!textAreaRef.current) return;

    const text = content;
    const lastAtPos = text.lastIndexOf("@", cursorPosition.start);
    if (lastAtPos === -1) return;

    // 删除@和搜索关键词，插入用户链接标记
    const beforeAt = text.substring(0, lastAtPos);
    const afterCursor = text.substring(cursorPosition.start);
    // 使用特殊标记包裹用户名，以便渲染时转换为链接
    const newContent =
      beforeAt + `[@${user.username}](/users/${user.hashid}) ` + afterCursor;

    onChange(newContent);
    setShowUserList(false);
    setUsers([]);

    // 恢复光标位置到用户名后面
    const newPosition =
      lastAtPos + user.username.length + user.hashid.length + 16; // 计算新的光标位置
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        textAreaRef.current.setSelectionRange(newPosition, newPosition);
      }
    });
  };

  return (
    <div className={className}>
      {imageUploading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <Icon
              name="refresh"
              className="h-6 w-6 animate-spin text-primary"
            />
            <span className="text-sm text-gray-500">正在上传图片...</span>
          </div>
        </div>
      )}
      <div className="relative rounded-lg border">
        {imageUploading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-2">
              <Icon
                name="refresh"
                className="h-6 w-6 animate-spin text-primary"
              />
              <span className="text-sm text-gray-500">正在上传图片...</span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-0.5 p-2 border-b bg-gray-50/50">
          <ToolbarButton
            onClick={() => handleToolbarAction("h1")}
            icon={<Icon name="format_h1" className="h-5 w-5" />}
          />
          <ToolbarButton
            onClick={() => handleToolbarAction("h2")}
            icon={<Icon name="format_h2" className="h-5 w-5" />}
          />
          <ToolbarButton
            onClick={() => handleToolbarAction("h3")}
            icon={<Icon name="format_h3" className="h-5 w-5" />}
          />
          <div className="h-5 w-px bg-gray-200 mx-1" />
          <ToolbarButton
            onClick={() => handleToolbarAction("bold")}
            icon={<Icon name="format_bold" className="h-5 w-5" />}
          />
          <ToolbarButton
            onClick={() => handleToolbarAction("italic")}
            icon={<Icon name="format_italic" className="h-5 w-5" />}
          />
          <div className="h-5 w-px bg-gray-200 mx-1" />
          <ToolbarButton
            onClick={() => handleToolbarAction("list-ul")}
            icon={<Icon name="format_list_bulleted" className="h-5 w-5" />}
          />
          <ToolbarButton
            onClick={() => handleToolbarAction("list-ol")}
            icon={<Icon name="format_list_numbered" className="h-5 w-5" />}
          />
          <ToolbarButton
            onClick={() => handleToolbarAction("quote")}
            icon={<Icon name="format_quote" className="h-5 w-5" />}
          />
          <div className="h-5 w-px bg-gray-200 mx-1" />
          <ToolbarButton
            onClick={() => handleToolbarAction("image")}
            icon={<Icon name="image" className="h-5 w-5" />}
          />
          <ToolbarButton
            onClick={() => handleToolbarAction("link")}
            icon={<Icon name="link" className="h-5 w-5" />}
          />
          <ToolbarButton
            onClick={() => handleToolbarAction("code")}
            icon={<Icon name="code" className="h-5 w-5" />}
          />
        </div>

        <div
          className={cn(
            "grid gap-4",
            splitView ? "grid-cols-2" : "grid-cols-1"
          )}
        >
          <div className="relative">
            <textarea
              ref={textAreaRef}
              value={content}
              onChange={handleInput}
              onPaste={handlePaste}
              onDrop={handleDrop}
              onKeyDown={handleKeyDown}
              className="min-h-[300px] w-full resize-none border-0 bg-transparent p-4 outline-none"
              placeholder="写点什么..."
            />
            {showUserList && users.length > 0 && (
              <div
                className="absolute z-50 w-64 max-h-48 overflow-y-auto bg-white border rounded-md shadow-lg"
                style={{
                  top: `${mentionPosition.top}px`,
                  left: `${mentionPosition.left}px`,
                }}
              >
                {users.map((user) => (
                  <div
                    key={user.hashid}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleUserSelect(user)}
                  >
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-6 h-6 rounded-full"
                    />
                    <div>
                      <div className="font-medium">{user.nickname}</div>
                      <div className="text-sm text-gray-500">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {splitView && (
            <div className="border-l p-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  a: ({ href, children }) => (
                    <UserLink href={href || ""}>{children}</UserLink>
                  ),
                }}
                className="prose prose-sm max-w-none break-words"
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 flex justify-end">
        <button
          onClick={() => setSplitView(!splitView)}
          className="inline-flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <Icon
            name={splitView ? "view_agenda" : "view_sidebar"}
            className="h-4 w-4"
          />
          <span>{splitView ? "关闭预览" : "开启预览"}</span>
        </button>
      </div>
    </div>
  );
}
