import { useMemo } from "react";
import type { Discussion } from "@/types";
import {
  BoardUserStatus,
  BoardUserStatusMapping,
} from "@/constants/board-user-status";

export const BOARD_USER_STATUS = {
  NORMAL: 1,
  MUTED: 5,
  BANNED: 4,
  KICKED: 6,
} as const;

export type BoardUserStatus =
  (typeof BOARD_USER_STATUS)[keyof typeof BOARD_USER_STATUS];

interface BoardPermission {
  canPost: boolean;
  statusText: string;
  status: number;
}

export function useBoardPermission({
  discussion,
}: {
  discussion?: Discussion;
}): BoardPermission {
  return useMemo(() => {
    if (!discussion) {
      return {
        canPost: false,
        statusText: "加载中...",
        status: BoardUserStatus.PASS,
      };
    }

    const boardUser = discussion.board.board_user;
    if (!boardUser) {
      return {
        canPost: true,
        statusText: "",
        status: BoardUserStatus.PASS,
      };
    }

    const status = boardUser.status;

    // 根据状态判断权限
    switch (status) {
      case BoardUserStatus.PASS:
        return {
          canPost: true,
          statusText: "",
          status,
        };
      case BoardUserStatus.MUTE:
        return {
          canPost: false,
          statusText: BoardUserStatusMapping[BoardUserStatus.MUTE],
          status,
        };
      case BoardUserStatus.BAN:
        return {
          canPost: false,
          statusText: BoardUserStatusMapping[BoardUserStatus.BAN],
          status,
        };
      case BoardUserStatus.KICK_OUT:
        return {
          canPost: false,
          statusText: BoardUserStatusMapping[BoardUserStatus.KICK_OUT],
          status,
        };
      default:
        return {
          canPost: true,
          statusText: "",
          status: BoardUserStatus.PASS,
        };
    }
  }, [discussion]);
}
