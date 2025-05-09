import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { Board, Report } from "@/types";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BoardUser } from "@/types";
import { formatDate } from "@/lib/utils";
import { Pagination } from "@/types/common";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  reportProcessSchema,
  type ReportProcessSchema,
  ActionMode,
} from "@/validations/report-process";

interface ReportsSettingsProps {
  board: Board;
}

interface ReportParams {
  board_id: number;
  page: number;
  page_size: number;
  moderator_hashid?: string;
  start_date?: string;
  end_date?: string;
}

export function ReportsSettings({ board }: ReportsSettingsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [adminFilter, setAdminFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);

  const form = useForm<ReportProcessSchema>({
    resolver: zodResolver(reportProcessSchema),
    defaultValues: {
      act_mode: ActionMode.DELETE,
      act_explain: "",
      reason_desc: "",
      delete_range: "none",
    },
  });

  const { data: managersData } = useQuery<BoardUser[]>({
    queryKey: ["board-managers", board.id],
    queryFn: () => api.boards.getManagers({ board_id: board.id }),
  });

  const managers = managersData || [];

  // 获取检举列表数据
  const { data, isLoading } = useQuery<Pagination<Report>>({
    queryKey: [
      "board-reports",
      board.id,
      page,
      adminFilter,
      timeFilter,
      searchQuery,
    ],
    queryFn: async () => {
      // 构建查询参数
      const queryParams: ReportParams = {
        board_id: board.id,
        page,
        page_size: pageSize,
      };

      // 添加筛选条件
      if (adminFilter !== "all") {
        queryParams.moderator_hashid = adminFilter;
      }

      if (timeFilter !== "all") {
        const now = new Date();
        let startDate = new Date();

        if (timeFilter === "today") {
          startDate.setHours(0, 0, 0, 0);
        } else if (timeFilter === "week") {
          startDate.setDate(now.getDate() - 7);
        } else if (timeFilter === "month") {
          startDate.setMonth(now.getMonth() - 1);
        }

        queryParams.start_date = startDate.toISOString();
        queryParams.end_date = now.toISOString();
      }

      // 如果有搜索关键词
      if (searchQuery) {
        queryParams["keyword"] = searchQuery;
      }

      return await api.reports.list(queryParams);
    },
  });

  // 处理检举的变更通知
  const processReportMutation = useMutation({
    mutationFn: async ({
      reportId,
      action,
    }: {
      reportId: number;
      action: ActionMode;
    }) => {
      return await api.reports.process({
        board_id: board.id,
        id: reportId,
        act_mode: action,
        reason_desc: form.getValues("reason_desc"),
        act_explain: form.getValues("act_explain"),
        delete_range: form.getValues("delete_range"),
      });
    },
    onSuccess: () => {
      // 操作成功后刷新数据
      queryClient.invalidateQueries({
        queryKey: ["board-reports", board.id],
      });
      toast({
        title: "操作成功",
        description: "检举已处理",
      });
    },
    onError: (error) => {
      console.error("处理检举失败:", error);
      toast({
        title: "操作失败",
        description: "无法处理检举请求，请稍后再试",
        variant: "destructive",
      });
    },
  });

  // 处理检举操作
  const handleReportAction = (reportId: number, action: ActionMode) => {
    processReportMutation.mutate({ reportId, action });
  };

  // 加载更多数据
  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  // 重置筛选时重置页码
  useEffect(() => {
    setPage(1);
  }, [adminFilter, timeFilter, searchQuery]);

  // 计算是否还有更多数据
  const hasMore = data ? data.current_page < data.last_page : false;

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 搜索时会触发上面的useEffect，重置页码
  };

  // 获取目标类型名称
  const getTargetTypeName = (targetType: string) => {
    const typeMap: Record<string, string> = {
      discussion: "帖子",
      post: "回复",
      board: "看板",
      user: "用户",
    };
    return typeMap[targetType] || targetType;
  };

  const handleOpenProcessDialog = (reportId: number) => {
    setSelectedReportId(reportId);
    setIsProcessDialogOpen(true);
    form.reset();
  };

  const handleProcess = (data: ReportProcessSchema) => {
    if (!selectedReportId) return;
    handleReportAction(selectedReportId, data.act_mode);
    setIsProcessDialogOpen(false);
    setSelectedReportId(null);
  };

  return (
    <div className="space-y-4">
      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-4">
        <Select value={adminFilter} onValueChange={setAdminFilter}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="管理者筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部管理者</SelectItem>
            {managers.map((manager) => (
              <SelectItem
                key={manager.id}
                value={manager.user_hashid || `user-${manager.id}`}
              >
                {manager.user?.nickname ||
                  manager.user?.username ||
                  `管理员${manager.id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="操作时间" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部时间</SelectItem>
            <SelectItem value="today">今天</SelectItem>
            <SelectItem value="week">本周</SelectItem>
            <SelectItem value="month">本月</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 检举列表 */}
      <InfiniteScroll
        loading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        className="space-y-4"
        endMessage={
          <div className="text-center py-4 text-sm text-muted-foreground">
            没有更多检举记录
          </div>
        }
      >
        {data?.items.map((report) => (
          <div
            key={report.id}
            className="bg-muted/50 rounded-lg overflow-hidden"
          >
            <div className="flex items-start gap-3 p-4">
              <Avatar className="h-12 w-12">
                {report.user && (
                  <AvatarImage
                    src={report.user.avatar_url}
                    alt={report.user.nickname}
                  />
                )}
                <AvatarFallback>
                  {report.user?.nickname?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{report.discussion.title}</h4>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {report.reason_text}
                </p>
                <div className="mt-2 text-sm text-muted-foreground">
                  <div>检举人：{report.reporter?.username || "未知用户"}</div>
                  <div>检举时间：{formatDate(report.created_at)}</div>
                  <div>
                    状态：
                    {report.status === 0
                      ? "待处理"
                      : report.status === 1
                      ? "已处理"
                      : "已驳回"}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-2 bg-muted/70">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7"
                  onClick={() => handleOpenProcessDialog(report.id)}
                  disabled={
                    report.status !== 0 || processReportMutation.isPending
                  }
                >
                  处置
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7"
                  onClick={() =>
                    handleReportAction(report.id, ActionMode.REVOKE)
                  }
                  disabled={
                    report.status !== 0 || processReportMutation.isPending
                  }
                >
                  撤销
                </Button>
              </div>
            </div>
          </div>
        ))}
      </InfiniteScroll>
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
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
                onClick={() => setIsProcessDialogOpen(false)}
              >
                取消
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={processReportMutation.isPending}
              >
                处理
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
