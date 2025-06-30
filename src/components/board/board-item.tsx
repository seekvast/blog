"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserRound } from "lucide-react";
import { Board } from "@/types";
import { BoardActionButton } from "./board-action-button";
import { ReportDialog } from "@/components/report/report-dialog";
import { useBoardActions } from "@/hooks/use-board-actions";
import { ReportTarget } from "@/constants/report-target";

interface BoardItemProps {
  board: Board;
  onBlockSuccess?: () => void;
  onSubscribeSuccess?: () => void;
}

export function BoardItem({ board, onBlockSuccess, onSubscribeSuccess }: BoardItemProps) {
  const { reportDialogOpen, setReportDialogOpen } = useBoardActions();

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-4">
        <Link href={`/b/${board.slug}`}>
          <Avatar className="h-14 w-14">
            <AvatarImage src={board.avatar} alt={board.name} />
            <AvatarFallback>{board.name[0].toUpperCase()}</AvatarFallback>
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
            {board.is_nsfw === 1 && (
              <Badge variant="destructive" className="h-5">
                成人
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{board.visibility >= 1 ? "私密" : "公開"}</span>
            <span>•</span>

            <div className="flex items-center">
              <UserRound className="h-4" />
              <span>{board.users_count || 0}</span>
            </div>
            <span>•</span>
            <span>{board.category.name}</span>
          </div>
          <div className="text-sm text-muted-foreground">{board.desc}</div>
        </div>
      </div>
      <div>
        <BoardActionButton
          board={board}
          setReportToKaterOpen={setReportDialogOpen}
          onSubscribeSuccess={onSubscribeSuccess}
          onBlockSuccess={onBlockSuccess}
        />
      </div>

      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        title="向Kater檢舉"
        form={{
          user_hashid: board.creator_hashid,
          board_id: board.id,
          target: ReportTarget.BOARD,
          reported_to: "admin",
        }}
      />
    </div>
  );
}
