"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReportForm } from "@/types/report";
import Image from "next/image";
import Link from "next/link";
import { Board } from "@/types/board";
import { ReportTarget } from "@/constants/report-target";
import { t } from "i18next";

const moderatorReportOptions = [
  { id: 8, label: "離題", description: "此內容與當前討論主題無關" },
  {
    id: 9,
    label: "不雅",
    description: "此內容包含攻擊性、侮辱性用語或違反了看板規則",
  },
  { id: 11, label: "垃圾", description: "這是廣告文章" },
  { id: 10, label: "違反其他看板規則或內容守則", description: "" },
];

const ADULT_CONTENT_OPTION_ID = 2;

const katerReportOptionsBase = [
  {
    id: 1,
    label: "垃圾訊息",
    description: "無用或無意義的資訊，通常是廣告或無意義重複內容",
  },
  {
    id: ADULT_CONTENT_OPTION_ID,
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
  { id: 6, label: "暴力或露骨", description: "暴力、露骨、血腥內容" },
  { id: 7, label: "仇恨言論", description: "煽動仇恨弱勢族群" },
  { id: 8, label: "跑题", description: "此內容與當前討論主題無關" },
  {
    id: 9,
    label: "不雅低俗",
    description: "此內容包含攻擊性、侮辱性用語或違反了看板規則",
  },
  { id: 10, label: "违规", description: "違反看板規則或內容守則" },
  { id: 11, label: "垃圾广告", description: "這是廣告文章" },
  { id: 12, label: "其他", description: "違反《內容守則》中的其他條款" },
];

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;

  form: ReportForm;
}

