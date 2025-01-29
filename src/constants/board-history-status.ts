export const BoardHistoryStatus = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  BLOCKED: 3,
} as const;

export const BoardHistoryStatusMapping = {
  [BoardHistoryStatus.PENDING]: '待审核',
  [BoardHistoryStatus.APPROVED]: '已通过',
  [BoardHistoryStatus.REJECTED]: '已拒绝',
  [BoardHistoryStatus.BLOCKED]: '已封锁',
} as const;

// 为了TypeScript类型推导，我们也定义一个类型
export type BoardHistoryStatusType = typeof BoardHistoryStatus[keyof typeof BoardHistoryStatus]; 