export const ReportTarget = {
  POST: 1,
  BOARD: 2,
  REPLY: 3,
} as const;

export const ReportTargetMapping = {
  [ReportTarget.POST]: '帖子',
  [ReportTarget.BOARD]: '看板',
  [ReportTarget.REPLY]: '回复',
} as const;

// TypeScript 类型定义
export type ReportTargetValue = typeof ReportTarget[keyof typeof ReportTarget]; 