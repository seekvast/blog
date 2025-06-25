import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/search/search-input";
import { Board, BoardBlacklist } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { Pagination } from "@/types/common";
import { BoardUser } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
interface BlocklistSettingsProps {
  board: Board;
}

interface BlacklistParams {
  board_id: number;
  page: number;
  page_size: number;
  moderator_hashid?: string;
  start_date?: string;
  end_date?: string;
  keyword?: string;
}

export function BlocklistSettings({ board }: BlocklistSettingsProps) {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;
  const [adminFilter, setAdminFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();
  // 获取看板管理员列表
  const { data: managersData } = useQuery<BoardUser[]>({
    queryKey: ["board-managers", board.id],
    queryFn: () => api.boards.getManagers({ board_id: board.id }),
  });

  // 确保 managers 始终是数组类型
  const managers = managersData || [];

  // 获取封锁列表数据
  const { data, isLoading, refetch } = useQuery<Pagination<BoardBlacklist>>({
    queryKey: ["board-blacklist", board.id, page, adminFilter, timeFilter, searchQuery],
    queryFn: async () => {
      // 构建查询参数
      const queryParams: BlacklistParams = {
        board_id: board.id,
        page,
        page_size: pageSize,
        keyword: searchQuery,
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

      return await api.boards.getBlacklist(queryParams);
    },
  });

  // 处理解除封锁
  const handleUnblock = async (item: BoardBlacklist) => {
    try {
      await api.boards.moderation({
        board_id: board.id,
        user_hashid: item.user_hashid,
        action: 1,
      });
      // 刷新数据
      queryClient.invalidateQueries({
        queryKey: ["board-blacklist", board.id, page, adminFilter, timeFilter],
      });
    } catch (error) {
      console.error("解除封锁失败:", error);
    }
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">封锁名单</h3>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={setSearchQuery}
          placeholder="依昵称或账号搜索"
          className="w-full md:w-auto"
        />
      </div>
      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-4">
        <Select value={adminFilter} onValueChange={setAdminFilter}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="管理者筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部管理者</SelectItem>
            {/* 管理员选项 */}
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

      {/* 封锁列表 */}
      <InfiniteScroll
        loading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}

        endMessage={
          <div className="text-center py-4 text-sm text-muted-foreground">
            没有更多封锁用户
          </div>
        }
      >
        {data?.items.map((item: BoardBlacklist) => (
          <div
            key={item.id}
            className="flex items-start justify-between py-4 border-b last:border-b-0"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                {item.user && (
                  <AvatarImage
                    src={item.user.avatar_url}
                    alt={item.user.nickname}
                  />
                )}
                <AvatarFallback>
                  {item.user ? item.user.nickname.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="font-medium">
                  {item.user ? item.user.nickname : "用户已删除"}
                </div>
                <div className="text-sm text-muted-foreground">
                  @
                  {item.user
                    ? item.user.username || item.user.hashid
                    : item.user_hashid}
                </div>
                <div className="text-sm text-muted-foreground">
                  状态：永久封锁
                </div>
                <div className="text-sm text-muted-foreground">
                  原因：{item.act_explain || "-"}
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                variant="secondary"
                size="sm"
                className="h-7 whitespace-nowrap"
                onClick={() => item.user && handleUnblock(item)}
              >
                撤销
              </Button>
            </div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
}
