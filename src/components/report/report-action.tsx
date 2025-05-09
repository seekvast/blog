import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  reportProcessSchema,
  type ReportProcessSchema,
  ActionMode,
} from "@/validations/report-process";

interface ReportActionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProcess: (data: ReportProcessSchema) => void;
  isPending: boolean;
}

export function ReportAction({
  isOpen,
  onOpenChange,
  onProcess,
  isPending,
}: ReportActionProps) {
  const form = useForm<ReportProcessSchema>({
    resolver: zodResolver(reportProcessSchema),
    defaultValues: {
      act_mode: ActionMode.DELETE,
      act_explain: "",
      reason_desc: "",
      delete_range: "none",
    },
  });

  const handleProcess = (data: ReportProcessSchema) => {
    onProcess(data);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={form.handleSubmit(handleProcess)}>
          <DialogHeader>
            <DialogTitle>处理方式</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <Label></Label>
              <RadioGroup
                value={String(form.watch("act_mode"))}
                onValueChange={(value) =>
                  form.setValue("act_mode", Number(value) as ActionMode)
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={String(ActionMode.DELETE)}
                    id="delete"
                  />
                  <Label htmlFor="delete">删除文章/回覆</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={String(ActionMode.KICK_OUT)}
                    id="kickout"
                  />
                  <Label htmlFor="kickout">踢出看板(可重複加入)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={String(ActionMode.BAN)} id="ban" />
                  <Label htmlFor="ban">封鎖</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={String(ActionMode.MUTE)} id="mute" />
                  <Label htmlFor="mute">禁言</Label>
                </div>
              </RadioGroup>
              {form.formState.errors.act_mode && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.act_mode.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>删除讯息历史</Label>
              <Select
                value={form.watch("delete_range")}
                onValueChange={(value: ReportProcessSchema["delete_range"]) =>
                  form.setValue("delete_range", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择删除历史时间范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">什麼都別刪除</SelectItem>
                  <SelectItem value="1h">刪除過去1小時</SelectItem>
                  <SelectItem value="6h">刪除過去6小時</SelectItem>
                  <SelectItem value="12h">刪除過去12小時</SelectItem>
                  <SelectItem value="24h">刪除過去24小時</SelectItem>
                  <SelectItem value="3d">刪除過去3天</SelectItem>
                  <SelectItem value="7d">刪除過去7天</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.delete_range && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.delete_range.message}
                </p>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                将删除过去该时间段内，看板內所發表的所有文章與回覆
              </div>
            </div>
            <div className="space-y-2">
              <Label>原因(用户可见)</Label>
              <textarea
                className="w-full min-h-[100px] p-2 border rounded-md"
                placeholder="请输入原因"
                {...form.register("reason_desc")}
              />
              {form.formState.errors.reason_desc && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.reason_desc.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>原因(仅看板管理员可见)</Label>
              <textarea
                className="w-full min-h-[100px] p-2 border rounded-md"
                placeholder="请输入原因"
                {...form.register("act_explain")}
              />
              {form.formState.errors.act_explain && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.act_explain.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
            >
              处理
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
