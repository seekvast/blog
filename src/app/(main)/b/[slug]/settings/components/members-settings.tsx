import React, { useState, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Board, Pagination, User } from "@/types";
import Link from "next/link";
import { SearchInput } from "@/components/search/search-input";
import { ChangeRoleDialog } from "@/components/board/change-role-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
interface SettingsProps {
  board: Board;
}

export function MembersSettings({ board }: SettingsProps) {
  const { toast } = useToast();
  const [members, setMembers] = React.useState<Pagination<User>>();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);
  const [isMuteOpen, setIsMuteOpen] = useState(false);
  const [isMangerOpen, setIsMangerOpen] = useState(false);
  const [action, setAction] = useState(0);
  // 展开搜索框
  const expandSearch = () => {
    setIsSearchExpanded(true);
    // 使用 setTimeout 确保 DOM 更新后再聚焦
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  // 收起搜索框
  const collapseSearch = () => {
    setIsSearchExpanded(false);
    setSearchQuery("");
    handleSearch("");
  };

  // 获取成员列表
  React.useEffect(() => {
    if (!board) return;
    fetchMembers();
  }, [board]);

  const fetchMembers = async () => {
    try {
      const data = await api.boards.getMembers({
        board_id: board.id,
      });
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

  const handleSearch = async (value: string) => {
    setIsSearching(true);
    try {
      const data = await api.boards.getMembers({
        board_id: board.id,
        keyword: value,
      });
      setMembers(data);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMuteConfirm = () => {
    if (!selectedMember) return;
    api.boards.manageUser({
      board_id: board.id,
      user_hashid: selectedMember.hashid,
      action: 2,
    });
    toast({
      title: "禁言成功",
    });
    setIsMuteOpen(false);
    fetchMembers();
  };

  const handleChangeRole = (member: User) => {
    setSelectedMember(member);
    setIsChangeRoleOpen(true);
  };

  const handleMute = (member: User) => {
    setSelectedMember(member);
    setIsMuteOpen(true);
  };

  const handleManger = (member: User, action: number) => {
    setSelectedMember(member);
    setAction(action);
    setIsMangerOpen(true);
  };

  const handleMangerConfirm = () => {
    if (!selectedMember) return;
    api.boards.manageUser({
      board_id: board.id,
      user_hashid: selectedMember.hashid,
      action: action,
    });
    toast({
      title: "操作成功",
    });
    setIsMangerOpen(false);
    setSelectedMember(null);
    setAction(0);
    fetchMembers();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">成员管理</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="依昵称或账号搜索"
              className="w-full md:w-auto"
            />
          </div>
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
                    <Link href={`/u/${member.username}?hash=${member.hashid}`}>
                      查看个人主页
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => handleChangeRole(member)}
                  >
                    变更身份组
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => handleManger(member, 2)}
                  >
                    禁言
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive"
                    onClick={() => handleManger(member, 3)}
                  >
                    踢出并封禁
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {selectedMember && (
        <ChangeRoleDialog
          open={isChangeRoleOpen}
          onOpenChange={setIsChangeRoleOpen}
          boardId={board.id}
          userId={selectedMember.hashid}
          currentRole={selectedMember.user_role || 0}
          onSuccess={fetchMembers}
        />
      )}

      <ConfirmDialog
        open={isMangerOpen}
        onOpenChange={setIsMangerOpen}
        title={action === 2 ? "禁言" : "踢出并封禁"}
        description={
          action === 2 ? "确定要禁言该成员吗？" : "确定要踢出并封禁该成员吗？"
        }
        onConfirm={handleMangerConfirm}
      />
    </div>
  );
}
