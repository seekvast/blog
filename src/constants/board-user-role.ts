export const BoardUserRole = {
  USER: 3,
  CREATOR: 1,
  MODERATOR: 2,
  1: "创建者",
  2: "管理员",
  3: "普通用户",
} as const;

export const BoardUserRoleMapping = {
  [BoardUserRole.CREATOR]: "创建者",
  [BoardUserRole.MODERATOR]: "管理员",
  [BoardUserRole.USER]: "普通用户",
} as const;

export type BoardUserRoleType =
  (typeof BoardUserRole)[keyof typeof BoardUserRole];
