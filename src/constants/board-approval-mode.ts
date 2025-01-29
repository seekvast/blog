export const BoardApprovalMode = {
  NONE: 0,
  AUTO: 1,
  APPROVAL: 2,
} as const;

export const BoardApprovalModeMapping = {
  [BoardApprovalMode.NONE]: '直接加入',
  [BoardApprovalMode.AUTO]: '自动',
  [BoardApprovalMode.APPROVAL]: '管理员审核',
} as const;

// TypeScript 类型定义
export type BoardApprovalModeType = typeof BoardApprovalMode[keyof typeof BoardApprovalMode]; 