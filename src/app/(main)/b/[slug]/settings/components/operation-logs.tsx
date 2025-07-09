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

interface OperationLogsProps {
  board: Board;
}

export function OperationLogs({ board }: OperationLogsProps) {
  const [data, setData] = useState<Pagination<OperationLog> | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{
    operator?: string;
    action?: string;
    category?: string;
  }>({});
  const [operatorOptions, setOperatorOptions] = useState<string[]>([]);
  const [actionOptions, setActionOptions] = useState<string[]>([]);
  const { renderDescription, getOperationType, renderTitle, renderContent } =
    useOperationLogRenderer();

  const fetchOperationLogs = async (
    page: number = 1,
    newFilters?: { operator?: string; action?: string; category?: string }
  ) => {
    setLoading(true);
    try {
      const response = await api.boards.operationLogs({
        board_id: board.id,
        page,
        per_page: 20,
        ...newFilters,
      });
      setData(response);
      // 自动收集操作者和操作类型选项
      if (response.items) {
        setOperatorOptions([
          ...new Set(
            response.items
              .map((item) => item.operator_user?.nickname)
              .filter((nickname): nickname is string => Boolean(nickname))
          ),
        ]);
        setActionOptions([
          ...new Set(response.items.map((item) => item.action).filter(Boolean)),
        ]);
      }
    } catch (error) {
      setData({
        code: 200,
        items: [],
        total: 0,
        per_page: 20,
        current_page: page,
        last_page: 1,
        message: "success",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationLogs(1, filters);
    // eslint-disable-next-line
  }, [board.id]);

  const handlePageChange = (page: number) => {
    fetchOperationLogs(page, filters);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    fetchOperationLogs(1, newFilters);
  };

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
          <h2 className="text-xl font-bold">审核记录</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.operator || "__all__"}
            onValueChange={(v) =>
              handleFilterChange("operator", v === "__all__" ? "" : v)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="操作者" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">全部操作者</SelectItem>
              {operatorOptions.map((op) => (
                <SelectItem key={op} value={op}>
                  {op}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.category || "__all__"}
            onValueChange={(v) =>
              handleFilterChange("category", v === "__all__" ? "" : v)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="操作分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">全部操作</SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* 日志列表 */}
      <div className="space-y-0 divide-y bg-background rounded-lg">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            加载中...
          </div>
        ) : data && data.items.length > 0 ? (
          data.items.map((log) => {
            const operationType = getOperationType(log);
            const hasContent = renderContent(log);

            return (
              <div key={log.id} className="flex items-start py-4 px-4">
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
                      <span className="text-gray-900">
                        {renderTitle(log)}
                      </span>

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
        ) : (
          <div className="text-center text-muted-foreground py-8">
            暂无操作记录
          </div>
        )}
      </div>
    </div>
  );
}
