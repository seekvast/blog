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
  moderationProcessSchema,
  type ModerationProcessSchema,
  ActionMode,
} from "@/validations/moderation";
import { ModerationAction } from "@/components/board/moderation-action";

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

  // 修改 mutation 定义
  const processReportMutation = useMutation({
    mutationFn: async ({
      reportId,
      data,
    }: {
      reportId: number;
      data: ModerationProcessSchema;
    }) => {
      return await api.reports.moderation({
        board_id: board.id,
        id: reportId,
        act_mode: data.act_mode,
        reason_desc: data.reason_desc,
        act_explain: data.act_explain,
        delete_range: data.delete_range,
        mute_day: data.mute_days,
      });
    },
    onSuccess: () => {
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
  };

  const handleProcess = (data: ModerationProcessSchema) => {
    if (!selectedReportId) return;
    processReportMutation.mutate({
      reportId: selectedReportId,
      data,
    });
    setIsProcessDialogOpen(false);
    setSelectedReportId(null);
  };

  // 恢复简单的撤销处理函数
  const handleRevoke = (reportId: number) => {
    processReportMutation.mutate({
      reportId,
      data: {
        act_mode: ActionMode.REVOKE,
        reason_desc: "",
        act_explain: "",
        delete_range: "none",
        mute_days: undefined,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* 筛选栏 */}
      <h3 className="text-lg font-medium">检举内容</h3>
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
                  {report.user?.nickname?.charAt(0).toUpperCase() || "U"}
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
                  onClick={() => handleRevoke(report.id)}
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
      <ModerationAction
        isOpen={isProcessDialogOpen}
        onOpenChange={setIsProcessDialogOpen}
        onProcess={handleProcess}
        isPending={processReportMutation.isPending}
        scene="report"
      />
    </div>
  );
}
