import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { QueryParams } from "@/types/common";
import { Board } from "@/types/board";
import { BoardVisibility } from "@/constants/board-visibility";

interface BoardSelectProps {
  value?: number;
  onChange?: (value: number) => void;
  ref?: React.ForwardedRef<{ reset: () => void }>;
}

export const BoardSelect = React.forwardRef<
  { reset: () => void },
  BoardSelectProps
>(function BoardSelect({ value, onChange }, ref) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [selectedBoard, setSelectedBoard] = React.useState<Board | undefined>(
    undefined
  );
  const debouncedSearch = React.useRef<NodeJS.Timeout>();
  React.useEffect(() => {
    if (value) {
      const board = boards.find((board) => board.id === value);
      setSelectedBoard(board);
    }
  }, [value, boards, loading]);
  // 加载看板列表
  const loadBoards = React.useCallback(
    async (searchName: string, pageNum: number, append = false) => {
      try {
        setLoading(true);
        const queryParams = {
          page: pageNum,
          per_page: 100,
          visibility: BoardVisibility.PUBLIC,
          name: "",
        };
        if (searchName) queryParams.name = searchName;

        const data = await api.boards.list(queryParams);

        if (data.items.length > 0) {
          setBoards((prev) => (append ? [...prev, ...data.items] : data.items));
          setHasMore(pageNum < data.last_page);
        }
      } catch (error) {
        console.error("Failed to load boards:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (debouncedSearch.current) {
      clearTimeout(debouncedSearch.current);
    }
    debouncedSearch.current = setTimeout(() => {
      setPage(1);
      loadBoards(value, 1);
    }, 300);
  };

  // 处理滚动加载
  const handleScroll = React.useCallback(() => {
    if (containerRef.current && !loading && hasMore) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        setPage((prev) => prev + 1);
        loadBoards(searchQuery, page + 1, true);
      }
    }
  }, [loading, hasMore, searchQuery, page, loadBoards]);

  // 只在打开选择器时加载看板列表
  React.useEffect(() => {
    if (boards.length === 0 && !loading) {
      loadBoards("", 1);
    }
  }, [boards.length, loading, loadBoards]);

  // 暴露重置方法
  React.useImperativeHandle(ref, () => ({
    reset: () => {
      setBoards([]);
      setSearchQuery("");
      setPage(1);
      setHasMore(true);
      setSelectedBoard(undefined);
    },
  }));

  return (
    <Select
      value={value?.toString()}
      onValueChange={(value) => onChange?.(parseInt(value))}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger className="w-full py-2">
        <SelectValue placeholder="请选择看板">
          {(value !== undefined && selectedBoard) || value === undefined ? (
            <div className="flex items-center justify-start gap-2 w-full">
              <span className="truncate">
                {selectedBoard?.name || "请选择看板"}
              </span>
            </div>
          ) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="sticky top-0 bg-popover px-2 py-2 border-b">
          <Input
            placeholder="搜索看板..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <SelectGroup
          className="p-2 max-h-[300px] overflow-auto scrollbar-none"
          ref={containerRef}
          onScroll={handleScroll}
        >
          {loading && boards.length === 0 ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">加载中...</span>
            </div>
          ) : boards.length > 0 ? (
            boards.map((board) => (
              <SelectItem
                key={board.id}
                value={board.id.toString()}
                className="flex items-center justify-start gap-2 py-2 pl-2 pr-8 rounded-sm cursor-pointer"
              >
                <div className="flex items-center justify-start gap-2 w-full">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0 bg-gray-100"
                    )}
                  >
                    {board.avatar ? (
                      <img
                        src={board.avatar}
                        alt={board.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      board.name.charAt(0)
                    )}
                  </div>
                  <span className="truncate">{board.name}</span>
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              未找到相关看板
            </div>
          )}
          {loading && boards.length > 0 && (
            <div className="py-2 text-center">
              <Loader2 className="w-4 h-4 animate-spin inline-block" />
            </div>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
});
