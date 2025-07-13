import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";
import Link from "next/link";

interface Board {
  slug: string;
  name: string;
  avatar: string;
  category: { name: string };
}

interface SearchSuggestionsProps {
  histories: string[];
  hotBoards?: Board[];
  onSearchItemClick: (search: string) => void;
  onClearHistories: () => void;
  onBoardClick?: (board: Board) => void;
  variant: "mobile" | "popover"; // 控制不同变体的样式
}

export function SearchSuggestions({
  histories,
  hotBoards,
  onSearchItemClick,
  onClearHistories,
  onBoardClick,
  variant = "popover",
}: SearchSuggestionsProps) {
  // 根据变体设置不同样式
  const isMobile = variant === "mobile";

  return (
    <>
      {/* 最近搜索 */}
      {histories.length > 0 && (
        <div className={isMobile ? "mb-6" : "mb-4"}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`${isMobile ? "text-base" : "text-sm"} font-medium`}>
              最近搜索
            </h3>
            {histories.length > 0 && (
              <button
                type="button"
                onClick={onClearHistories}
                className={`${
                  isMobile ? "text-sm" : "text-xs"
                } text-muted-foreground hover:text-foreground`}
              >
                清除
              </button>
            )}
          </div>
          {histories.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {histories.map((search, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex justify-center py-2 cursor-pointer hover:bg-secondary/80"
                  style={{
                    width: "fit-content",
                    maxWidth: "180px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                  }}
                  title={search}
                  onClick={() => onSearchItemClick(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 热门看板 */}
      {hotBoards && hotBoards.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">热门看板</h3>
          <div className="grid grid-cols-3 gap-3">
            {hotBoards.map((board, index) => (
              <div
                key={index}
                className="rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() =>
                  onBoardClick
                    ? onBoardClick(board)
                    : onSearchItemClick(board.name)
                }
              >
                <div className="flex flex-col items-center gap-2">
                  <Link
                    href={`/b/${board.slug}`}
                    className="flex flex-col items-center gap-2"
                  >
                    <Avatar className="h-16 w-16 flex-shrink-0">
                      <AvatarImage src={board.avatar} alt={board.name} />
                      <AvatarFallback>
                        {board.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="text-center">
                    <h4 className="max-w-[120px] font-medium text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                      {board.name}
                    </h4>
                    <div
                      className={`flex items-center justify-center text-xs text-muted-foreground mt-1`}
                    >
                      <div className="flex items-center">
                        <UserRound className="h-4 w-4" />
                        <span>{0}成员</span>
                      </div>
                      {board.category && (
                        <>
                          <span className="mx-1">·</span>
                          <span>{board.category?.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
