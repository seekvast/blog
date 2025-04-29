"use client";

import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Board, BoardRule } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
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
  Active,
  Over,
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
import { cn } from "@/lib/utils";

const ruleSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "规则标题不能为空"),
  content: z.string().min(1, "规则内容不能为空"),
  sort: z.number(),
});

interface RulesSettingsProps {
  board: Board;
}

interface SortableRuleItemProps {
  rule: BoardRule;
  onEdit: (rule: BoardRule) => void;
  onDelete: (rule: BoardRule) => void;
  isActive: boolean;
}

function SortableRuleItem({
  rule,
  onEdit,
  onDelete,
  isActive,
}: SortableRuleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(rule);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(rule);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg  group transition-colors",
        (isDragging || isActive) && "bg-muted "
      )}
      {...attributes}
    >
      <div
        className="flex items-center cursor-move text-muted-foreground"
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1 min-h-[2rem] flex flex-col justify-center">
        <h4 className="font-bold leading-none mb-1">{rule.title}</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {rule.content}
        </p>
      </div>
      <div className="flex gap-3 items-center text-muted-foreground">
        <button className="cursor-pointer text-primary" onClick={handleEdit}>
          <Pencil className="h-4 w-4" />
        </button>
        <button
          className="cursor-pointer text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function RulesSettings({ board }: RulesSettingsProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<BoardRule | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deletingRule, setDeletingRule] = React.useState<BoardRule | null>(
    null
  );
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [activeId, setActiveId] = React.useState<number | null>(null);
  const { toast } = useToast();
  const [rules, setRules] = React.useState<BoardRule[]>([]);

  const BASE_SORT_GAP = 100; // 基础间隔值
  const MIN_GAP = 10; // 最小间隔，低于此值时触发重排序

  const recalculateSort = (items: BoardRule[]) => {
    return items.map((rule, index) => ({
      ...rule,
      sort: (items.length - index) * BASE_SORT_GAP,
    }));
  };

  useEffect(() => {
    if (!board) return;

    const fetchRules = async () => {
      try {
        const data = await api.boards.getRules({
          board_id: board.id,
        });
        setRules(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "获取数据失败",
          description:
            error instanceof Error ? error.message : "服务器错误，请稍后重试",
        });
      }
    };
    fetchRules();
  }, [board]);

  useEffect(() => {
    if (rules.length > 0) {
      const needsRecalculate = rules.some((rule, index) => {
        if (index === 0) return false;
        const gap = rule.sort - rules[index - 1].sort;
        return Math.abs(gap) < MIN_GAP;
      });

      if (needsRecalculate) {
        const sortedRules = recalculateSort([...rules]);
        setRules(sortedRules);
        Promise.all(
          sortedRules.map((rule) =>
            api.boards.saveRule({
              board_id: board.id,
              id: rule.id,
              sort: rule.sort,
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
  }, [rules, board.id]);

  const ruleForm = useForm<z.infer<typeof ruleSchema>>({
    resolver: zodResolver(ruleSchema),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px的移动距离才触发拖拽，防止误触
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 增加到250ms，确保移动端有足够时间区分点击和拖动
        tolerance: 5, // 允许5px的移动容差
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = rules.findIndex((rule) => rule.id === active.id);
    const newIndex = rules.findIndex((rule) => rule.id === over.id);

    const newRules = arrayMove(rules, oldIndex, newIndex);

    // 计算新的sort值
    let newSort: number;
    if (newIndex === 0) {
      // 移到最前面
      newSort = newRules[1].sort + BASE_SORT_GAP;
    } else if (newIndex === rules.length - 1) {
      // 移到最后面
      newSort = newRules[newIndex - 1].sort - BASE_SORT_GAP;
    } else if (oldIndex < newIndex) {
      // 向下移动，取目标位置前后两个规则的中间值
      newSort = Math.floor(
        (newRules[newIndex + 1].sort + newRules[newIndex - 1].sort) / 2
      );
    } else {
      // 向上移动，取目标位置和其前一个规则的中间值
      newSort = Math.floor(
        (newRules[newIndex - 1].sort + newRules[newIndex].sort) / 2
      );
    }

    const updatedRules = newRules.map((rule) =>
      rule.id === active.id ? { ...rule, sort: newSort } : rule
    );

    setRules(updatedRules);

    try {
      await api.boards.saveRule({
        board_id: board.id,
        id: active.id as number,
        sort: newSort,
      });

      toast({
        title: "成功",
        description: "规则排序已更新",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失败",
        description:
          error instanceof Error ? error.message : "服务器错误，请稍后重试",
      });
      setRules(rules);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleAddRule = () => {
    if (rules.length >= 25) {
      toast({
        variant: "destructive",
        description: "最多只能设置25条规则",
      });
      return;
    }
    const maxSort =
      rules.length > 0 ? Math.max(...rules.map((rule) => rule.sort)) : 0;
    ruleForm.reset({
      title: "",
      content: "",
      sort: maxSort + BASE_SORT_GAP,
    });
    setModalOpen(true);
  };

  const handleEditRule = (rule: BoardRule) => {
    setEditingRule(rule);
    ruleForm.reset(rule);
    setModalOpen(true);
  };

  const handleDeleteRule = (rule: BoardRule) => {
    setDeletingRule(rule);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setDeletingRule(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingRule) return;

    try {
      setIsDeleting(true);
      await api.boards.deleteRule({
        id: deletingRule.id,
      });

      const updatedRules = await api.boards.getRules({
        board_id: board.id,
      });
      setRules(updatedRules);
      setDeleteModalOpen(false);
      setDeletingRule(null);

      toast({
        title: "成功",
        description: "删除成功",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "删除失败",
        description:
          error instanceof Error ? error.message : "服务器错误，请稍后重试",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveRule = async (data: z.infer<typeof ruleSchema>) => {
    try {
      setIsSubmitting(true);
      const res = await api.boards.saveRule({
        board_id: board.id,
        title: data.title,
        content: data.content,
        ...(editingRule?.id ? { id: editingRule.id } : {}),
      });

      const updatedRules = await api.boards.getRules({
        board_id: board.id,
      });
      setRules(updatedRules);
      setModalOpen(false);

      toast({
        title: "成功",
        description: "保存成功",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "保存失败",
        description:
          error instanceof Error ? error.message : "服务器错误，请稍后重试",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">规则设置</h3>
        <Button
          type="button"
          size="sm"
          onClick={handleAddRule}
          className="rounded-full gap-1"
        >
          <Plus className="h-4 w-4" />
          添加规则
        </Button>
      </div>

      <div className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={rules.map((rule) => rule.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {rules.map((rule) => (
                <SortableRuleItem
                  key={rule.id}
                  rule={rule}
                  onEdit={handleEditRule}
                  onDelete={handleDeleteRule}
                  isActive={rule.id === activeId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {rules.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">暂无规则</div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRule ? "编辑规则" : "添加规则"}</DialogTitle>
          </DialogHeader>

          <Form {...ruleForm}>
            <form
              onSubmit={ruleForm.handleSubmit(handleSaveRule)}
              className="space-y-4"
            >
              <FormField
                control={ruleForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>规则标题</FormLabel>
                    <FormControl>
                      <Input placeholder="输入规则标题" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={ruleForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>规则内容</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="输入规则内容"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={ruleForm.control}
                name="sort"
                render={({ field }) => <input type="hidden" {...field} />}
              />

              <DialogFooter className="gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  disabled={isSubmitting}
                >
                  取消
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-1"
                >
                  {isSubmitting ? "保存中..." : "保存"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={handleCloseDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除确认</DialogTitle>
            <DialogDescription>
              确定要删除规则"{deletingRule?.title}"吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
