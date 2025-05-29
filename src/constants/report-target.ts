export const ReportTarget = {
  DISCUSSION: 1,
  POST: 2,
  BOARD: 3,
  REPLY: 4,
  USER: 5,
} as const;

export const ReportTargetMapping = {
  [ReportTarget.DISCUSSION]: "讨论",
  [ReportTarget.POST]: "帖子",
  [ReportTarget.BOARD]: "看板",
  [ReportTarget.REPLY]: "回复",
  [ReportTarget.USER]: "用户",  
} as const;

// TypeScript 类型定义
export type ReportTargetValue = typeof ReportTarget[keyof typeof ReportTarget]; 