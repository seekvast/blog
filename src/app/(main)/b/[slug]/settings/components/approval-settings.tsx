"use client";

import React from "react";
import { Board } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { BoardHistory } from "@/types/board";
import { Pagination } from "@/types/common";
import { InfiniteScroll } from "@/components/common/infinite-scroll";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/search/search-input";
import { formatDate } from "@/lib/utils";

interface ApprovalSettingsProps {
  board: Board;
}

export function ApprovalSettings({ board }: ApprovalSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // 筛选条件
  const [filters, setFilters] = React.useState({
    apply_time: "",
    register_time: "",
    board_count: "",
    gender: "",
  });

  // 搜索关键词
  const [searchQuery, setSearchQuery] = React.useState("");

  // 使用 useInfiniteQuery 获取申请列表
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["board-applications", board.id, filters, searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await api.boards.getHistory({
          ...filters,
          status: 0,
          keyword: searchQuery,
          page: pageParam,
          per_page: 10,
        });
        return response;
      } catch (error) {
        console.error("Error loading applications:", error);
        toast({
          variant: "destructive",
          title: "加载失败",
          description: "无法加载申请列表，请重试",
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

  // 处理申请
  const handleApplication = async (applicationId: number, status: 1 | 2) => {
    try {
      await api.boards.approve({
        history_id: applicationId,
        status,
      });
      //使缓存失效
      queryClient.invalidateQueries({
        queryKey: ["board-applications", board.id, filters, searchQuery],
      });
      toast({
        title: status === 1 ? "已通过" : "已拒绝",
        description: "申请处理成功",
      });

      // 重新加载列表
      refetch();
    } catch (error) {
      console.error("Error handling application:", error);
      toast({
        variant: "destructive",
        title: "处理失败",
        description: "无法处理申请，请重试",
      });
    }
  };

  // 清空筛选条件
  const clearFilters = () => {
    setFilters({
      apply_time: "",
      register_time: "",
      board_count: "",
      gender: "",
    });
    setSearchQuery("");
  };

  // 加载更多
  const handleLoadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  // 从分页数据中提取所有申请项
  const applications = React.useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">成员审核</h3>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={() => {}} // 不需要额外搜索，useInfiniteQuery 会处理
          placeholder="依昵称或账号搜索"
          className="w-full md:w-auto"
        />
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-4">
        <Select
          value={filters.apply_time}
          onValueChange={(value) =>
            setFilters({ ...filters, apply_time: value })
          }
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="申请时间" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">今天</SelectItem>
            <SelectItem value="week">本周</SelectItem>
            <SelectItem value="month">本月</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.register_time}
          onValueChange={(value) =>
            setFilters({ ...filters, register_time: value })
          }
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="注册时间" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week" className="h-8">
              一周内
            </SelectItem>
            <SelectItem value="month" className="h-8">
              一个月内
            </SelectItem>
            <SelectItem value="year" className="h-8">
              一年内
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.board_count}
          onValueChange={(value) =>
            setFilters({ ...filters, board_count: value })
          }
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="加入看板数" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0" className="h-8">
              0个
            </SelectItem>
            <SelectItem value="1-5" className="h-8">
              1-5个
            </SelectItem>
            <SelectItem value="5+" className="h-8">
              5个以上
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.gender}
          onValueChange={(value) => setFilters({ ...filters, gender: value })}
        >
          <SelectTrigger className="w-24 h-8">
            <SelectValue placeholder="性别" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1" className="h-8">
              男
            </SelectItem>
            <SelectItem value="2" className="h-8">
              女
            </SelectItem>
            <SelectItem value="0" className="h-8">
              其他
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          size="sm"
          variant="outline"
          onClick={clearFilters}
          className="ml-auto"
        >
          清空筛选条件
        </Button>
      </div>

      {/* 申请列表 */}
      <InfiniteScroll
        loading={isLoading || isFetchingNextPage}
        hasMore={!!hasNextPage}
        onLoadMore={handleLoadMore}
        currentPage={data?.pageParams?.length || 1}
        disableInitialCheck={true}
      >
        {applications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无待审核的申请</div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={application.user?.avatar_url}
                        alt={application.user?.nickname}
                      />
                      <AvatarFallback>
                        {application.user?.nickname[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {application.user?.nickname}
                        <span className="ml-2 text-sm text-muted-foreground">
                          @{application.user?.username}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        注册时间：
                        {application.user?.created_at
                          ? formatDate(application.user.created_at)
                          : "-"}
                        <span className="mx-2">·</span>
                        申请时间：
                        {application.created_at
                          ? formatDate(application.created_at)
                          : "-"}
                      </div>
                      <div className="mt-2">
                        <div className="text-sm">
                          看板问题：{board.question}？
                        </div>
                        <div className="text-sm">
                          看板答案：{application.user_answer}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApplication(application.id, 1)}
                    >
                      通过
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplication(application.id, 2)}
                    >
                      拒绝
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
}
