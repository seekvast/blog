"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Board, BoardChild } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

interface BoardChildSettingsProps {
  board: Board;
}

interface SortableBoardChildItemProps {
  child: BoardChild;
  onEdit: (child: BoardChild) => void;
  onDelete: (child: BoardChild) => void;
  isActive: boolean;
  onRefresh: () => void;
}

function SortableBoardChildItem({
  child,
  onEdit,
  onDelete,
  isActive,
  onRefresh,
}: SortableBoardChildItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: child.id });

  const handleEdit = () => {
    onEdit(child);
  };

  const handleDelete = () => {
    onDelete(child);
  };

  const handleHide = async () => {
    try {
      await api.boards.hiddenChild({
        child_id: child.id,
        operator: "board",
      });
      onRefresh();
    } catch (error) {
      console.error("隐藏子版块失败:", error);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "flex items-center gap-2 py-4 px-2 rounded-md",
        isActive && "bg-subtle"
      )}
    >
      <div
        className="flex items-center cursor-move text-muted-foreground"
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <span className="font-bold truncate">{child.name}</span>
        </div>
      </div>

      <div className="flex gap-4 items-center text-gray-600">
        <button
          className="text-xs px-2 py-1 rounded-full bg-gray-100"
          onClick={handleHide}
        >
          {child.is_hidden ? "取消隐藏" : "隐藏"}
        </button>
        <button className="text-primary" onClick={handleEdit}>
          <Pencil className="h-4 w-4" />
        </button>
        <button className="text-destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
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

  const formSchema = z.object({
    name: z.string().min(1, "看板名称不能为空"),
    is_default: z.boolean().optional(),
    is_hidden: z.boolean().optional(),
    moderator_only: z.boolean().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingChild?.name || "",
      is_default: editingChild?.is_default === 1,
      is_hidden: editingChild?.is_hidden === 1,
      moderator_only: editingChild?.moderator_only === 1,
    },
  });

  React.useEffect(() => {
    if (editingChild) {
      form.reset({
        name: editingChild.name,
        is_default: editingChild.is_default === 1,
        is_hidden: editingChild.is_hidden === 1,
        moderator_only: editingChild?.moderator_only === 1,
      });
    } else {
      form.reset({
        name: "",
        is_default: false,
        is_hidden: false,
        moderator_only: false,
      });
    }
  }, [editingChild, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const saveData = {
        ...data,
        board_id: parentId,
        id: editingChild?.id || 0,
        is_default: data.is_default ? 1 : 0,
        is_hidden: data.is_hidden ? 1 : 0,
        moderator_only: data.moderator_only ? 1 : 0,
      };
      await api.boards.saveChild(saveData);
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
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
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input placeholder="输入子板名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_default"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>默认子版</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_hidden"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>隐藏此子版所发表的文章</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="moderator_only"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>仅创建者或版主才能发表</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button size="sm" type="submit" disabled={isSubmitting}>
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
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [editingChild, setEditingChild] = React.useState<
    BoardChild | undefined
  >();
  const [deletingChild, setDeletingChild] = React.useState<
    BoardChild | undefined
  >();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [activeId, setActiveId] = React.useState<number | null>(null);

  const BASE_SORT_GAP = 100; // 基础间隔值
  const MIN_GAP = 10; // 最小间隔，低于此值时触发重排序

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 获取子版列表
  const fetchBoardChildren = async () => {
    try {
      const data = await api.boards.getChildren(board.id);
      setBoardChildren(data.items);
    } catch (error) {
      console.error("Error fetching subboards:", error);
    }
  };

  React.useEffect(() => {
    fetchBoardChildren();
  }, [board.id]);

  React.useEffect(() => {
    if (boardChildren.length > 0) {
      const needsRecalculate = boardChildren.some((child, index) => {
        if (index === 0) return false;
        const gap = child.sort - boardChildren[index - 1].sort;
        return Math.abs(gap) < MIN_GAP;
      });

      if (needsRecalculate) {
        const sortedChildren = recalculateSort([...boardChildren]);
        setBoardChildren(sortedChildren);
        Promise.all(
          sortedChildren.map((child) =>
            api.boards.saveChild({
              board_id: board.id,
              id: child.id,
              sort: child.sort,
            })
          )
        ).catch(() => {
          console.error("更新子版排序失败");
        });
      }
    }
  }, [boardChildren, board.id]);

  const recalculateSort = (items: BoardChild[]) => {
    return items.map((child, index) => ({
      ...child,
      sort: (items.length - index) * BASE_SORT_GAP,
    }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = boardChildren.findIndex((child) => child.id === active.id);
    const newIndex = boardChildren.findIndex((child) => child.id === over.id);

    const newBoardChildren = arrayMove(boardChildren, oldIndex, newIndex);

    // 计算新的sort值
    let newSort: number;
    if (newIndex === 0) {
      // 移到最前面
      newSort = newBoardChildren[1].sort + BASE_SORT_GAP;
    } else if (newIndex === boardChildren.length - 1) {
      // 移到最后面
      newSort = newBoardChildren[newIndex - 1].sort - BASE_SORT_GAP;
    } else if (oldIndex < newIndex) {
      // 向下移动，取目标位置前后两个子版的中间值
      newSort = Math.floor(
        (newBoardChildren[newIndex + 1].sort +
          newBoardChildren[newIndex - 1].sort) /
          2
      );
    } else {
      // 向上移动，取目标位置和其前一个子版的中间值
      newSort = Math.floor(
        (newBoardChildren[newIndex - 1].sort +
          newBoardChildren[newIndex].sort) /
          2
      );
    }

    const updatedBoardChildren = newBoardChildren.map((child) =>
      child.id === active.id ? { ...child, sort: newSort } : child
    );

    setBoardChildren(updatedBoardChildren);

    try {
      await api.boards.saveChild({
        board_id: board.id,
        id: active.id as number,
        sort: newSort,
      });
    } catch (error) {
      console.error("更新子版排序失败:", error);
      setBoardChildren(boardChildren);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleEdit = (child: BoardChild) => {
    setEditingChild(child);
    setModalOpen(true);
  };

  const handleDelete = (child: BoardChild) => {
    setDeletingChild(child);
    setDeleteModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingChild(undefined);
    }
  };

  const handleCloseDeleteModal = (open: boolean) => {
    if (!isDeleting) {
      setDeleteModalOpen(open);
      if (!open) {
        setDeletingChild(undefined);
      }
    }
  };

  const confirmDelete = async () => {
    if (!deletingChild) return;

    setIsDeleting(true);
    try {
      await api.boards.deleteChild({ id: deletingChild.id, boardId: board.id });
      setDeleteModalOpen(false);
      fetchBoardChildren();
    } catch (error) {
      throw error;
    } finally {
      setIsDeleting(false);
      setDeletingChild(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">子版设置</h3>
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

      <Dialog open={deleteModalOpen} onOpenChange={handleCloseDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除确认</DialogTitle>
            <DialogDescription>
              确定要删除子版"{deletingChild?.name}"吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={boardChildren.map((child) => child.id)}
            strategy={verticalListSortingStrategy}
          >
            {boardChildren.map((child) => (
              <SortableBoardChildItem
                key={child.id}
                child={child}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isActive={child.id === activeId}
                onRefresh={fetchBoardChildren}
              />
            ))}
          </SortableContext>
        </DndContext>

        {boardChildren.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">暂无子版</div>
        )}
      </div>
    </div>
  );
}
