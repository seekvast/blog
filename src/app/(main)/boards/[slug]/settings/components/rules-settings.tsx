'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Board } from '@/types';

const formSchema = z.object({
  rules: z.array(z.object({
    id: z.number().optional(),
    title: z.string().min(1, "规则标题不能为空"),
    content: z.string().min(1, "规则内容不能为空"),
    order: z.number(),
  })),
});

interface RulesSettingsProps {
  board: Board;
}

export function RulesSettings({ board }: RulesSettingsProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rules: board.rules || [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await api.boards.updateRules({
        boardId: board.id,
        rules: values.rules,
      });

      toast({
        title: "规则更新成功",
        description: "",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失败",
        description: error instanceof Error ? error.message : "服务器错误，请稍后重试",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>规则设置</FormLabel>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const currentRules = form.getValues("rules");
                form.setValue("rules", [
                  ...currentRules,
                  {
                    title: "",
                    content: "",
                    order: currentRules.length + 1,
                  },
                ]);
              }}
            >
              新增规则
            </Button>
          </div>
          <div className="space-y-4">
            {form.watch("rules").map((rule, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">规则 #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const currentRules = form.getValues("rules");
                      form.setValue(
                        "rules",
                        currentRules.filter((_, i) => i !== index)
                      );
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    删除
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name={`rules.${index}.title`}
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
                  control={form.control}
                  name={`rules.${index}.content`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>规则内容</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="请输入规则内容"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`rules.${index}.order`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>规则顺序</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="请输入规则顺序"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
