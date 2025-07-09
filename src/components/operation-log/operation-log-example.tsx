"use client";

import { useState, useEffect } from "react";
import { OperationLogList, OperationLogFilters } from "./operation-log-list";
import { OperationLog } from "@/types/operation-log";
import { Pagination } from "@/types/common";
import { createApi } from "@/lib/api/factory";

// 示例数据 - 严格按照模板定义
const mockOperationLogs: OperationLog[] = [
  {
    id: 1,
    operator_id: 1,
    user_id: 2,
    target_id: 1,
    target_entity: "discussion",
    operator: "moderator",
    user_hashid: "user123",
    category: "discussion",
    action: "delete",
    ip_address: "192.168.1.1",
    data: '{"username": "用户A", "title": "违规帖子标题"}',
    desc: "管理员删除了用户A所发表的违规帖子标题",
    ext: {
      username: "用户A",
      title: "违规帖子标题",
      user_hashid: "user123",
    },
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    deleted_at: null,
    operator_user: {
      hashid: "admin123",
      nickname: "管理员A",
      avatar_url: "https://example.com/avatar.jpg",
    },
    user: {
      hashid: "user123",
      nickname: "用户A",
      avatar_url: "https://example.com/user-avatar.jpg",
    },
  },
  {
    id: 2,
    operator_id: 1,
    user_id: 3,
    target_id: 2,
    target_entity: "post",
    operator: "moderator",
    user_hashid: "user456",
    category: "post",
    action: "delete",
    ip_address: "192.168.1.1",
    data: '{"username": "用户B", "title": "违规帖子标题"}',
    desc: "管理员删除了用户B在违规帖子标题的回覆",
    ext: {
      username: "用户B",
      title: "违规帖子标题",
      user_hashid: "user456",
    },
    created_at: "2024-01-15T09:15:00Z",
    updated_at: "2024-01-15T09:15:00Z",
    deleted_at: null,
    operator_user: {
      hashid: "admin123",
      nickname: "管理员B",
      avatar_url: "https://example.com/avatar.jpg",
    },
    user: {
      hashid: "user456",
      nickname: "用户B",
      avatar_url: "https://example.com/user-avatar2.jpg",
    },
  },
  {
    id: 3,
    operator_id: 1,
    user_id: 4,
    target_id: 3,
    target_entity: "user",
    operator: "moderator",
    user_hashid: "user789",
    category: "user",
    action: "approve",
    ip_address: "192.168.1.1",
    data: '{"username": "用户C", "new_value": "批准"}',
    desc: "管理员批准了用户C",
    ext: {
      username: "用户C",
      new_value: "批准",
      user_hashid: "user789",
    },
    created_at: "2024-01-15T08:45:00Z",
    updated_at: "2024-01-15T08:45:00Z",
    deleted_at: null,
    operator_user: {
      hashid: "admin123",
      nickname: "管理员C",
      avatar_url: "https://example.com/avatar.jpg",
    },
    user: {
      hashid: "user789",
      nickname: "用户C",
      avatar_url: "https://example.com/user-avatar3.jpg",
    },
  },
  {
    id: 4,
    operator_id: 1,
    user_id: 5,
    target_id: 4,
    target_entity: "user",
    operator: "moderator",
    user_hashid: "user101",
    category: "user",
    action: "mute",
    ip_address: "192.168.1.1",
    data: '{"username": "用户D", "days": 7}',
    desc: "管理员禁言用户D 7天",
    ext: {
      username: "用户D",
      days: 7,
      user_hashid: "user101",
    },
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2024-01-15T08:00:00Z",
    deleted_at: null,
    operator_user: {
      hashid: "admin123",
      nickname: "管理员D",
      avatar_url: "https://example.com/avatar.jpg",
    },
    user: {
      hashid: "user101",
      nickname: "用户D",
      avatar_url: "https://example.com/user-avatar4.jpg",
    },
  },
  {
    id: 5,
    operator_id: 1,
    user_id: 6,
    target_id: 5,
    target_entity: "board_child",
    operator: "moderator",
    user_hashid: null,
    category: "board_child",
    action: "create",
    ip_address: "192.168.1.1",
    data: '{"name": "新子版"}',
    desc: "管理员新增新子版",
    ext: {
      name: "新子版",
    },
    created_at: "2024-01-15T07:30:00Z",
    updated_at: "2024-01-15T07:30:00Z",
    deleted_at: null,
    operator_user: {
      hashid: "admin123",
      nickname: "管理员E",
      avatar_url: "https://example.com/avatar.jpg",
    },
    user: null,
  },
];

const mockPagination: Pagination<OperationLog> = {
  code: 200,
  items: mockOperationLogs,
  total: 5,
  per_page: 10,
  current_page: 1,
  last_page: 1,
  message: "success",
};

export function OperationLogExample() {
  const [data, setData] = useState<Pagination<OperationLog>>(mockPagination);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<OperationLogFilters>({});

  const handlePageChange = (page: number) => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setData({
        ...data,
        current_page: page,
      });
      setLoading(false);
    }, 500);
  };

  const handleFilterChange = (newFilters: OperationLogFilters) => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      // 这里可以根据过滤器重新获取数据
      console.log("应用过滤器:", newFilters);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">操作日志</h1>
        <p className="text-gray-600">查看系统中的所有操作记录</p>
      </div>

      <OperationLogList
        data={data}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        loading={loading}
      />
    </div>
  );
}
