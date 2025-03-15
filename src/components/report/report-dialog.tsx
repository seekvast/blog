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

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSubmit: (reason: string) => void;
  reportType: "admin" | "kater";
}

// 向管理员举报的选项
const adminReportOptions = [
  {
    id: "off_topic",
    label: "離題",
    description: "此內容與當前討論主題無關",
  },
  {
    id: "inappropriate",
    label: "不雅",
    description: "此內容包含攻擊性、侮辱性用語或違反了看板規則",
  },
  {
    id: "spam",
    label: "垃圾",
    description: "這是廣告文章",
  },
  {
    id: "other",
    label: "違反其他看板規則或內容守則",
    description: "",
  },
];

// 向 Kater 举报的选项
const katerReportOptions = [
  {
    id: "spam",
    label: "垃圾訊息",
    description: "無用或無意義的資訊，通常是廣告或無意義重複內容",
  },
  {
    id: "adult",
    label: "成人內容",
    description: "含有猥褻文字、圖像或其他成人內容",
  },
  {
    id: "hate",
    label: "仇恨言論",
    description: "煽動仇恨弱勢族群",
  },
  {
    id: "harassment",
    label: "騷擾或霸凌",
    description: "長時間騷擾、或長時間對其羞辱或攻擊",
  },
  {
    id: "violence",
    label: "暴力或露骨",
    description: "暴力、露骨、血腥內容",
  },
  {
    id: "illegal",
    label: "非法活動或管制物品",
    description: "宣揚犯罪活動、販售毒品和管制物品，或其他非法內容",
  },
  {
    id: "rights",
    label: "侵犯我的權力或隱私權",
    description: "這侵犯了我的版權、隱私權或其他法律申訴",
  },
  {
    id: "other",
    label: "其他",
    description: "違反《內容守則》中的其他條款",
  },
];

export function ReportDialog({
  open,
  onOpenChange,
  title,
  onSubmit,
  reportType = "admin",
}: ReportDialogProps) {
  // 根据举报类型选择选项列表
  const reportOptions = reportType === "admin" ? adminReportOptions : katerReportOptions;
  
  // 设置默认选中的选项为第一个选项
  const [selectedReason, setSelectedReason] = useState<string>(reportOptions[0].id);

  const handleSubmit = () => {
    onSubmit(selectedReason);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedReason}
            onValueChange={setSelectedReason}
            className="space-y-4"
          >
            {reportOptions.map((option) => (
              <div key={option.id} className="flex items-start space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <div className="grid gap-1.5">
                  <Label htmlFor={option.id} className="font-medium">
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
          >
            檢舉
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
