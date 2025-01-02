import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// 模拟板块数据
const BOARDS = [
  { id: 1, name: "二次元NSFW", icon: "二", color: "bg-green-200" },
  { id: 2, name: "政治", icon: "政", color: "bg-pink-200" },
  { id: 3, name: "网站建议与回报", icon: "网", color: "bg-pink-200" },
  { id: 4, name: "废除专用看板", icon: "废", color: "bg-purple-200" },
];

interface BoardSelectProps {
  value?: number;
  onChange?: (value: number) => void;
}

export function BoardSelect({ value, onChange }: BoardSelectProps) {
  const [search, setSearch] = React.useState("");
  const selectedBoard = BOARDS.find((board) => board.id === value);

  const filteredBoards = BOARDS.filter((board) =>
    board.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <span
          className="text-base font-normal justify-start h-auto py-2"
        >
          {selectedBoard ? (
            <span className="flex items-center gap-2 text-xs cursor-pointer">
              {selectedBoard.name}
            </span>
          ) : (
            "请选择看板"
          )}
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-normal">選擇看板</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="請輸入看板名稱"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button className="bg-blue-500 hover:bg-blue-600">搜尋</Button>
        </div>
        <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto">
          {filteredBoards.map((board) => (
            <button
              key={board.id}
              className="flex items-center gap-3 w-full hover:bg-gray-100 p-2 rounded-lg"
              onClick={() => {
                onChange?.(board.id);
                const closeEvent = new CustomEvent("close-dialog");
                document.dispatchEvent(closeEvent);
              }}
            >
              <span
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${board.color}`}
              >
                {board.icon}
              </span>
              <div className="text-left">
                <div className="font-medium">{board.name}</div>
                {board.description && (
                  <div className="text-sm text-gray-500">
                    {board.description}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
