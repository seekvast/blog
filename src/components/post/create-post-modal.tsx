import * as React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Portal } from "@radix-ui/react-portal";
import * as Dialog from "@radix-ui/react-dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { http } from "@/lib/request";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import { BoardSelect } from "@/components/board-select";
import { API_ROUTES } from "@/constants/api";

interface PollData {
  options: string[];
  isMultipleChoice: boolean;
  showVoters: boolean;
  hasDeadline: boolean;
  startTime?: string;
  endTime?: string;
}

interface BoardChild {
  board_id: number;
  name: string;
  creator_hashid: string;
  is_default: number;
  sort: number;
  id: number;
}

interface BoardChildrenResponse {
  code: number;
  data: {
    items: BoardChild[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
  message: string;
}

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CreatePostModalState {
  title: string;
  content: string;
  selectedBoard: number | undefined;
  selectedChildBoard: number | undefined;
  previewMode: boolean;
  isSubmitting: boolean;
  boardChildren: BoardChild[];
  loadingChildren: boolean;
  attachments: { id: number; file_name: string; file_type: string }[];
  isPollEditing: boolean;
  pollOptions: string[];
  isMultipleChoice: boolean;
  showVoters: boolean;
  hasDeadline: boolean;
  pollStartTime: string;
  pollEndTime: string;
  pollData: PollData | null;
}

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [selectedBoard, setSelectedBoard] = React.useState<number | undefined>(
    1
  );
  const [selectedChildBoard, setSelectedChildBoard] = React.useState<
    number | undefined
  >();
  const [previewMode, setPreviewMode] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [boardChildren, setBoardChildren] = React.useState<BoardChild[]>([]);
  const [loadingChildren, setLoadingChildren] = React.useState(false);
  const [attachments, setAttachments] = React.useState<
    { id: number; file_name: string; file_type: string }[]
  >([]);
  const [isPollEditing, setIsPollEditing] = React.useState(false);
  const [pollOptions, setPollOptions] = React.useState<string[]>(["", ""]);
  const [isMultipleChoice, setIsMultipleChoice] = React.useState(false);
  const [showVoters, setShowVoters] = React.useState(false);
  const [hasDeadline, setHasDeadline] = React.useState(false);
  const [pollStartTime, setPollStartTime] = React.useState("");
  const [pollEndTime, setPollEndTime] = React.useState("");
  const [pollData, setPollData] = React.useState<PollData | null>(null);

  const handlePollConfirm = () => {
    const validOptions = pollOptions.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      console.error("至少需要两个有效的投票选项");
      return;
    }

    if (
      hasDeadline &&
      (!pollStartTime ||
        !pollEndTime ||
        new Date(pollEndTime) <= new Date(pollStartTime))
    ) {
      console.error("请设置有效的投票时间区间");
      return;
    }

    setPollData({
      options: validOptions,
      isMultipleChoice,
      showVoters,
      hasDeadline,
      startTime: hasDeadline ? pollStartTime : undefined,
      endTime: hasDeadline ? pollEndTime : undefined,
    });
    setIsPollEditing(false);
  };

  const handleDeletePoll = () => {
    setPollData(null);
    setPollOptions(["", ""]);
    setIsMultipleChoice(false);
    setShowVoters(false);
    setHasDeadline(false);
    setPollStartTime("");
    setPollEndTime("");
    setIsPollEditing(false);
  };

