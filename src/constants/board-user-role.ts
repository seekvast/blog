export const BoardUserRole = {
  USER: 0,
  CREATOR: 1,
  MODERATOR: 2,
} as const;

export const BoardUserRoleMapping = {
  [BoardUserRole.CREATOR]: '创建者',
  [BoardUserRole.MODERATOR]: '管理员',
  [BoardUserRole.USER]: '普通用户',
} as const;

// TypeScript 类型定义
export type BoardUserRoleType = typeof BoardUserRole[keyof typeof BoardUserRole]; 