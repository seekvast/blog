"use client";

import React, { useState, useEffect } from "react";
import { OperationLog } from "@/types/operation-log";
import { Pagination } from "@/types/common";
import { api } from "@/lib/api";
import { Board } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface OperationLogsProps {
  board: Board;
}

export function OperationLogs({ board }: OperationLogsProps) {
  const [data, setData] = useState<Pagination<OperationLog> | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{
    operator?: string;
    action?: string;
  }>({});
  const [operatorOptions, setOperatorOptions] = useState<string[]>([]);
  const [actionOptions, setActionOptions] = useState<string[]>([]);
  const { renderDescription } = useOperationLogRenderer();

  const fetchOperationLogs = async (
    page: number = 1,
    newFilters?: { operator?: string; action?: string }
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
              .filter(Boolean)
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
              handleFilterChange("operator", v === "__all__" ? undefined : v)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="以操作者筛选" />
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
            value={filters.action || "__all__"}
            onValueChange={(v) =>
              handleFilterChange("action", v === "__all__" ? undefined : v)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="操作类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">全部类型</SelectItem>
              {actionOptions.map((ac) => (
                <SelectItem key={ac} value={ac}>
                  {ac}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* 日志列表 */}
      <div className="space-y-0 divide-y  bg-background rounded-lg">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            加载中...
          </div>
        ) : data && data.items.length > 0 ? (
          data.items.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between py-4 px-4"
            >
              {/* 头像 */}
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 mt-1">
                  <AvatarImage
                    src={log.operator_user?.avatar_url || undefined}
                    alt={log.operator_user?.nickname || ""}
                  />
                  <AvatarFallback>
                    {log.operator_user?.nickname?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 min-w-0">
                    {/* 昵称高亮 */}
                    <span className="font-medium text-blue-700 mr-1 whitespace-nowrap">
                      {log.operator_user?.nickname}
                    </span>
                    {/* 操作内容（高亮对象） */}
                    <span className="text-base truncate min-w-0">
                      {renderDescription(log)}
                    </span>
                  </div>
                  {/* 详情/理由 */}
                  {log.ext?.reason && (
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      操作理由: {log.ext.reason}
                    </div>
                  )}
                </div>
              </div>
              {/* 时间 */}
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-4 mt-1">
                {formatDate(log.created_at, "YYYY年MM月DD日 HH:mm")}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            暂无操作记录
          </div>
        )}
      </div>
      {/* 分页（如有需要可加） */}
      {/* TODO: 分页控件 */}
    </div>
  );
}
