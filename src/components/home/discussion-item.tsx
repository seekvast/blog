"use client";

import * as React from "react";
import Link from "next/link";
import { ThumbsUp, MessageSquare, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscussionPreview } from "@/components/post/discussion-preview";
import type { Discussion } from "@/types/discussion";

interface DiscussionItemProps {
  discussion: Discussion;
  displayMode: "grid" | "list";
  isLastItem?: boolean;
}

export const DiscussionItem = React.forwardRef<HTMLElement, DiscussionItemProps>(
  ({ discussion, displayMode, isLastItem }, ref) => {
    return (
      <article
        ref={ref}
        className="py-4 w-full"
      >
        <div className="flex space-x-3 w-full">
          {/* 作者头像 */}
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage
              src={discussion.user.avatar_url}
              alt={discussion.user.username}
            />
            <AvatarFallback>{discussion.user.username[0]}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <h2 className="min-w-0 flex-1 w-0">
                  <Link
                    href={`/discussions/${discussion.slug}`}
                    className="text-xl font-medium text-foreground hover:text-primary line-clamp-1 block w-full overflow-hidden text-ellipsis"
                  >
                    {discussion.title}
                  </Link>
                </h2>
                {discussion.is_private === 1 && (
                  <Badge variant="secondary">私密</Badge>
                )}
                {discussion.is_sticky === 1 && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-600"
                  >
                    置顶
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-1">
              <DiscussionPreview
                content={discussion.main_post.content}
                displayMode={displayMode}
              />
            </div>

            <div className="mt-3 flex items-center space-x-4 text-xs text-center">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <ThumbsUp className="h-4 w-4 text-base cursor-pointer" />
                <span>{discussion.votes}</span>
              </div>
              <Link
                href={`/discussions/${discussion.slug}#comment`}
                className="flex items-center space-x-1 text-muted-foreground"
              >
                <MessageSquare className="h-4 w-4 text-base cursor-pointer" />
                <span>{discussion.comment_count}</span>
              </Link>

              <div className="flex items-center space-x-1 text-muted-foreground">
                <span>{discussion.diff_humans}</span>
              </div>
              <div className="flex items-center space-x-1 text-muted-foreground">
                <span>来自 {discussion.board?.name}</span>{" "}
                <span>#{discussion.board_child?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }
);
