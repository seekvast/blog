import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useDevice } from "@/hooks/useDevice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Category } from "@/types";
import { AttachmentType } from "@/constants/attachment-type";
import { uploadFile } from "@/lib/utils/upload";
import { BaseSettingsProps, FormData, formSchema } from "./shared";

const DesktopBaseSettings = dynamic(() => import("./desktop").then(mod => mod.DesktopBaseSettings));
const MobileBaseSettings = dynamic(() => import("./mobile").then(mod => mod.MobileBaseSettings));

export function BaseSettings({ board, onSuccess }: BaseSettingsProps) {
  const { isMobile } = useDevice();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [boardImage, setBoardImage] = useState<string | null>(board.avatar || null);
  const [categories, setCategories] = useState<Category[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: board.name,
      slug: board.slug,
      desc: board.desc || "",
      badge_visible: board.badge_visible || [],
      is_nsfw: board.is_nsfw || 0,
      visibility: board.visibility || 0,
      poll_role: board.poll_role || [],
      approval_mode: board.approval_mode || 0,
      question: board.question || "",
      answer: board.answer || "",
      category_id: board.category_id || 0,
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.common.categories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "错误",
          description: "获取看板类型失败",
          variant: "destructive",
        });
      }
    };

    fetchCategories();
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);

    try {
      const data = await uploadFile(file, AttachmentType.BOARD_AVATAR);
      setBoardImage(data.url);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "上传失败",
        description: "图片上传失败，请重试",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      await api.boards.update({
        ...data,
        id: board.id,
        avatar: boardImage,
      });

      toast({
        title: "保存成功",
        description: "看板设置已更新",
      });

      if (onSuccess) {
        onSuccess();
      }

      router.refresh();
    } catch (error) {
      console.error("Error updating board:", error);
      toast({
        variant: "destructive",
        title: "保存失败",
        description: "更新看板设置失败，请重试",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 隐藏的文件输入框
  const hiddenFileInput = (
    <input
      type="file"
      ref={fileInputRef}
      className="hidden"
      accept="image/*"
      onChange={handleImageUpload}
    />
  );

  const sharedProps = {
    form,
    isSubmitting,
    boardImage,
    isUploading,
    categories,
    handleImageUpload,
    handleImageClick,
    onSubmit,
  };

  return (
    <>
      {hiddenFileInput}
      {isMobile ? (
        <MobileBaseSettings {...sharedProps} />
      ) : (
        <DesktopBaseSettings {...sharedProps} />
      )}
    </>
  );
}
