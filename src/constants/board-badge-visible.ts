export const BoardBadgeVisible = {
  NONE: 0,
  CREATOR: 1,
  MODERATOR: 2,
} as const;

export const BoardBadgeVisibleMapping = {
  [BoardBadgeVisible.NONE]: '不可见',
  [BoardBadgeVisible.CREATOR]: '创建者',
  [BoardBadgeVisible.MODERATOR]: '管理员',
} as const;

// TypeScript 类型定义
export type BoardBadgeVisibleType = typeof BoardBadgeVisible[keyof typeof BoardBadgeVisible]; 