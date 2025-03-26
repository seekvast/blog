"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Board } from "@/types";

interface BoardItemProps {
  board: Board;
  onJoin?: (boardId: number) => void;
  onLeave?: (boardId: number) => void;
}

export function BoardItem({ board, onJoin, onLeave }: BoardItemProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-4">
        <Link href={`/b/${board.slug}`}>
          <Avatar className="h-14 w-14">
            <AvatarImage src={board.avatar} alt={board.name} />
            <AvatarFallback>{board.name[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link
              href={`/b/${board.slug}`}
              className="text-lg font-medium hover:text-primary"
            >
              {board.name}
            </Link>
            {board.is_nsfw && (
              <Badge variant="destructive" className="h-5">
                成人
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{board.users_count} 位成员</span>
            <span>•</span>
            <span>{board.board_user?.posts_count || 0} 篇讨论</span>
          </div>
          <div className="text-sm text-muted-foreground">{board.desc}</div>
        </div>
      </div>
      <div>
        {board.is_joined ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLeave?.(board.id)}
          >
            已加入
          </Button>
        ) : (
          <Button size="sm" onClick={() => onJoin?.(board.id)}>
            加入
          </Button>
        )}
      </div>
    </div>
  );
}
