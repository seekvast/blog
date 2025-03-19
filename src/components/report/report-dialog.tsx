"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { ReportForm } from "@/types/report";
interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  form: ReportForm;
}

// 向管理员举报的选项
const adminReportOptions = [
  {
    id: 8,
    label: "離題",
    description: "此內容與當前討論主題無關",
  },
  {
    id: 9,
    label: "不雅",
    description: "此內容包含攻擊性、侮辱性用語或違反了看板規則",
  },
  {
    id: 11,
    label: "垃圾",
    description: "這是廣告文章",
  },
  {
    id: 10,
    label: "違反其他看板規則或內容守則",
    description: "",
  },
];

// 向 Kater 举报的选项
const katerReportOptions = [
  {
    id: 1,
    label: "垃圾訊息",
    description: "無用或無意義的資訊，通常是廣告或無意義重複內容",
  },
  {
    id: 2,
    label: "成人內容",
    description: "含有猥褻文字、圖像或其他成人內容",
  },
  {
    id: 3,
    label: "騷擾或霸凌",
    description: "長時間騷擾、或長時間對其羞辱或攻擊",
  },
  {
    id: 4,
    label: "侵犯我的權力或隱私權",
    description: "這侵犯了我的版權、隱私權或其他法律申訴",
  },
  {
    id: 5,
    label: "非法活動或管制物品",
    description: "宣揚犯罪活動、販售毒品和管制物品，或其他非法內容",
  },
  {
    id: 6,
    label: "暴力或露骨",
    description: "暴力、露骨、血腥內容",
  },
  {
    id: 7,
    label: "仇恨言論",
    description: "煽動仇恨弱勢族群",
  },
  {
    id: 8,
    label: "跑题",
    description: "此內容與當前討論主題無關",
  },
  {
    id: 9,
    label: "不雅低俗",
    description: "此內容包含攻擊性、侮辱性用語或違反了看板規則",
  },
  {
    id: 10,
    label: "违规",
    description: "違反看板規則或內容守則",
  },
  {
    id: 11,
    label: "垃圾广告",
    description: "這是廣告文章",
  },
  {
    id: 12,
    label: "其他",
    description: "違反《內容守則》中的其他條款",
  },
];

export function ReportDialog({
  open,
  onOpenChange,
  title,
  form,
}: ReportDialogProps) {
  const { toast } = useToast();
  const { t } = useTranslation();

  // 根据举报类型选择选项列表
  const reportOptions =
    form.reported_to === "admin" ? adminReportOptions : katerReportOptions;

  // 设置默认选中的选项为第一个选项
  const [selectedReason, setSelectedReason] = useState<number>(
    reportOptions[0].id
  );

  // 举报 mutation
  const reportMutation = useMutation({
    mutationFn: async () => {
      return await api.reports.create({
        user_hashid: form.user_hashid,
        board_id: form.board_id,
        discussion_slug: form.discussion_slug,
        post_id: form.post_id,
        reported_to: form.reported_to,
        reason: selectedReason,
        target: form.target,
      });
    },
    onSuccess: () => {
      toast({
        title: t("report.success"),
        description: t("report.successMessage"),
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: t("report.error"),
        description:
          error instanceof Error ? error.message : t("report.errorMessage"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    reportMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[60vh] lg:max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 overflow-y-auto flex-1">
          <RadioGroup
            value={selectedReason.toString()}
            onValueChange={(value) => setSelectedReason(Number(value))}
            className="space-y-4"
          >
            {reportOptions.map((option) => (
              <div key={option.id} className="flex items-start space-x-2">
                <RadioGroupItem
                  value={option.id.toString()}
                  id={option.id.toString()}
                />
                <div className="grid gap-1.5">
                  <Label htmlFor={option.id.toString()} className="font-medium">
                    {option.label}
                  </Label>
                  {option.description && (
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-full"
            disabled={reportMutation.isPending}
          >
            {reportMutation.isPending
              ? t("common.submitting")
              : t("report.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
