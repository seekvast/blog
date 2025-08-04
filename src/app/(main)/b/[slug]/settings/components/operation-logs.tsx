"use client";

import React, { useState, useEffect } from "react";
import { OperationLog } from "@/types/operation-log";
import { Pagination } from "@/types/common";
import { api } from "@/lib/api";
import { Board } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useOperationLogRenderer } from "@/hooks/use-operation-log-renderer";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dayjs";
import {
  OPERATION_CATEGORY_MAPPING,
  OPERATION_ACTION_MAPPING,
} from "@/constants/operation-log";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { useToast } from "@/components/ui/use-toast";

interface OperationLogsProps {
  board: Board;
}

export function OperationLogs({ board }: OperationLogsProps) {
  const [filters, setFilters] = useState<{
    operator?: string;
    action?: string;
    category?: string;
  }>({});
  const [operatorOptions, setOperatorOptions] = useState<string[]>([]);
  const [actionOptions, setActionOptions] = useState<string[]>([]);
  const { renderDescription, getOperationType, renderTitle, renderContent } =
    useOperationLogRenderer();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 使用 useInfiniteQuery 替代原来的 fetchOperationLogs
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["operation-logs", board.id, filters],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await api.boards.operationLogs({
          board_id: board.id,
          page: pageParam,
          per_page: 10,
          ...filters,
        });

        // 更新操作者和操作类型选项（仅在第一页时）
        if (pageParam === 1 && response.items) {
          setOperatorOptions([
            ...new Set(
              response.items
                .map((item) => item.operator_user?.nickname)
                .filter((nickname): nickname is string => Boolean(nickname))
            ),
          ]);
          setActionOptions([
            ...new Set(
              response.items
                .map((item) => item.action)
                .filter((action): action is string => Boolean(action))
            ),
          ]);
        }

        return response;
      } catch (error) {
        console.error("Error loading operation logs:", error);
        toast({
          variant: "destructive",
          title: "加载失败",
          description: "无法加载操作日志，请重试",
        });
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
  };

  // 加载更多
  const handleLoadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  // 从分页数据中提取所有操作日志
  const operationLogs = React.useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  // 获取操作分类的颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case "discussion":
      case "post":
        return "bg-red-100 text-red-800";
      case "user":
        return "bg-orange-100 text-orange-800";
      case "board":
        return "bg-green-100 text-green-800";
      case "board_child":
        return "bg-purple-100 text-purple-800";
      case "board_rule":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 获取操作分类的标签文本
  const getTypeLabel = (type: string) => {
    return (
      OPERATION_CATEGORY_MAPPING[
        type as keyof typeof OPERATION_CATEGORY_MAPPING
      ] || "其他操作"
    );
  };

  // 生成分类筛选选项
  const categoryOptions = Object.entries(OPERATION_CATEGORY_MAPPING).map(
    ([key, label]) => ({
      value: key,
      label,
    })
  );

  return (
    <div className="space-y-6">
      {/* 标题和筛选器 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
        <h3 className="text-lg font-medium">审核记录</h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.operator || ""}
            onValueChange={(v) => handleFilterChange("operator", v)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="全部操作者" />
            </SelectTrigger>
            <SelectContent>
              {operatorOptions.map((op) => (
                <SelectItem key={op} value={op}>
                  {op}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.category || ""}
            onValueChange={(v) => handleFilterChange("category", v)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="全部操作" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 无限滚动的日志列表 */}
      <InfiniteScroll
        loading={isLoading || isFetchingNextPage}
        hasMore={!!hasNextPage}
        onLoadMore={handleLoadMore}
        className="space-y-0 divide-y bg-background rounded-lg"
      >
        {operationLogs.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">暂无数据</div>
        ) : (
          operationLogs.map((log) => {
            const operationType = getOperationType(log);
            const hasContent = renderContent(log);

            return (
              <div key={log.id} className="flex items-start py-4 px-2">
                {/* 左侧：头像和内容 */}
                <div
                  className={cn(
                    "flex gap-3 flex-1",
                    hasContent ? "items-start" : "items-center"
                  )}
                >
                  <Avatar className="h-10 w-10 mt-1">
                    <AvatarImage
                      src={log.operator_user?.avatar_url || ""}
                      alt={log.operator_user?.nickname || ""}
                    />
                    <AvatarFallback>
                      {log.operator_user?.nickname?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">{renderTitle(log)}</span>

                      <Badge
                        className={cn(
                          getTypeColor(operationType),
                          "text-xs px-2 py-0.5"
                        )}
                      >
                        {getTypeLabel(operationType)}
                      </Badge>
                    </div>

                    {hasContent && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {renderContent(log)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={cn("ml-4", hasContent ? "mt-1" : "mt-0")}>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </InfiniteScroll>
    </div>
  );
}
