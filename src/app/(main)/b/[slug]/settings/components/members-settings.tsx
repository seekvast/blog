import React, { useState, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { ModerationAction } from "@/components/board/moderation-action";
import { ModerationProcessSchema } from "@/validations/moderation";
import { BoardUserRole } from "@/constants/board-user-role";
import { UserRoleBadge } from "@/components/board/user-role-badge";
import { useAuth } from "@/components/providers/auth-provider";
import { usePermission } from "@/hooks/use-permission";
import { BoardPermission } from "@/constants/board-permissions";

interface SettingsProps {
  board: Board;
}

export function MembersSettings({ board }: SettingsProps) {
  const { user } = useAuth();
  const { hasPermission } = usePermission(board);

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
  const [isPending, setIsPending] = useState(false);
  const [action, setAction] = useState(0);
  const isModerator =
    board.board_user &&
    (board.board_user.user_role === BoardUserRole.MODERATOR ||
      board.board_user.user_role === BoardUserRole.CREATOR);
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

  const handleMangerConfirm = async (data: ModerationProcessSchema) => {
    if (!selectedMember) return;

    setIsPending(true);
    try {
      await api.boards.moderation({
        board_id: board.id,
        user_hashid: selectedMember.hashid,
        action: data.act_mode,
        act_explain: data.act_explain,
        reason_desc: data.reason_desc,
        delete_range: data.delete_range,
        mute_days: data.mute_days,
      });

      toast({
        title: "操作成功",
      });
      setIsMangerOpen(false);
      setSelectedMember(null);
      setAction(0);
      fetchMembers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description:
          error instanceof Error ? error.message : "服务器错误，请稍后重试",
      });
    } finally {
      setIsPending(false);
    }
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
            className="flex items-start justify-between py-4 border-b"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback>{member.nickname[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 font-medium">
                  {member.nickname}
                  {/* 身份组徽章 */}
                  <UserRoleBadge 
                    boardUser={{ user_role: member.user_role } as any} 
                    board={board}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  @{member.username}
                </div>
                {/* 调整统计顺序和间距 */}
                <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                  <div>
                    回帖数:{" "}
                    <span className="text-foreground">{member.replies_count}</span>
                  </div>
                  <div>
                    发帖数:{" "}
                    <span className="text-foreground">{member.posts_count}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer">
                    <Link
                      href={`/u/${member.username}?hashid=${member.hashid}`}
                    >
                      查看个人主页
                    </Link>
                            </DropdownMenuItem>
                            
                  {hasPermission(BoardPermission.APPOINT_MODERATOR) && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleChangeRole(member)}
                    >
                      变更身份组
                    </DropdownMenuItem>
                  )}
                  {user && member.hashid !== user.hashid && (
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive"
                      onClick={() => handleManger(member, 4)}
                    >
                      处置
                    </DropdownMenuItem>
                  )}
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

      <ModerationAction
        isOpen={isMangerOpen}
        onOpenChange={setIsMangerOpen}
        onProcess={handleMangerConfirm}
        isPending={isPending}
      />
    </div>
  );
}
