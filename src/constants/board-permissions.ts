import { BoardUserRole } from "./board-user-role";

export enum BoardPermission {
  // 看板基础操作权限
  DELETE_BOARD = "delete_board", // 删除看板
  VISIT_SETTINGS = "visit_settings", // 访问看板设置
  TRANSFER_OWNERSHIP = "transfer_ownership", // 转让创建者权限
  APPOINT_MODERATOR = "appoint_moderator", // 指派其他人为管理员
  LEAVE_BOARD = "leave_board", // 退出看板

  // 贴文操作权限
  EDIT_OWN_DISCUSSION = "edit_own_discussion", // 编辑自己的贴文
  DELETE_OWN_DISCUSSION = "delete_own_discussion", // 删除自己的贴文
  MOVE_DISCUSSION = "move_discussion", // 移动贴文到其他子版
  PIN_DISCUSSION = "pin_discussion", // 置顶贴文
  DELETE_DISCUSSION = "delete_discussion", // 删除贴文
  CLOSE_REPLY = "close_reply", // 关闭/开启回复功能

  // 看板设置权限
  BOARD_SETTINGS = "board_settings", // 基础设置
  MEMBERS_SETTINGS = "members_settings", // 成员设置
  REPORTS_SETTINGS = "reports_settings", // 报告设置

  // 用户管理权限
  KICK_USER = "kick_user", // 踢出用户
  BAN_USER = "ban_user", // 禁言用户
  BLOCK_USER = "block_user", // 封鎖名單

  //看板管理菜单
  BOARD_BASE = "board_base",
  BOARD_MANAGE = "board_manage",
}

// 权限映射表
export const ROLE_PERMISSIONS = {
  [BoardUserRole.CREATOR]: [
    // 创建者拥有所有权限
    BoardPermission.DELETE_BOARD,
    BoardPermission.VISIT_SETTINGS,
    BoardPermission.BOARD_SETTINGS,
    BoardPermission.MEMBERS_SETTINGS,
    BoardPermission.REPORTS_SETTINGS,
    BoardPermission.TRANSFER_OWNERSHIP,
    BoardPermission.APPOINT_MODERATOR,
    BoardPermission.EDIT_OWN_DISCUSSION,
    BoardPermission.DELETE_OWN_DISCUSSION,
    BoardPermission.MOVE_DISCUSSION,
    BoardPermission.PIN_DISCUSSION,
    BoardPermission.DELETE_DISCUSSION,
    BoardPermission.CLOSE_REPLY,
    BoardPermission.KICK_USER,
    BoardPermission.BAN_USER,
    BoardPermission.BLOCK_USER,
    BoardPermission.BOARD_BASE,
    BoardPermission.BOARD_MANAGE,
  ],
  [BoardUserRole.MODERATOR]: [
    // 管理员(版主)权限
    BoardPermission.VISIT_SETTINGS,
    BoardPermission.MOVE_DISCUSSION,
    BoardPermission.PIN_DISCUSSION,
    BoardPermission.DELETE_DISCUSSION,
    BoardPermission.MEMBERS_SETTINGS,
    BoardPermission.CLOSE_REPLY,
    BoardPermission.KICK_USER,
    BoardPermission.BAN_USER,
    BoardPermission.BLOCK_USER,
    BoardPermission.BOARD_MANAGE,
  ],
  [BoardUserRole.USER]: [
    // 普通用户权限
    BoardPermission.LEAVE_BOARD,
    BoardPermission.EDIT_OWN_DISCUSSION,
    BoardPermission.DELETE_OWN_DISCUSSION,
  ],
};
