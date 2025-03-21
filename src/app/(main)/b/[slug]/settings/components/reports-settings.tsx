import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Board, Report } from "@/types";
import { ChevronDown, Search } from "lucide-react";
import Image from "next/image";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BoardUser } from "@/types";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { formatDate } from "@/lib/utils";
import { Pagination } from "@/types/common";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

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
      action: string;
    }) => {
      // 这里应该使用正确的 API 接口
      // 由于目前没有看到确切的 API，我们可以假设使用 POST 请求
      // 在实际开发中，需要替换为正确的 API 调用
      return await fetch(`/api/reports/${reportId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          board_id: board.id,
        }),
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
  const handleReportAction = (reportId: number, action: string) => {
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
                  {report.reason}
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
                  onClick={() => handleReportAction(report.id, "accept")}
                  disabled={
                    report.status !== 0 || processReportMutation.isPending
                  }
                >
                  接受
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7"
                  onClick={() => handleReportAction(report.id, "reject")}
                  disabled={
                    report.status !== 0 || processReportMutation.isPending
                  }
                >
                  驳回
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                查看详情
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
}
