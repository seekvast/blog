"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { UserLink } from "@/components/markdown/user-link";

interface User {
  hashid: string;
  username: string;
  nickname: string;
  avatar_url: string;
}

interface Comment {
  user: User;
  content: string;
}

interface ReplyReferenceProps {
  comment: Comment;
  onClose: () => void;
}

export function ReplyReference({ comment, onClose }: ReplyReferenceProps) {
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex items-start gap-2 border-b bg-muted/30 px-3 py-2 text-sm">
      <div className="flex-1">
        回复 <UserLink href={`/users/${comment.user.hashid}`}>{comment.user.nickname}</UserLink>：
        <div className="mt-1 line-clamp-1 text-muted-foreground">
          {comment.content}
        </div>
      </div>
      <button
        type="button"
        onClick={handleClose}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        title="取消回复"
      >
        <Icon name="close" className="text-base" />
      </button>
    </div>
  );
}
