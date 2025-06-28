"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useDevice } from "@/hooks/use-device";
import { BoardSettingsFormValues, formSchema } from "./types";
import { Board } from "@/types";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormFields } from "./form-fields";
import { AvatarUpload } from "@/components/common/avatar-upload";
import { AttachmentType } from "@/constants/attachment-type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface BaseSettingsProps {
  board: Board;
  onSuccess?: () => void;
}

export function BaseSettings({ board, onSuccess }: BaseSettingsProps) {
  const { isMobile } = useDevice();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], error: categoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.common.categories(),
  });

  useEffect(() => {
    if (categoriesError) {
      toast({
        title: "错误",
        description: "获取看板类型失败",
        variant: "destructive",
      });
    }
  }, [categoriesError, toast]);

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
      question: board.question || "",
      answer: board.answer || "",
      category_id: board.category_id ?? 0,
      avatar: board.avatar,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: BoardSettingsFormValues) => {
      const updateData = { ...values, id: board.id };
      return api.boards.update(updateData);
    },
    onSuccess: () => {
      toast({
        description: "设置已保存",
      });
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["board", board.slug] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "保存失败",
        description: "更新设置失败，请重试",
      });
    },
  });

  const onSubmit = (values: BoardSettingsFormValues) => {
    mutate(values);
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={isMobile ? "space-y-6" : "space-y-8"}
        >
          {/* 看板头像 */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <AvatarUpload
                url={form.watch("avatar") ?? null}
                name={form.watch("name")}
                onRemove={() => form.setValue("avatar", "")}
                showDropdownMenu={true}
                size="sm"
                attachmentType={AttachmentType.BOARD_AVATAR}
                onUploadSuccess={(url) => {
                  form.setValue("avatar", url, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                }}
              />
              <div>
                <div className="font-medium">看板头像</div>
                <div className="text-sm text-muted-foreground">
                  点击更换看板头像
                </div>
              </div>
            </div>
          </div>

          {/* 表单字段 */}
          <FormFields
            form={form}
            categories={categories}
            variant={isMobile ? "mobile" : "desktop"}
          />

          {/* 提交按钮 */}
          <div className="flex justify-start space-x-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "保存中..." : "保存设置"}
            </Button>

            <Button variant="destructive" type="button">
              删除看板
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
