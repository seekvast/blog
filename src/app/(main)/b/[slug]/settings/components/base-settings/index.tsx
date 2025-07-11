"use client";

import React, { useEffect, useState } from "react";
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
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
interface BaseSettingsProps {
  board: Board;
  onSuccess?: (data?: Board) => void;
}

export function BaseSettings({ board, onSuccess }: BaseSettingsProps) {
  const { isMobile } = useDevice();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const { mutate, isPending: isUpdatePending } = useMutation({
    mutationFn: (values: BoardSettingsFormValues) => {
      const updateData = { ...values, id: board.id };
      return api.boards.update(updateData);
    },
    onSuccess: (data) => {
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

  const { mutate: deleteBoard, isPending: isDeletePending } = useMutation({
    mutationFn: () => api.boards.delete(board.id),
    onSuccess: () => {
      setShowDeleteDialog(false);

      if (board.users_count <= 2000) {
        setTimeout(() => {
          router.push("/b");
        }, 2000);
      } else {
        // 对于大型看板，重新获取最新状态
        queryClient.invalidateQueries({ queryKey: ["board", board.slug] });
        onSuccess?.();
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "删除失败",
        description: "删除看板失败，请重试",
      });
      setShowDeleteDialog(false);
    },
  });

  const onSubmit = (values: BoardSettingsFormValues) => {
    mutate(values);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteBoard();
  };

  const { mutate: revokeDelete, isPending: isRevokeDeletePending } =
    useMutation({
      mutationFn: () => api.boards.revokeDelete(board.id),
      onSuccess: async () => {
        // 重新获取最新的 board 数据
        try {
          const updatedBoard = await api.boards.get({ slug: board.slug });
          queryClient.setQueryData(["board", board.slug], updatedBoard);
          onSuccess?.(updatedBoard);
        } catch (error) {
          // 如果获取失败，则使用缓存失效的方式
          queryClient.invalidateQueries({ queryKey: ["board", board.slug] });
          onSuccess?.();
        }
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "撤回失败",
          description: "撤回删除请求失败，请重试",
        });
      },
    });

  const handleRevoke = () => {
    revokeDelete();
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
            <Button type="submit" size="sm" disabled={isUpdatePending}>
              {isUpdatePending ? "保存中..." : "保存设置"}
            </Button>

            {board.scheduled_deleted_at &&
            new Date(board.scheduled_deleted_at) > new Date() ? (
              <Button
                size="sm"
                variant="secondary"
                type="button"
                onClick={handleRevoke}
                disabled={isUpdatePending || isRevokeDeletePending}
              >
                {isRevokeDeletePending ? "处理中..." : "撤回删除"}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                type="button"
                onClick={handleDelete}
                disabled={isUpdatePending || isDeletePending}
              >
                删除看板
              </Button>
            )}
          </div>
        </form>
      </Form>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="删除看板"
        description={
          board.users_count <= 2000
            ? "执行此操作后，你将无法恢复看板"
            : "执行此操作后，你有15天的反悔期，这期间你可以随时撤回删除请求"
        }
        confirmText="删除看板"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
        variant="destructive"
        loading={isDeletePending}
      />
    </div>
  );
}
