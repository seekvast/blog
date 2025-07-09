"use client";

import { OperationLog } from "@/types/operation-log";
import { OperationLogItem } from "./operation-log-item";
import { Pagination } from "@/types/common";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  OPERATION_ACTIONS,
  OPERATION_CATEGORIES,
  OPERATION_ACTION_MAPPING,
  OPERATION_CATEGORY_MAPPING,
} from "@/constants/operation-log";

interface OperationLogListProps {
  data: Pagination<OperationLog>;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: OperationLogFilters) => void;
  loading?: boolean;
}

export interface OperationLogFilters {
  action?: string;
  category?: string;
  operator_id?: number;
  user_id?: number;
}

export function OperationLogList({
  data,
  onPageChange,
  onFilterChange,
  loading = false,
}: OperationLogListProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<OperationLogFilters>({});

  const handleFilterChange = (
    key: keyof OperationLogFilters,
    value: string | number
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const actionOptions = Object.entries(OPERATION_ACTION_MAPPING).map(
    ([key, label]) => ({
      value: key,
      label,
    })
  );

  const categoryOptions = Object.entries(OPERATION_CATEGORY_MAPPING).map(
    ([key, label]) => ({
      value: key,
      label,
    })
  );

  return (
    <div className="space-y-6">
      {/* 过滤器 */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">
            操作类型：
          </label>
          <Select
            value={filters.action || ""}
            onValueChange={(value) => handleFilterChange("action", value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="全部操作" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部操作</SelectItem>
              {actionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">
            操作分类：
          </label>
          <Select
            value={filters.category || ""}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="全部分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部分类</SelectItem>
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
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : data.items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">暂无操作日志</p>
          </div>
        ) : (
          <>
            {data.items.map((operationLog) => (
              <OperationLogItem
                key={operationLog.id}
                operationLog={operationLog}
              />
            ))}
          </>
        )}
      </div>

      {/* 分页 */}
      {data.items.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            显示 {(data.current_page - 1) * data.per_page + 1} -{" "}
            {Math.min(data.current_page * data.per_page, data.total)} 条，共{" "}
            {data.total} 条
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.current_page <= 1}
              onClick={() => onPageChange?.(data.current_page - 1)}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.current_page >= data.last_page}
              onClick={() => onPageChange?.(data.current_page + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
