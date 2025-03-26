"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Board } from "@/types";
import { User } from "lucide-react";

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
            {board.visibility >= 1 && (
              <>
                <span>私密</span>
                <span>•</span>
              </>
            )}

            <div className="flex items-center">
              <User className="h-4" />
              <span>{board.users_count || 0}</span>
            </div>
            <span>•</span>
            <span>{board.category.name}</span>
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
