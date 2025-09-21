// 操作分类 - 对应后端 OperationCategory
export const OPERATION_CATEGORIES = {
  USER: "user",
  BOARD: "board",
  BOARD_CHILD: "board_child",
  BOARD_RULE: "board_rule",
  DISCUSSION: "discussion",
  POST: "post",
} as const;

// 操作行为 - 对应后端 OperationAction
export const OPERATION_ACTIONS = {
  DELETE: "delete",
  UPDATE: "update",
  CREATE: "create",
  APPROVE: "approve",
  RESTRICT: "restrict",
  WARN: "warn",
  MUTE: "mute",
  UNMUTE: "unmute",
  BAN: "ban",
  UNBAN: "unban",
  KICK: "kick",
  AGE_VERIFY: "age_verify",
  ROLE: "role",
  UPDATE_DEFAULT: "update_default",
  UNSET_DEFAULT: "unset_default",
  UPDATE_MODERATOR_ONLY: "update_moderator_only",
  UNSET_MODERATOR_ONLY: "unset_moderator_only",
  UPDATE_HIDDEN: "update_hidden",
  UNHIDE: "unhide",
  REQUEST_DELETE: "request_delete",
  CANCEL_DELETE: "cancel_delete",
  RESTORE: "restore",
  RENAME: "rename",
} as const;

export const OPERATION_CATEGORY_MAPPING = {
  [OPERATION_CATEGORIES.USER]: "用户",
  [OPERATION_CATEGORIES.BOARD]: "看板",
  [OPERATION_CATEGORIES.BOARD_RULE]: "看板规则",
  [OPERATION_CATEGORIES.BOARD_CHILD]: "子板",
  [OPERATION_CATEGORIES.DISCUSSION]: "文章",
  [OPERATION_CATEGORIES.POST]: "评论",
} as const;

export const OPERATION_ACTION_MAPPING = {
  [OPERATION_ACTIONS.DELETE]: "删除",
  [OPERATION_ACTIONS.UPDATE]: "修改",
  [OPERATION_ACTIONS.CREATE]: "创建",
  [OPERATION_ACTIONS.APPROVE]: "审核",
  [OPERATION_ACTIONS.RESTRICT]: "受限",
  [OPERATION_ACTIONS.WARN]: "警告",
  [OPERATION_ACTIONS.MUTE]: "禁言",
  [OPERATION_ACTIONS.UNMUTE]: "解除禁言",
  [OPERATION_ACTIONS.BAN]: "封禁",
  [OPERATION_ACTIONS.UNBAN]: "解除封禁",
  [OPERATION_ACTIONS.KICK]: "踢出",
  [OPERATION_ACTIONS.AGE_VERIFY]: "年龄认证",
  [OPERATION_ACTIONS.ROLE]: "角色变更",
  [OPERATION_ACTIONS.UPDATE_DEFAULT]: "默认设置",
  [OPERATION_ACTIONS.UNSET_DEFAULT]: "取消默认",
  [OPERATION_ACTIONS.UPDATE_MODERATOR_ONLY]: "管理员专属",
  [OPERATION_ACTIONS.UNSET_MODERATOR_ONLY]: "取消管理员专属",
  [OPERATION_ACTIONS.UPDATE_HIDDEN]: "隐藏设置",
  [OPERATION_ACTIONS.UNHIDE]: "取消隐藏",
  [OPERATION_ACTIONS.REQUEST_DELETE]: "请求删除",
  [OPERATION_ACTIONS.CANCEL_DELETE]: "取消删除",
  [OPERATION_ACTIONS.RESTORE]: "恢复",
  [OPERATION_ACTIONS.RENAME]: "重命名",
} as const;

// 生成翻译键
export function getOperationLogTranslationKey(
  category: string,
  action: string
): string {
  return `${category}.${action}`;
}

// 类型定义
export type OperationCategory =
  (typeof OPERATION_CATEGORIES)[keyof typeof OPERATION_CATEGORIES];
export type OperationAction =
  (typeof OPERATION_ACTIONS)[keyof typeof OPERATION_ACTIONS];
