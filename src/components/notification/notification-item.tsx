"use client";

import * as React from "react";
import Link from "next/link";
import { fromNow } from "@/lib/dayjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Notification } from "@/types";
import { useNotificationRenderer } from "@/hooks/use-notification-renderer";
import { getNotificationLink } from "@/lib/utils/notification";

export type NotificationType =
  | "discussionRenamed"
  | "userSuspended"
  | "userUnsuspended"
  | "newPost"
  | "replied"
  | "upVoted"
  | "downVoted"
  | "postMentioned"
  | "userMentioned"
  | "groupMentioned"
  | "discussionLocked"
  | "postLiked";

interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
  className?: string;
}

// 旧的消息构建函数，保留作为备用
export function buildMessage(notification: Notification) {
  switch (notification.type) {
    case "upVoted":
      return notification.from_user.username + " 對你的文章按了推";
    case "downVoted":
      return notification.from_user.username + " 對你的文章按了嘘";
    case "newPost":
      return notification.from_user.username + " 回覆了你發表的文章";
    case "replied":
      return notification.from_user.username + " 回覆了你的評論";
    case "postLiked":
      return notification.from_user.username + " 對你的文章按了推";
    default:
      return "";
  }
}

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const isUnread = !notification.read_at;
  const { renderContent, renderTitle, isTemplatesLoaded } =
    useNotificationRenderer();

  // 如果模板已加载，使用模板渲染，否则使用备用方法
  const message = isTemplatesLoaded
    ? renderContent(notification)
    : buildMessage(notification);

  const title = isTemplatesLoaded
    ? renderTitle(notification)
    : notification.discussion
    ? notification.discussion.title
    : `通知 #${notification.id}`;

  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  return (
    <div
      className={cn("flex items-center gap-2 py-4 px-2")}
      onClick={handleClick}
    >
      <Link
        href={`/u/${notification.from_user.username}?hashid=${notification.from_user.hashid}`}
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage
            src={notification.from_user.avatar_url}
            alt={notification.from_user.username}
          />
          <AvatarFallback>
            {notification.from_user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center gap-2">
          <Link
            href={getNotificationLink(notification)}
            className=" text-base font-medium"
          >
            {title}
          </Link>
          <span className="text-xs text-muted-foreground">
            {fromNow(notification.updated_at)}
          </span>
        </div>
        <div
          className={cn(
            "mt-1 text-sm text-muted-foreground line-clamp-2",
            "prose-a:text-primary max-w-none [&>p]:!m-0",
            "[&_a:not(.mention)]:text-primary [&_a:not(.mention)]:underline-offset-4",
            "[&_a:not(.mention)]:hover:underline",
            "[&_.mention]:text-primary [&_.mention]:font-medium",
            "[&_.mention]:bg-primary/10 [&_.mention]:px-1.5 [&_.mention]:py-0.5",
            "[&_.mention]:rounded [&_.mention]:hover:bg-primary/20",
            "[&_*]:!text-sm"
          )}
          dangerouslySetInnerHTML={{ __html: message }}
        />
        {/* <p className="text-sm text-muted-foreground mt-1">{message}</p> */}
      </div>
      {isUnread && (
        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </div>
  );
}
