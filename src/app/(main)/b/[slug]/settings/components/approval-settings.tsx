"use client";

import React from "react";
import { Board } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ApprovalSettingsProps {
  board: Board;
}

export function ApprovalSettings({ board }: ApprovalSettingsProps) {
  const [applications, setApplications] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  // 筛选条件
  const [filters, setFilters] = React.useState({
    applyTime: "",
    registerTime: "",
    boardCount: "",
    gender: "",
  });

  // 搜索关键词
  const [searchQuery, setSearchQuery] = React.useState("");

  // 加载申请列表
  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const response = await api.boards.get({
        params: {
          ...filters,
          q: searchQuery,
        },
      });
      setApplications([]);
    } catch (error) {
      console.error("Error loading applications:", error);
      toast({
        variant: "destructive",
        title: "加载失败",
        description: "无法加载申请列表，请重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadApplications();
  }, [board.id, filters, searchQuery]);

  // 处理申请
  const handleApplication = async (
    applicationId: number,
    status: "approve" | "reject"
  ) => {
    try {
      await api.boards.create({
        status,
      });

      toast({
        title: status === "approve" ? "已通过" : "已拒绝",
        description: "申请处理成功",
      });

      // 重新加载列表
      loadApplications();
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
      applyTime: "",
      registerTime: "",
      boardCount: "",
      gender: "",
    });
    setSearchQuery("");
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 搜索栏 */}
      <div className="flex justify-between items-center">
        <Input
          className="w-full md:w-64 h-8 bg-muted/50 rounded-full"
          placeholder="依昵称或账号搜索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-4">
        <Select
          value={filters.applyTime}
          onValueChange={(value) =>
            setFilters({ ...filters, applyTime: value })
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
          value={filters.registerTime}
          onValueChange={(value) =>
            setFilters({ ...filters, registerTime: value })
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
          value={filters.boardCount}
          onValueChange={(value) =>
            setFilters({ ...filters, boardCount: value })
          }
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="加入看板数" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0" className="h-8">0个</SelectItem>
            <SelectItem value="1-5" className="h-8">1-5个</SelectItem>
            <SelectItem value="5+" className="h-8">5个以上</SelectItem>
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
            <SelectItem value="male" className="h-8">男</SelectItem>
            <SelectItem value="female" className="h-8">女</SelectItem>
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
                      src={application.user.avatar}
                      alt={application.user.name}
                    />
                    <AvatarFallback>{application.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {application.user.name}
                      <span className="text-sm text-gray-500">
                        @{application.user.username}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      注册时间：
                      {new Date(
                        application.user.created_at
                      ).toLocaleDateString()}
                      <span className="mx-2">·</span>
                      申请时间：
                      {new Date(application.created_at).toLocaleDateString()}
                    </div>
                    {application.answer && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">申请答案：</span>
                        {application.answer}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApplication(application.id, "approve")}
                  >
                    通过
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApplication(application.id, "reject")}
                  >
                    拒绝
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
