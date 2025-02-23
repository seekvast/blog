import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Search } from "lucide-react";
// import { useBoard } from "@/hooks/use-board";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Board, Pagination, User } from "@/types";
import Link from "next/link";

interface SettingsProps {
  board: Board;
}

export function MembersSettings({ board }: SettingsProps) {
  const { toast } = useToast();
  const [members, setMembers] = React.useState<Pagination<User>>();
  const [searchQuery, setSearchQuery] = React.useState("");

  // 获取成员列表
  React.useEffect(() => {
    if (!board) return;

    const fetchMembers = async () => {
      try {
        const data = await api.boards.getMembers({
          board_id: board.id,
        });
        console.log(data, "mmm.......");
        setMembers(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "获取成员列表失败",
          description:
            error instanceof Error ? error.message : "服务器错误，请稍后重试",
        });
      }
    };

    fetchMembers();
  }, [board]);

  // 处理搜索
  const filteredMembers = React.useMemo(() => {
    if (!searchQuery) return members;
    const query = searchQuery.toLowerCase();
    return members?.items.filter(
      (member) =>
        member.nickname.toLowerCase().includes(query) ||
        member.username.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">成员管理</h3>
        <div className="relative w-60 rounded-full">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索昵称或账号"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 bg-muted/50 rounded-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        {members?.items.map((member) => (
          <div
            key={member.hashid}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback>{member.username[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{member.username}</div>
                <div className="text-sm text-muted-foreground">
                  @{member.nickname}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div>
                  发帖数:{" "}
                  <span className="text-foreground">{member.posts_count}</span>
                </div>
                <div>
                  回帖数:{" "}
                  <span className="text-foreground">
                    {member.replies_count}
                  </span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href={`/u/${member.hashid}`}>查看个人主页</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    变更身份组
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    禁言
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-destructive">
                    踢出并封禁
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
