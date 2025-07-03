import { useSession } from "next-auth/react";
import { BoardUserRole } from "@/constants/board-user-role";
import { BoardPermission, ROLE_PERMISSIONS } from "@/constants/board-permissions";
import { Board } from "@/types";
import { Discussion } from "@/types/discussion";

export function usePermission(board?: Board, discussion?: Discussion) {
  const { data: session } = useSession();
  const userRole = board?.board_user?.user_role || BoardUserRole.USER;
  const isAuthor = discussion ? session?.user?.hashid === discussion.user.hashid : false;
  
  /**
   * 检查用户是否拥有特定权限
   * @param permission 要检查的权限
   * @returns 是否拥有权限
   */
  const hasPermission = (permission: BoardPermission): boolean => {
    if (!session?.user) return false;
    
    // 特殊处理：作者权限
    if (isAuthor) {
      if (permission === BoardPermission.EDIT_OWN_DISCUSSION || 
          permission === BoardPermission.DELETE_OWN_DISCUSSION) {
        return true;
      }
    }
    
    // 检查用户角色是否有该权限
    return ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS]?.includes(permission) || false;
  };
  
  return { hasPermission, isAuthor };
}
