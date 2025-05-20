"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { MobileBaseSettings } from "./mobile";
import { DesktopBaseSettings } from "./desktop";
import { useDevice } from "@/hooks/use-device";
import { BoardSettingsFormValues, formSchema } from "./shared";
import { Category, Board } from "@/types";

interface BaseSettingsProps {
  board: Board;
  onSuccess?: () => void;
}

export function BaseSettings({ board, onSuccess }: BaseSettingsProps) {
  const { isMobile } = useDevice();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<BoardSettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: board.name,
      slug: board.slug,
      desc: board.desc || "",
      badge_visible: board.badge_visible || [],
      is_nsfw: board.is_nsfw ?? 0,
      visibility: board.visibility ?? 0,
      poll_role: board.poll_role || [],
      approval_mode: board.approval_mode ?? 0,
      question: board.desc || "",
      answer: board.answer || "",
      category_id: board.category_id ?? 0,
      avatar: board.avatar,
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

  const onSubmit = async (values: BoardSettingsFormValues) => {
    setIsSubmitting(true);
    try {
      const updateData = {
        ...values,
        id: board.id,
      };
      await api.boards.update(updateData);
      toast({
        description: "设置已保存",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "保存失败",
        description: "更新设置失败，请重试",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const props = {
    form,
    isSubmitting,
    categories,
    onSubmit,
  };

  return isMobile ? (
    <MobileBaseSettings {...props} />
  ) : (
    <DesktopBaseSettings {...props} />
  );
}
