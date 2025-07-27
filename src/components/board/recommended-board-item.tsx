"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { Board } from "@/types";
import { BoardActionButton } from "./board-action-button";
import { ReportDialog } from "@/components/report/report-dialog";
import { ReportTarget } from "@/constants/report-target";
import { useState } from "react";

interface RecommendedBoardItemProps {
  board: Board;
  onSubscribeSuccess?: () => void;
}

export function RecommendedBoardItem({
  board,
  onSubscribeSuccess,
}: RecommendedBoardItemProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-2">
      <div className="flex items-center gap-3">
        <Link href={`/b/${board.name}`}>
          <Avatar className="h-8 w-8">
            <AvatarFallback>{board.name[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <Link href={`/b/${board.slug}`} className="text-sm font-medium">
              {board.name}
            </Link>
            {board.is_nsfw === 1 && (
              <Badge variant="destructive" className="h-5">
                成人
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{board.users_count}</span>
          </div>
        </div>
      </div>
      <div onClick={(e) => e.preventDefault()}>
        <BoardActionButton
          board={board}
          onSubscribeSuccess={onSubscribeSuccess}
          setReportToKaterOpen={setReportDialogOpen}
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
