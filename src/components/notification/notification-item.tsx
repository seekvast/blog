"use client";

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Notification } from "@/types";

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
  const message = buildMessage(notification);
  const title = notification.discussion
    ? notification.discussion.title
    : `通知 #${notification.id}`;

  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  return (
    <Link
      href={`/d/${notification.subject_slug}`}
      className={cn("flex items-start gap-2 py-4 px-2")}
      onClick={handleClick}
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
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{notification.from_user.username}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
              locale: zhCN,
            })}
          </span>
        </div>
        <p className="text-sm text-foreground mt-1">{message}</p>
        {notification.discussion && (
          <div className="mt-2 text-xs text-muted-foreground line-clamp-1">
            {title}
          </div>
        )}
      </div>
      {isUnread && (
        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </Link>
  );
}
