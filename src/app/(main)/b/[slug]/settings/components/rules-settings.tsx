"use client";

import * as React from "react";
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
import { Board } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

const ruleSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "规则标题不能为空"),
  content: z.string().min(1, "规则内容不能为空"),
  order: z.number(),
});

const formSchema = z.object({
  rules: z.array(ruleSchema),
});

interface RulesSettingsProps {
  board: Board;
}

interface RuleFormData {
  id?: number;
  title: string;
  content: string;
  order: number;
}

export function RulesSettings({ board }: RulesSettingsProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<RuleFormData | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rules: board.rules || [],
    },
  });

  const ruleForm = useForm<z.infer<typeof ruleSchema>>({
    resolver: zodResolver(ruleSchema),
  });

  const { rules } = form.watch();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      await api.boards.update(board.id, values);
      toast({
        title: "更新成功",
        description: "规则设置已更新",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失败",
        description:
          error instanceof Error ? error.message : "服务器错误，请稍后重试",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleAddRule = () => {
    setEditingRule({
      title: "",
      content: "",
      order: rules.length,
    });
    ruleForm.reset({
      title: "",
      content: "",
      order: rules.length,
    });
    setModalOpen(true);
  };

  const handleEditRule = (rule: RuleFormData) => {
    setEditingRule(rule);
    ruleForm.reset(rule);
    setModalOpen(true);
  };

  const handleDeleteRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    // 更新顺序
    newRules.forEach((rule, i) => {
      rule.order = i;
    });
    form.setValue("rules", newRules);
  };

  const handleSaveRule = (data: z.infer<typeof ruleSchema>) => {
    const newRules = [...rules];
    if (editingRule?.id) {
      // 编辑现有规则
      const index = newRules.findIndex((r) => r.id === editingRule.id);
      if (index !== -1) {
        newRules[index] = { ...data, id: editingRule.id };
      }
    } else {
      // 添加新规则
      newRules.push(data);
    }
    // 更新顺序
    newRules.forEach((rule, i) => {
      rule.order = i;
    });
    form.setValue("rules", newRules);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">规则设置</h3>
            <Button
              type="button"
              size="sm"
              onClick={handleAddRule}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              添加规则
            </Button>
          </div>

          <div className="space-y-2">
            {rules.map((rule, index) => (
              <div
                key={rule.id || index}
                className="flex items-start justify-between p-4 rounded-lg bg-muted/50"
              >
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium">{rule.title}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {rule.content}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditRule(rule)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRule(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {rules.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                还没有添加任何规则
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存更改"}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRule?.id ? "编辑规则" : "添加规则"}
            </DialogTitle>
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
                      <Input placeholder="请输入规则标题" {...field} />
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
                        placeholder="请输入规则内容"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={ruleForm.control}
                name="order"
                render={({ field }) => (
                  <input type="hidden" {...field} />
                )}
              />

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
