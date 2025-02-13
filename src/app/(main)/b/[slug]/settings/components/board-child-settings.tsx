"use client";

import React from "react";
import { Board, BoardChild } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { CreateChildModal } from "./create-child-modal";

interface BoardChildSettingsProps {
  board: Board;
}

export function BoardChildSettings({ board }: BoardChildSettingsProps) {
  const [boardChildren, setBoardChildren] = React.useState<BoardChild[]>([]);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const { toast } = useToast();

  // 获取子版列表
  const fetchBoardChildren = async () => {
    try {
      const data = await api.boards.getChildren(board.id);
      setBoardChildren(data.items);
    } catch (error) {
      console.error("Error fetching subboards:", error);
      toast({
        title: "错误",
        description: "获取子版列表失败",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    fetchBoardChildren();
  }, [board.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">子版设置</h3>
        <Button
          size="sm"
          className="rounded-full"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          新增子版
        </Button>
      </div>

      <CreateChildModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        parentId={board.id}
        onSuccess={fetchBoardChildren}
      />

      <div className="space-y-2">
        {boardChildren.map((child) => (
          <div
            key={child.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h4 className="text-base font-medium truncate">{child.name}</h4>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>编辑</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>删除</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {boardChildren.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">暂无子版</div>
        )}
      </div>
    </div>
  );
}