  const PollEditor = () => (
    <div className="mb-4 border rounded-lg p-4 bg-gray-50">
      <div className="space-y-4">
        {pollOptions.map((option, index) => (
          <div key={index} className="relative">
            <Input
              value={option}
              onChange={(e) => {
                const newOptions = [...pollOptions];
                newOptions[index] = e.target.value;
                setPollOptions(newOptions);
              }}
              placeholder={`选项 ${index + 1}`}
              className="pr-8"
            />
            {pollOptions.length > 2 && (
              <button
                onClick={() => {
                  setPollOptions(pollOptions.filter((_, i) => i !== index));
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 rounded-full w-5 h-5 flex items-center justify-center"
                type="button"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setPollOptions([...pollOptions, ""])}
          className="w-full flex items-center justify-center gap-1 text-blue-500 hover:text-blue-700"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 3V13M3 8H13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          增加选项
        </button>
        <div className="flex items-center justify-between py-2">
          <span>允许多选</span>
          <Switch checked={isMultipleChoice} onCheckedChange={setIsMultipleChoice} />
        </div>
        <div className="flex items-center justify-between border-t border-b py-2">
          <span>公开投票人</span>
          <Switch checked={showVoters} onCheckedChange={setShowVoters} />
        </div>
        <div className="flex items-center justify-between py-2">
          <span>设置截止时间</span>
          <Switch checked={hasDeadline} onCheckedChange={setHasDeadline} />
        </div>
        {hasDeadline && (
          <div className="space-y-2 border-t py-2">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  开始时间
                </label>
                <Input
                  type="datetime-local"
                  value={pollStartTime}
                  onChange={(e) => setPollStartTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  结束时间
                </label>
                <Input
                  type="datetime-local"
                  value={pollEndTime}
                  onChange={(e) => setPollEndTime(e.target.value)}
                  min={pollStartTime}
                />
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsPollEditing(false)}>
            取消
          </Button>
          <Button onClick={handlePollConfirm}>确认</Button>
        </div>
      </div>
    </div>
  );

  const PollPreview = () => {
    if (!pollData) return null;

    return (
      <div className="mb-4 border rounded-lg p-4 bg-gray-50 relative">
        <button
          onClick={handleDeletePoll}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button
          onClick={() => {
            setPollOptions(pollData.options);
            setIsMultipleChoice(pollData.isMultipleChoice);
            setShowVoters(pollData.showVoters);
            setHasDeadline(pollData.hasDeadline);
            if (pollData.startTime) setPollStartTime(pollData.startTime);
            if (pollData.endTime) setPollEndTime(pollData.endTime);
            setIsPollEditing(true);
          }}
          className="absolute top-2 right-10 text-gray-500 hover:text-gray-700"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <div className="space-y-4">
          <div className="space-y-2">
            {pollData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-gray-500">选项 {index + 1} </span>
                <span>{option}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
            {pollData.isMultipleChoice && (
              <Badge variant="secondary" className="text-primary">
                多选
              </Badge>
            )}
            {pollData.showVoters && (
              <Badge variant="secondary" className="text-primary">
                允许用户查看投票人
              </Badge>
            )}
            {pollData.hasDeadline && pollData.startTime && pollData.endTime && (
              <Badge variant="secondary" className="text-primary">
                <span>限时投票：</span>
                {new Date(pollData.startTime).toLocaleString()} -{" "}
                {new Date(pollData.endTime).toLocaleString()}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      console.error("请输入标题");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        title: title.trim(),
        content: content.trim(),
        board_id: selectedBoard,
        board_child_id: selectedChildBoard,
        attachments: attachments.length > 0 ? attachments : undefined,
        poll: pollData,
      };

      const response = await http.post(API_ROUTES.DISCUSSIONS.CREATE, data);
      if (response.code === 0) {
        console.log("发布成功");
        onOpenChange(false);
        router.refresh();
      }
    } catch (error) {
      console.error("发布失败", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = React.useCallback(() => {
    // 处理保存草稿逻辑
    console.log("Save draft", { title, content });
  }, [title, content]);

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("attachment_type", "topics_images");

    try {
      const response = (await http.post(API_ROUTES.UPLOAD.IMAGE, formData)) as {
        code: number;
        data: {
          id: number;
          host: string;
          file_path: string;
          file_name: string;
        };
        message: string;
      };

      if (response.code === 0) {
        const imageUrl = `${response.data.host}${response.data.file_path}`;
        // 添加到附件列表
        const newAttachment = {
          id: response.data.id,
          file_name: response.data.file_name,
          file_type: "image",
        };
        setAttachments((prev) => [...prev, newAttachment]);

        // 在光标位置插入图片 Markdown
        const textArea = document.querySelector("textarea");
        if (textArea) {
          const start = textArea.selectionStart;
          const end = textArea.selectionEnd;
          const newContent =
            content.substring(0, start) +
            `![${response.data.file_name}](${imageUrl} "medium")` +
            content.substring(end);
          setContent(newContent);

          // 恢复光标位置
          setTimeout(() => {
            textArea.focus();
            const newPos =
              start +
              `![${response.data.file_name}](${imageUrl} "medium")`.length;
            textArea.selectionStart = textArea.selectionEnd = newPos;
          });
        }
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    // 处理图片粘贴
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            await handleImageUpload(file);
          }
          return;
        }
      }
    }

    // 处理文本粘贴（YouTube 链接）
    const text = e.clipboardData.getData("text");
    if (text) {
      const youtubeRegex =
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
      const match = text.match(youtubeRegex);
      if (match) {
        e.preventDefault();
        const videoId = match[1];
        const embedCode = `<iframe src="https://www.youtube.com/embed/${videoId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

        const textArea = e.target as HTMLTextAreaElement;
        const start = textArea.selectionStart;
        const end = textArea.selectionEnd;
        const newContent =
          content.substring(0, start) + embedCode + content.substring(end);
        setContent(newContent);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      await handleImageUpload(files[0]);
    }
  };

  const handleFormatClick = (format: string) => {
    const textArea = document.querySelector("textarea");
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = "";

    switch (format) {
      case "bold":
        newText = `**${selectedText || "粗体文字"}**`;
        break;
      case "italic":
        newText = `_${selectedText || "斜体文字"}_`;
        break;
      case "underline":
        newText = `~~${selectedText || "删除文字"}~~`;
        break;
      case "list-ul":
        newText = selectedText
          ? selectedText
              .split("\n")
              .map((line) => `- ${line}`)
              .join("\n")
          : "- 列表项";
        break;
      case "list-ol":
        newText = selectedText
          ? selectedText
              .split("\n")
              .map((line, i) => `${i + 1}. ${line}`)
              .join("\n")
          : "1. 列表项";
        break;
      case "quote":
        newText = selectedText
          ? selectedText
              .split("\n")
              .map((line) => `> ${line}`)
              .join("\n")
          : "> 引用文字";
        break;
      case "code":
        newText = selectedText ? `\`${selectedText}\`` : "`代码`";
        break;
      case "link":
        newText = selectedText
          ? `[${selectedText}](链接地址)`
          : "[链接文字](链接地址)";
        break;
      case "image":
        newText = '![图片描述](图片地址 "medium")'; // 默认使用 medium 尺寸
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
    setContent(newContent);

    // 恢复光标位置
    setTimeout(() => {
      textArea.focus();
      const newCursorPos = start + newText.length;
      textArea.selectionStart = textArea.selectionEnd = newCursorPos;
    });
  };

  const loadBoardChildren = React.useCallback(async (boardId: number) => {
    try {
      setLoadingChildren(true);
      const response = await http.get<BoardChildrenResponse>(
        `${API_ROUTES.BOARDS.CHILDREN}?board_id=${boardId}`
      );

      if (response.code === 0) {
        setBoardChildren(response.data.items);
        // Set default selected child board if exists
        const defaultChild = response.data.items.find(
          (child) => child.is_default === 1
        );
        setSelectedChildBoard(defaultChild?.id ?? undefined);
      }
    } catch (error) {
      console.error("Failed to load board children:", error);
    } finally {
      setLoadingChildren(false);
    }
  }, []);

  React.useEffect(() => {
    if (selectedBoard) {
      loadBoardChildren(selectedBoard);
    } else {
      setBoardChildren([]);
    }
  }, [selectedBoard, loadBoardChildren]);

  const resetAllStates = React.useCallback(() => {
    setTitle("");
    setContent("");
    setSelectedBoard(1);
    setSelectedChildBoard(undefined);
    setPreviewMode(false);
    setIsSubmitting(false);
    setBoardChildren([]);
    setAttachments([]);
    setPollData(null);
    setPollOptions(["", ""]);
    setIsMultipleChoice(false);
    setShowVoters(false);
    setHasDeadline(false);
    setPollStartTime("");
    setPollEndTime("");
    setIsPollEditing(false);
  }, []);

  const handleClose = React.useCallback(() => {
    resetAllStates();
    onOpenChange(false);
  }, [onOpenChange, resetAllStates]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, handleClose]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // 当模态框关闭时重置状态
  React.useEffect(() => {
    if (!open) {
      resetAllStates();
    }
  }, [open, resetAllStates]);

  return (
    <Portal>
      <div
        className={cn(
          "fixed inset-0 top-14 z-40 transform bg-background transition-transform duration-300 ease-in-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
        style={{ height: "calc(100% - 56px)" }}
      >
        <div className="bg-white h-full flex flex-col mx-auto w-[1360px] mt-8 px-4">
          <div className="sticky-header">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-medium leading-none">发布文章</h1>
              <BoardSelect value={selectedBoard} onChange={setSelectedBoard} />
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
              >
                取消
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!pollData && !isPollEditing) {
                    setIsPollEditing(true);
                  }
                }}
                disabled={pollData || isPollEditing}
              >
                投票
              </Button>
              <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                保存草稿箱
              </Button>
              <Button size="sm" onClick={handlePublish} disabled={isSubmitting}>
                {isSubmitting ? "发布中..." : "发布"}
              </Button>
            </div>
          </div>
          <div className="border-t py-4">
            <h3 className="text-sm font-medium mb-2">子版</h3>
            <div className="flex flex-wrap gap-2">
              {loadingChildren ? (
                <div className="text-sm text-muted-foreground">加载中...</div>
              ) : boardChildren.length > 0 ? (
                boardChildren.map((child) => (
                  <Badge
                    key={child.id}
                    variant={
                      selectedChildBoard === child.id ? "default" : "secondary"
                    }
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => setSelectedChildBoard(child.id)}
                  >
                    # {child.name}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">暂无子版</div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <main className="py-4">
              <div className="mb-6">
                <Input
                  type="text"
                  placeholder="请输入文章标题"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl"
                />
              </div>

              <div className="relative mt-4">
                {previewMode ? (
                  <div className="min-h-[300px] rounded-lg border p-4">
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
                        <button
                          onClick={() => handleFormatClick("h1")}
                          className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600 font-medium"
                        >
                          H1
                        </button>
                        <button
                          onClick={() => handleFormatClick("h2")}
                          className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600 font-medium"
                        >
                          H2
                        </button>
                        <button
                          onClick={() => handleFormatClick("h3")}
                          className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600 font-medium"
                        >
                          H3
                        </button>
                      </div>
                      <div className="h-5 w-px bg-gray-200 mx-1" />
                      <button
                        onClick={() => handleFormatClick("bold")}
                        className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600 font-medium"
                      >
                        B
                      </button>
                      <button
                        onClick={() => handleFormatClick("italic")}
                        className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600 italic"
                      >
                        I
                      </button>
                      <button
                        onClick={() => handleFormatClick("underline")}
                        className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600 line-through"
                      >
                        S
                      </button>
                      <div className="h-5 w-px bg-gray-200 mx-1" />
                      <button
                        onClick={() => handleFormatClick("list-ul")}
                        className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600"
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 6h13M8 12h13M8 18h7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleFormatClick("list-ol")}
                        className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600"
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleFormatClick("quote")}
                        className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600"
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7.5 8h.01M3 8h.01M3 16h18M3 12h18"
                          />
                        </svg>
                      </button>
                      <div className="h-5 w-px bg-gray-200 mx-1" />
                      <button
                        onClick={() => handleFormatClick("image")}
                        className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600"
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleFormatClick("link")}
                        className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600"
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleFormatClick("code")}
                        className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600"
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleFormatClick("at")}
                        className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600"
                      >
                        @
                      </button>
                    </div>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onPaste={handlePaste}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      placeholder="说说你的想法..."
                      className="min-h-[300px] w-full resize-none p-4 font-mono focus:outline-none focus:ring-0"
                    />
                  </div>
                )}
                <div className="absolute bottom-4 right-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    {previewMode ? "编辑" : "预览"}
                  </Button>
                </div>
              </div>

              <div className="mt-8 border-t pt-4">
                {isPollEditing ? <PollEditor /> : pollData && <PollPreview />}
              </div>
            </main>
          </div>
        </div>
      </div>
    </Portal>
  );
}
