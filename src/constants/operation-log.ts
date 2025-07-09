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

// 操作分类映射
export const OPERATION_CATEGORY_MAPPING = {
  [OPERATION_CATEGORIES.USER]: "用户",
  [OPERATION_CATEGORIES.BOARD]: "看板",
  [OPERATION_CATEGORIES.BOARD_RULE]: "看板规则",
  [OPERATION_CATEGORIES.BOARD_CHILD]: "子看板",
  [OPERATION_CATEGORIES.DISCUSSION]: "文章",
  [OPERATION_CATEGORIES.POST]: "评论",
} as const;

// 操作行为映射
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

// 操作类型分类
export const OPERATION_TYPE_CATEGORIES = {
  USER_MANAGEMENT: "user_management",
  BOARD_MANAGEMENT: "board_management",
  BOARD_CHILD_MANAGEMENT: "board_child_management",
  RULE_MANAGEMENT: "rule_management",
  CONTENT_MODERATION: "content_moderation",
  OTHER: "other",
} as const;

// 操作类型分类映射
export const OPERATION_TYPE_MAPPING = {
  [OPERATION_TYPE_CATEGORIES.USER_MANAGEMENT]: "用户管理",
  [OPERATION_TYPE_CATEGORIES.BOARD_MANAGEMENT]: "看板管理",
  [OPERATION_TYPE_CATEGORIES.BOARD_CHILD_MANAGEMENT]: "子版管理",
  [OPERATION_TYPE_CATEGORIES.RULE_MANAGEMENT]: "规则管理",
  [OPERATION_TYPE_CATEGORIES.CONTENT_MODERATION]: "内容审核",
  [OPERATION_TYPE_CATEGORIES.OTHER]: "其他操作",
} as const;

// 获取操作类型分类
export function getOperationTypeCategory(category: string): string {
  switch (category) {
    case OPERATION_CATEGORIES.USER:
      return OPERATION_TYPE_CATEGORIES.USER_MANAGEMENT;
    case OPERATION_CATEGORIES.BOARD:
      return OPERATION_TYPE_CATEGORIES.BOARD_MANAGEMENT;
    case OPERATION_CATEGORIES.BOARD_CHILD:
      return OPERATION_TYPE_CATEGORIES.BOARD_CHILD_MANAGEMENT;
    case OPERATION_CATEGORIES.BOARD_RULE:
      return OPERATION_TYPE_CATEGORIES.RULE_MANAGEMENT;
    case OPERATION_CATEGORIES.DISCUSSION:
    case OPERATION_CATEGORIES.POST:
      return OPERATION_TYPE_CATEGORIES.CONTENT_MODERATION;
    default:
      return OPERATION_TYPE_CATEGORIES.OTHER;
  }
}

// 生成翻译键
export function getOperationLogTranslationKey(
  category: string,
  action: string
): string {
  return `operationLogs.${category}.${action}`;
}

// 类型定义
export type OperationCategory =
  (typeof OPERATION_CATEGORIES)[keyof typeof OPERATION_CATEGORIES];
export type OperationAction =
  (typeof OPERATION_ACTIONS)[keyof typeof OPERATION_ACTIONS];
export type OperationTypeCategory =
  (typeof OPERATION_TYPE_CATEGORIES)[keyof typeof OPERATION_TYPE_CATEGORIES];
