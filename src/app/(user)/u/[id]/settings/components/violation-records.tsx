"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { NotificationItem } from "@/components/notification/notification-item";
import { useNotifications } from "@/components/notification/notification-preview";
import { Notification } from "@/types";
import { api } from "@/lib/api";
import { Report } from "@/types/report";
import { ReportReason } from "@/constants/report-reason";

interface ViolationRecord {
  id: string;
  date: string;
  content: string;
  type: string;
  status: "pending" | "resolved" | "rejected";
}

export default function ViolationRecords({
  violationType,
}: {
  violationType: string;
}) {
  if (violationType === "account") {
    return <Account />;
  } else if (violationType === "board") {
    return <Board />;
  }

  // 默认返回 Account 组件
  return <Account />;
}

const Account = () => {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(false);
  const [page, setPage] = React.useState(1);

  // 获取违规记录
  const fetchReports = React.useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        const response = await api.reports.list({
          page: pageNum,
          per_page: 10,
        });

        if (pageNum === 1) {
          setReports(response.items);
        } else {
          setReports((prev) => [...prev, ...response.items]);
        }

        setHasMore(response.current_page < response.last_page);
        setPage(response.current_page);
      } catch (error) {
        console.error("获取违规记录失败", error);
      } finally {
        setLoading(false);
      }
    },
    [api.reports]
  );

  // 加载更多
  const loadMore = React.useCallback(() => {
    if (!loading && hasMore) {
      fetchReports(page + 1);
    }
  }, [loading, hasMore, page, fetchReports]);

  // 初始加载
  React.useEffect(() => {
    fetchReports(1);
  }, [fetchReports]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(date.getDate()).padStart(2, "0")}`;
  };

  const NOTICE_TEMPLATES = {
    delete_post:
      "您所發表的「{postTitle}」已被看板管理員已進行刪除。",
    delete_reply:
      "您於「{postTitle}」中發表的回覆已被看板管理員已進行刪除。",
    ban: "您已被看板管理員禁止發表與回覆，直到{days}天後解除。",
    block: "您已被看板管理員禁止加入，點此查看詳情。",
    kick: "您已被看板管理員取消成員資格。",
    default: "您已被看板「{boardName}」禁言",
  };

  const buildNotice = (
    type: string,
    report: Report
  ) => {
    const template = NOTICE_TEMPLATES[type] || NOTICE_TEMPLATES.default;
    return template
      .replace(/{boardName}/g, report.board?.name || "")
      .replace(/{postTitle}/g, report.discussion?.title || "")
    //   .replace(/{days}/g, report.days?.toString() || "");
  };

  return (
    <div className="space-y-4">
      {loading && reports.length === 0 ? (
        <div className="flex-1 flex items-center justify-center h-40">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex-1 flex items-center justify-center h-40">
          <p className="text-muted-foreground">暂无违规记录</p>
        </div>
      ) : (
        <InfiniteScroll
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          className="divide-y"
        >
          {reports.map((report) => {
            const notice = buildNotice(report.reason, report);
            return (
              <div
                key={report.id}
                className="flex items-start justify-between py-4"
              >
                <div className="flex-1 mr-4">
                  <div className="text-sm">{notice}</div>
                  <p className="text-sm text-gray-500">{report.reason_text}</p>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm text-gray-500">
                      {formatDate(report.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </InfiniteScroll>
      )}
    </div>
  );
};

const Board = () => {
  const {
    notifications,
    loading,
    hasMore,
    fetchNotifications,
    loadMore,
    markAsRead,
  } = useNotifications(false);

  React.useEffect(() => {
    fetchNotifications(1, { q: "board" });
  }, [fetchNotifications]);

  const handleNotificationClick = (notification: Notification) => {
    // 标记为已读
    markAsRead(notification.id);
  };
  return (
    <div className="space-y-4">
      <div className="flex-1 min-w-0 px-2 lg:px-4 overflow-hidden">
        {/* 通知列表 */}
        {loading && notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-40">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-40">
            <p className="text-muted-foreground">暂无通知</p>
          </div>
        ) : (
          <InfiniteScroll
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            className="divide-y divide-border"
          >
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};
