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
interface BoardSelectProps {
  value?: number;
  onChange?: (value: number) => void;
}

export function BoardSelect({ value, onChange }: BoardSelectProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedBoard = boards.find((board) => board.id === value);
  const debouncedSearch = React.useRef<NodeJS.Timeout>();

  const loadBoards = React.useCallback(
    async (searchName: string, pageNum: number, append = false) => {
      try {
        setLoading(true);
        const queryParams = {
          page: pageNum,
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
    if (isOpen && boards.length === 0) {
      loadBoards("", 1);
    }
  }, [isOpen, boards.length, loadBoards]);

  return (
    <Select
      value={value?.toString()}
      onValueChange={(value) => onChange?.(parseInt(value))}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger className="w-full py-2">
        <SelectValue placeholder="请选择看板">
          {selectedBoard && (
            <div className="flex items-center justify-start gap-2 w-full">
              {/* <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0 bg-gray-100"
                )}
              >
                {selectedBoard.avatar ? (
                  <img
                    src={selectedBoard.avatar}
                    alt={selectedBoard.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  selectedBoard.name.charAt(0)
                )}
              </div> */}
              <span className="truncate">{selectedBoard.name}</span>
            </div>
          )}
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
          {boards.map((board) => (
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
          ))}
          {loading && (
            <div className="py-2 text-center">
              <Loader2 className="w-4 h-4 animate-spin inline-block" />
            </div>
          )}
          {!loading && boards.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              未找到相关看板
            </div>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