export function ReportDialog({
  open,
  onOpenChange,
  title,
  form,
}: ReportDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const boardQuery = useQuery<Board, Error>({
    queryKey: ["board", form.board_id],
    queryFn: () => api.boards.get({ id: form.board_id }),
    enabled: open && form.reported_to === "admin" && !!form.board_id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const reportOptions = useMemo(() => {
    if (form.reported_to === "moderator") {
      return moderatorReportOptions;
    }

    if (form.reported_to === "admin") {
      if (boardQuery.isLoading) {
        return [];
      }
      if (boardQuery.isError || !boardQuery.data) {
        return katerReportOptionsBase;
      }

      if (boardQuery.data.is_nsfw === 1) {
        return katerReportOptionsBase.filter(
          (option) => option.id !== ADULT_CONTENT_OPTION_ID
        );
      }
      return katerReportOptionsBase;
    }
    return [];
  }, [
    form.reported_to,
    boardQuery.data,
    boardQuery.isLoading,
    boardQuery.isError,
    boardQuery.error,
  ]);

  const [selectedReason, setSelectedReason] = useState<number | undefined>();
  const [otherReasonText, setOtherReasonText] = useState<string>("");

  useEffect(() => {
    if (open && !boardQuery.isLoading) {
      if (reportOptions.length > 0) {
        if (!reportOptions.some((opt) => opt.id === selectedReason)) {
          setSelectedReason(reportOptions[0].id);
        }
      } else {
        setSelectedReason(undefined);
      }
    } else if (!open) {
      setSelectedReason(undefined);
      setOtherReasonText("");
    }
  }, [open, reportOptions, selectedReason, boardQuery.isLoading]);

  const reportMutation = useMutation({
    mutationFn: async () => {
      if (selectedReason === undefined) {
        toast({
          title: t("report.error", "错误"),
          description: t("report.pleaseSelectReason", "请选择一个举报原因。"),
          variant: "default",
        });
        return Promise.reject(
          new Error(
            t("report.pleaseSelectReason", "请选择一个举报原因。") as string
          )
        );
      }
      if (selectedReason === 4) {
        window.open(
          "https://support.kater.me/docs/category/%E6%8F%90%E4%BA%A4%E7%94%B3%E8%A8%B4/",
          "_blank",
          "noopener,noreferrer"
        );
        return;
      }
      const reportData = {
        ...form,
        reason: selectedReason,
      };

      // 如果选择了"其他"选项且有输入文本，则添加到报告数据中
      if (selectedReason === 12 && otherReasonText.trim()) {
        reportData.user_desc = otherReasonText.trim();
      }

      return await api.reports.create(reportData);
    },
    onSuccess: () => {
      setShowSuccessDialog(true);
      onOpenChange(false);
    },
    onError: (error) => {
      if (
        (error as Error)?.message !==
        t("report.pleaseSelectReason", "请选择一个举报原因。")
      ) {
        toast({
          title: t("report.error", "错误"),
          description:
            error instanceof Error
              ? error.message
              : t("report.errorMessage", "提交失败，请稍后再试。"),
          variant: "default",
        });
      }
    },
  });

  const handleSubmit = () => {
    reportMutation.mutate();
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
  };

  const renderOptionsContent = () => {
    if (form.reported_to === "admin" && boardQuery.isLoading) {
      return (
        <div className="space-y-4 py-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="h-5 w-5 rounded-full mt-1" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (form.reported_to === "admin" && boardQuery.isError) {
      return (
        <div className="py-4 text-center text-destructive">
          {t(
            "report.errorLoadingBoardInfo",
            "加载看板信息失败，将显示默认举报选项。"
          )}
        </div>
      );
    }

    if (
      reportOptions.length === 0 &&
      (form.reported_to !== "admin" || !boardQuery.isLoading)
    ) {
      return (
        <div className="py-4 text-center text-muted-foreground">
          {t("report.noOptionsAvailable", "暂无举报选项。")}
        </div>
      );
    }

    return (
      <RadioGroup
        value={selectedReason?.toString()}
        onValueChange={(value) => setSelectedReason(Number(value))}
        className="space-y-4"
      >
        {reportOptions.map((option) => (
          <div key={option.id} className="flex items-start space-x-2">
            <RadioGroupItem
              value={option.id.toString()}
              id={`report-option-${option.id}`}
            />
            <div className="grid gap-1.5 leading-snug w-full">
              <Label
                htmlFor={`report-option-${option.id}`}
                className="font-medium"
              >
                {option.label}
              </Label>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
              {option.id === 12 && (
                <div className="mt-2 w-[90%]">
                  <Textarea
                    className="resize-none"
                    value={otherReasonText}
                    onChange={(e) =>
                      setOtherReasonText(e.target.value.slice(0, 150))
                    }
                    maxLength={150}
                    placeholder="最多150个字符"
                  />
                  <div className="mt-1 text-xs text-muted-foreground text-right">
                    {otherReasonText.length}/150
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          onOpenChange(isOpen);
        }}
      >
        <DialogContent className="max-h-[70vh] lg:max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </DialogHeader>
          <div className="py-4 overflow-y-auto flex-1 min-h-[100px]">
            {renderOptionsContent()}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-full"
              disabled={
                reportMutation.isPending ||
                selectedReason === undefined ||
                (form.reported_to === "admin" && boardQuery.isLoading) ||
                (reportOptions.length === 0 &&
                  (form.reported_to !== "admin" || !boardQuery.isLoading)) ||
                (selectedReason === 12 && otherReasonText.trim() === "")
              }
            >
              {reportMutation.isPending
                ? t("common.submitting", "提交中...")
                : t("report.submit", "提交举报")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 举报成功对话框 */}
      <Dialog open={showSuccessDialog} onOpenChange={handleCloseSuccessDialog}>
        <DialogContent className="max-w-md flex flex-col items-center text-center">
          <div className="flex justify-center w-full py-6">
            <Image
              src="/report.svg"
              alt="Report Success"
              width={240}
              height={240}
              priority
            />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl">感谢您的检举</DialogTitle>
            <DialogDescription className="mt-2">
              {form.reported_to === "moderator" ? (
                <p>如果看板管理人员确认已违反规范，将会进行处置</p>
              ) : (
                <p>
                  如果我们确认该内容确实违反
                  <Link href="/" className="text-primary hover:underline">
                    《内容守则》
                  </Link>
                  ,就会将其移除.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full mt-6">
            <Button className="w-full" onClick={handleCloseSuccessDialog}>
              我知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
