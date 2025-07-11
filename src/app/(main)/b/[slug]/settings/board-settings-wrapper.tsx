"use client";

import React, { useState } from "react";
import { Board } from "@/types";
import { BoardSettingsForm } from "./board-settings-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BoardSettingsWrapperProps {
  initialBoard: Board;
  onRevalidate: () => Promise<void>;
}

export function BoardSettingsWrapper({
  initialBoard,
  onRevalidate,
}: BoardSettingsWrapperProps) {
  const [board, setBoard] = useState<Board>(initialBoard);

  const handleSuccess = async (updatedBoard: Board) => {
    // 更新本地状态
    setBoard(updatedBoard);
    // 调用 Server Action 重新验证页面
    await onRevalidate();
  };

  return (
    <div className="pt-2">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 flex-shrink-0">
            <AvatarImage src={board.avatar} alt={board.name} />
            <AvatarFallback>{board.name[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{board.name}</h1>
            <div className="text-sm text-muted-foreground mt-1 flex items-center flex-wrap">
              <span>{board.visibility >= 1 ? "私密" : "公開"}</span>

              <span className="mx-1.5">·</span>
              <span>{board.users_count} 成員</span>
              {board.category && (
                <>
                  <span className="mx-1.5">·</span>
                  <span>{board.category.name}</span>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              {board.desc}
            </p>
          </div>
        </div>
      </div>

      <hr className="my-4" />

      <BoardSettingsForm board={board} onSuccess={handleSuccess} />
    </div>
  );
}
