"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Board, BoardChild } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  GripVertical,
} from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
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
}

function SortableBoardChildItem({
  child,
  onEdit,
  onDelete,
  isActive,
}: SortableBoardChildItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: child.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(child);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(child);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-4 group transition-colors",
        isDragging || isActive
          ? "opacity-50 bg-muted/70 ring-2 ring-primary"
          : "hover:bg-muted/70",
        "touch-none"
      )}
      {...attributes}
    >
      <div
        className="flex items-center cursor-move text-muted-foreground"
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <span className="text-sm text-gray-600 truncate">{child.name}</span>
        </div>
      </div>

      <div className="flex gap-4 items-center text-gray-600">
        <Button variant="secondary" size="sm" className="rounded-full">
          隐藏
        </Button>
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

    try {
      const saveData = {
        ...data,
        board_id: parentId,
        id: editingChild?.id || 0,
      };
      await api.boards.saveChild(saveData);
      toast({
        title: "成功",
        description: "保存成功",
      });
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
  const { toast } = useToast();

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
          toast({
            variant: "destructive",
            title: "更新失败",
            description: "重新排序失败，请刷新页面重试",
          });
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

      toast({
        title: "成功",
        description: "子版排序已更新",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失败",
        description:
          error instanceof Error ? error.message : "服务器错误，请稍后重试",
      });
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
      toast({
        title: "成功",
        description: "子版删除成功",
      });
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
