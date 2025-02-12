"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(1, "看板名称不能为空"),
});

interface CreateChildModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: number;
  onSuccess?: () => void;
}

export function CreateChildModal({
  open,
  onOpenChange,
  parentId,
  onSuccess,
}: CreateChildModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      await api.boards.createChild({
        ...data,
        board_id: parentId,
      });

      toast({
        title: "成功",
        description: "子版创建成功",
      });

      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating subboard:", error);
      toast({
        title: "错误",
        description: "创建子版失败",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增子版</DialogTitle>
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
                {isSubmitting ? "创建中..." : "创建"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
