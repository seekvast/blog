"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Board, BoardChild } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

interface BoardChildSettingsProps {
  board: Board;
}

function ChildModal({
  open,
  onOpenChange,
  parentId,
  onSuccess,
  editingChild,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: number;
  onSuccess?: () => void;
  editingChild?: BoardChild;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const formSchema = z.object({
    name: z.string().min(1, "看板名称不能为空"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingChild?.name || "",
    },
  });

  React.useEffect(() => {
    if (editingChild) {
      form.reset({ name: editingChild.name });
    } else {
      form.reset({ name: "" });
    }
  }, [editingChild, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    // try {
      const saveData = {
        ...data,
        board_id: parentId,
        id: 0,
      };
      if (editingChild) {
        saveData.id = editingChild.id;
      }
        console.log(saveData)
      await api.boards.saveChild(saveData);
      toast({
        title: "成功",
        description: "保存成功",
      });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    // } catch (error) {
    //   console.error("Error saving subboard:", error);
    //   toast({
    //     title: "错误",
    //     description: editingChild ? "更新子版失败" : "创建子版失败",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingChild ? "编辑子版" : "新增子版"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>看板名称</FormLabel>
                  <FormControl>
                    <Input placeholder="输入看板名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? editingChild
                    ? "更新中..."
                    : "创建中..."
                  : editingChild
                  ? "更新"
                  : "创建"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function BoardChildSettings({ board }: BoardChildSettingsProps) {
  const [boardChildren, setBoardChildren] = React.useState<BoardChild[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingChild, setEditingChild] = React.useState<
    BoardChild | undefined
  >();
  const { toast } = useToast();

  // 获取子版列表
  const fetchBoardChildren = async () => {
    try {
      const data = await api.boards.getChildren(board.id);
      setBoardChildren(data.items);
    } catch (error) {
      console.error("Error fetching subboards:", error);
      toast({
        title: "错误",
        description: "获取子版列表失败",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    fetchBoardChildren();
  }, [board.id]);

  const handleEdit = (child: BoardChild) => {
    setEditingChild(child);
    setModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingChild(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">子版设置</h3>
        <Button
          size="sm"
          className="rounded-full"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          新增子版
        </Button>
      </div>

      <ChildModal
        open={modalOpen}
        onOpenChange={handleCloseModal}
        parentId={board.id}
        onSuccess={fetchBoardChildren}
        editingChild={editingChild}
      />

      <div className="">
        {boardChildren.map((child) => (
          <div
            key={child.id}
            className="flex items-center justify-between py-4 border-t bg-card"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h4 className="text-base font-medium truncate">{child.name}</h4>
              </div>
            </div>

            <div className="flex items-center text-gray-500">
              <button
                className="hover:text-primary"
                onClick={() => handleEdit(child)}
              >
                <Pencil className="mr-2 h-4 w-4" />
              </button>
              <button className="hover:text-primary">
                <Trash2 className="mr-2 h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {boardChildren.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">暂无子版</div>
        )}
      </div>
    </div>
  );
}
