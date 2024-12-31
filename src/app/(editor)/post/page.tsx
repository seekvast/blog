"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { http } from "@/lib/request";

// 模拟子版数据
const BOARDS = [
  { id: 1, name: "OTA测试室", icon: "#" },
  { id: 2, name: "故事记", icon: "#" },
  { id: 3, name: "记忆迷宫", icon: "#" },
  { id: 4, name: "记忆迷宫", icon: "#" },
  { id: 5, name: "充电攻略", icon: "#" },
  { id: 6, name: "NGP体验营", icon: "#" },
  { id: 7, name: "新能源", icon: "#" },
  { id: 8, name: "记忆迷宫", icon: "#" },
  { id: 9, name: "充电攻略", icon: "#" },
  { id: 10, name: "充电攻略", icon: "#" },
  { id: 11, name: "充电攻略", icon: "#" },
  { id: 12, name: "充电攻略", icon: "#" },
  { id: 13, name: "充电攻略", icon: "#" },
];

interface Attachment {
  id: number;
  file_name: string;
  file_type: string;
}

interface CreateDiscussionRequest {
  title: string;
  board_id: number;
  board_child_id?: number;
  content: string;
  attachments?: Attachment[];
}

interface MainPost {
  number: number;
  type: string;
  board_id: number;
  board_child_id: number;
  content: string;
  updated_at: string;
  created_at: string;
  id: number;
}

interface CreateDiscussionResponse {
  title: string;
  board_id: number;
  user_hashid: string;
  last_post_number: number;
  board_child_id: number;
  board_creator_hashid: string;
  updated_at: string;
  created_at: string;
  slug: string;
  first_post_id: number;
  main_post: MainPost;
}

export default function NewDiscussionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [selectedBoard, setSelectedBoard] = React.useState<{ id: number; name: string } | null>(null);
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "错误",
        description: "标题和内容不能为空",
        variant: "destructive",
      });
      return;
    }

    // if (!selectedBoard) {
    //   toast({
    //     title: "错误",
    //     description: "请选择发布板块",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    try {
      setIsSubmitting(true);

      const requestData: CreateDiscussionRequest = {
        title: title.trim(),
        content: content.trim(),
        board_id: 1, // 父板块ID
        board_child_id: 1, // 子板块ID
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      const response = await http.post("/api/discussion", requestData, { auth: true }) as {
        code: number;
        data: CreateDiscussionResponse;
        message: string;
      };

      if (response.code === 0) {
        toast({
          title: "发布成功",
          description: "文章已成功发布",
        });
        // 跳转到文章详情页
        router.push(`/boards/${response.data.slug}`);
      } else {
        throw new Error(response.message || "发布失败");
      }
    } catch (error) {
      console.error("Failed to publish discussion:", error);
      toast({
        title: "发布失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("attachment_type", "topics_images");

      const response = await http.post(
        "/api/upload/image",
        formData
      ) as { 
        code: number; 
        data: {
          id: number;
          host: string;
          file_path: string;
          file_name: string;
        }; 
        message: string 
      };

      if (response.code === 0) {
        const imageUrl = `${response.data.host}${response.data.file_path}`;
        const newAttachment: Attachment = {
          id: response.data.id,
          file_name: response.data.file_name,
          file_type: "image",
        };
        setAttachments((prev) => [...prev, newAttachment]);
        return imageUrl;
      }
      throw new Error(response.message || "Upload failed");
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast({
        title: "上传失败",
        description: error instanceof Error ? error.message : "图片上传失败，请重试",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSaveDraft = React.useCallback(() => {
    // 处理保存草稿逻辑
    console.log("Save draft", { title, content });
  }, [title, content]);

  return (
    <div className="bg-white">
      <div className="mx-auto flex max-w-[808px] items-center justify-between px-6 py-4">
        <h1 className="text-lg font-medium">发布文章</h1>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            保存草稿箱
          </Button>
          <Button size="sm" onClick={handlePublish} disabled={isSubmitting}>
            {isSubmitting ? "发布中..." : "发布"}
          </Button>
        </div>
      </div>

      <main className="mx-auto max-w-[808px] px-6">
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {BOARDS.map((board) => (
              <Badge
                key={board.id}
                variant={selectedBoard?.id === board.id ? "default" : "secondary"}
                className="flex cursor-pointer items-center space-x-1 rounded-full px-3 py-1 hover:bg-primary/90"
                onClick={() => setSelectedBoard(board)}
              >
                <span>{board.icon}</span>
                <span>{board.name}</span>
              </Badge>
            ))}
          </div>
        </div>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入文章标题"
          className="mb-4 border-0 px-0 text-lg placeholder:text-gray-400 focus-visible:ring-0"
        />

        <MarkdownEditor
          value={content}
          onChange={setContent}
          onImageUpload={handleImageUpload}
          className="rounded-lg border"
        />
      </main>
    </div>
  );
}
